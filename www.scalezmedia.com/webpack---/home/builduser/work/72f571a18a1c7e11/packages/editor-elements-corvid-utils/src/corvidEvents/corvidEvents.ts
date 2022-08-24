import type {
  ICleanedCorvidEvent,
  ICorvidMouseEvent,
  ICorvidEvent,
  ICorvidKeyboardEvent,
  ICorvidSelector,
  CorvidSDKApi,
  SdkInstance,
  IComponentEvent,
  CorvidEventHandler,
  ICorvidEventHandler,
  CorvidMouseEventPayload,
  CorvidKeyboardEventPayload,
} from '@wix/editor-elements-types/corvid';
import { createCompSchemaValidator } from '../validations';
import { EVENT_TYPES_MAP } from './eventTypes';

interface EventHandler {
  eventName: string;
  compId: string;
  unregister: Function;
  cb: (event: any, $w: ICorvidSelector) => void;
}

const reactToCorvidEventType: Record<string, string | undefined> = {
  dblclick: 'dblClick',
  keydown: 'keyPress',
  input: 'onInput',
};

export const convertToCorvidEventBase = (
  event: ICorvidEvent<string, any>,
): ICorvidEvent<string> => {
  const { target, type, context } = event;

  return { target, type: reactToCorvidEventType[type] ?? type, context };
};

export const convertToCorvidMouseEvent = (
  event: ICleanedCorvidEvent<React.MouseEvent>,
): CorvidMouseEventPayload => {
  const { clientX, clientY, pageX, pageY, screenX, screenY, nativeEvent } =
    event;

  const { offsetX, offsetY } = nativeEvent;

  return {
    clientX,
    clientY,
    pageX,
    pageY,
    screenX,
    screenY,
    offsetX,
    offsetY,
  };
};

export const convertToCorvidKeyboardEvent = (
  event: ICleanedCorvidEvent<React.KeyboardEvent>,
): CorvidKeyboardEventPayload => {
  const { altKey, ctrlKey, key, metaKey, shiftKey } = event;

  return {
    key,
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
  };
};

const functionValidator = (
  value: Function,
  eventName: string,
  role: string,
) => {
  return createCompSchemaValidator(role)(
    value,
    {
      type: ['function'],
    },
    eventName,
  );
};

const eventNameMapToMethodName: Record<string, string> = {
  onMouseEnter: 'onMouseIn',
  onMouseLeave: 'onMouseOut',
};

const removeOnPrefix = (st: string) => st.replace(/^on/i, '');

const mapMethodNameToEventName = (methodName: string): string => {
  const mapEntry = Object.entries(eventNameMapToMethodName).find(
    ([_, value]) =>
      removeOnPrefix(value.toLowerCase()) ===
      removeOnPrefix(methodName.toLowerCase()),
  );

  return mapEntry?.[0] ?? methodName;
};

const createEventListenerState = (api: CorvidSDKApi<any, any>) => {
  return api.createSdkState<{ listeners: Array<EventHandler> }>(
    { listeners: [] },
    'eventListeners',
  );
};

/**
 * Function that registers corvid event handler by forwarding callback prop to component.
 * 1. Validating user callback.
 * 2. Returning sdk instance.
 * 3. Passing $w selector as second argument of consumers callback.
 * 4. Includes platform metadata for consumers event object: target, context.
 * @param eventName - the name of the callback that will be passed to component.
 * @param api - corvid sdk api object.
 * @param cb - consumers callback function.
 * @param projection - (optional) - In case additional fields from component event is required then this function
 * can be used to add those fields. Function provides incoming `componentEvent` and expects a return for corvid event.
 */

type InferEventType<T> = T extends IComponentEvent<infer P> ? P : never;
export const registerCorvidEvent = <
  TComponentEvent extends IComponentEvent<any>,
  TCorvidEvent extends ICorvidEvent<InferEventType<TComponentEvent>>,
  TPayload extends Record<string, unknown> = {},
>(
  eventName: string,
  api: CorvidSDKApi<any, any>,
  cb: (event: TCorvidEvent, $w: ICorvidSelector) => void,
  projection?: ({
    componentEvent,
    eventPayload,
  }: {
    componentEvent: TComponentEvent;
    eventPayload?: TPayload;
  }) => Omit<TCorvidEvent, 'type' | 'target' | 'context'>,
): SdkInstance => {
  const { create$w, createEvent, registerEvent, getSdkInstance, metaData } =
    api;
  const setterName = eventNameMapToMethodName[eventName] ?? eventName;
  if (!functionValidator(cb, setterName, metaData.role)) {
    return getSdkInstance();
  }

  const [eventListenerState, setEventListenerState] =
    createEventListenerState(api);

  const unregisterEvent = registerEvent<TComponentEvent>(
    eventName,
    /**
     * `eventPayload` adds extra data into native React events
     * which will be sanitized by the platform
     */
    (event: TComponentEvent, eventPayload?: TPayload) => {
      const baseEvent = createEvent({ type: event.type, compId: event.compId });
      const $w = create$w({ context: baseEvent.context as any });

      const projectionEvent = projection?.({
        componentEvent: event,
        eventPayload,
      });

      cb(
        {
          ...convertToCorvidEventBase(baseEvent),
          ...projectionEvent,
        } as TCorvidEvent,
        $w,
      );
    },
  );

  const listener: EventHandler = {
    eventName,
    compId: metaData.compId,
    cb,
    unregister: unregisterEvent,
  };

  setEventListenerState({
    listeners: [...eventListenerState.listeners, listener],
  });

  return getSdkInstance();
};

const isEventNameMatches = (
  eventName: string,
  userRequestedEventNameOrActionType: string,
) => {
  const targetEventName = mapMethodNameToEventName(
    EVENT_TYPES_MAP[userRequestedEventNameOrActionType] ??
      userRequestedEventNameOrActionType,
  );
  return eventName.toLowerCase() === targetEventName.toLowerCase();
};

export const unregisterCorvidEvent = (
  eventNameOrActionType: string,
  api: CorvidSDKApi<any, any>,
  cb: CorvidEventHandler,
): SdkInstance => {
  const { metaData, getSdkInstance } = api;

  const [eventListenerState, setEventListenerState] =
    createEventListenerState(api);

  const eventListeners = eventListenerState.listeners.filter(
    listener =>
      isEventNameMatches(listener.eventName, eventNameOrActionType) &&
      listener.cb === cb &&
      listener.compId === metaData.compId,
  );

  for (const listener of eventListeners) {
    listener.unregister();
  }

  setEventListenerState({
    listeners: eventListenerState.listeners.filter(
      listener => !eventListeners.includes(listener),
    ),
  });

  return getSdkInstance();
};

/**
 * Function that registers corvid keyboard event handler by forwarding callback prop to component.
 * 1. Validating user callback.
 * 2. Returning sdk instance.
 * 3. Passing $w selector as second argument of consumers callback.
 * 4. Includes platform metadata for consumers event object: target, context.
 * 5. Extracts required keyboard event fields from the React synthetic event.
 * @param eventName - the name of the callback that will be passed to component.
 * @param api - corvid sdk api object.
 * @param cb - consumers callback function.
 * @param payloadProjection - transformation for provided custom payload.
 */
export const registerCorvidKeyboardEvent = <
  TPayload extends Record<string, unknown> = {},
>(
  eventName: string,
  api: CorvidSDKApi<any, any>,
  cb: ICorvidEventHandler<ICorvidKeyboardEvent>,
  payloadProjection?: (payload: TPayload) => Record<string, unknown>,
) =>
  registerCorvidEvent<
    ICleanedCorvidEvent<React.KeyboardEvent>,
    ICorvidKeyboardEvent,
    TPayload
  >(eventName, api, cb, ({ componentEvent, eventPayload }) => ({
    ...convertToCorvidKeyboardEvent(componentEvent),
    ...(eventPayload && payloadProjection?.(eventPayload)),
  }));

/**
 * Function that registers corvid mouse event handler by forwarding callback prop to component.
 * 1. Validating user callback.
 * 2. Returning sdk instance.
 * 3. Passing $w selector as second argument of consumers callback.
 * 4. Includes platform metadata for consumers event object: target, context.
 * 5. Extracts required mouse event fields from the React synthetic event.
 * @param eventName - the name of the callback that will be passed to component.
 * @param api - corvid sdk api object.
 * @param cb - consumers callback function.
 * @param payloadProjection - transformation for provided custom payload.
 */
export const registerCorvidMouseEvent = <
  TPayload extends Record<string, unknown> = {},
>(
  eventName: string,
  api: CorvidSDKApi<any, any>,
  cb: ICorvidEventHandler<ICorvidMouseEvent>,
  payloadProjection?: (payload: TPayload) => Record<string, unknown>,
) =>
  registerCorvidEvent<
    ICleanedCorvidEvent<React.MouseEvent>,
    ICorvidMouseEvent,
    TPayload
  >(eventName, api, cb, ({ componentEvent, eventPayload }) => ({
    ...convertToCorvidMouseEvent(componentEvent),
    ...(eventPayload && payloadProjection?.(eventPayload)),
  }));

/**
 * Function that registers corvid event only once per sdk initialization.
 * This is function is used to sync the corvid state with the component state
 * synchronously.
 * @param {EventParameters} Object {
 *   @property {string} eventName - the name of the callback that will be passed to component.
 *   @property {CorvidSDKApi} api - corvid sdk api object.
 *   @property {Function} cb - callback function.
 *   @property {string} namespace - (optional) - state identifier used to make id unique by prop-factory.
 * }
 */
export const registerEventOnce = <TComponentEvent>({
  eventName,
  api,
  cb,
  namespace,
}: {
  eventName: string;
  api: CorvidSDKApi<any, any>;
  cb: (event: TComponentEvent) => void;
  namespace?: string;
}) => {
  const { registerEvent, createSdkState } = api;
  const [state, setState] = createSdkState({ wasInvoked: false }, namespace);
  if (!state.wasInvoked) {
    registerEvent(eventName, cb);
    setState({ wasInvoked: true });
  }
};
