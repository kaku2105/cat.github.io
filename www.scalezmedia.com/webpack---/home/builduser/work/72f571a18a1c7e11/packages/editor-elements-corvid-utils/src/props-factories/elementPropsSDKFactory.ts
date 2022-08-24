import { MouseEventHandler } from 'react';
import type {
  CorvidSDKPropsFactory,
  CorvidMouseEventHandler,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import {
  registerCorvidMouseEvent,
  unregisterCorvidEvent,
} from '../corvidEvents';
import { composeSDKFactories } from '../composeSDKFactories';
import { messageTemplates } from '../messages';
import { reportError } from '../reporters';
import { basePropsSDKFactory } from './basePropsSDKFactory';
import { createViewportPropsSDKFactory } from './viewportPropsSDKFactory';
import { createVisibilityPropsSDKFactory } from './visibilityPropsSDKFactory';
import { effectsTriggersSDKFactory } from './effectsTriggersSDKFactory';

export interface IElementPropsSDKProps {}

export type ToJSONBase = {
  id: string;
  type: string;
  global: boolean;
  rendered: boolean;
};

export interface IElementPropsSDK {
  onMouseIn: (cb: CorvidMouseEventHandler) => void;
  onMouseOut: (cb: CorvidMouseEventHandler) => void;
  removeEventHandler: (type: string, handler: CorvidEventHandler) => void;
  toJSON(): ToJSONBase;
  rendered: boolean;
}

export type IElementPropsSDKActions = Partial<{
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}>;

export const toJSONBase = ({
  role,
  compType,
  isGlobal,
  isRendered,
}: {
  role: string;
  compType: string;
  isGlobal: () => boolean;
  isRendered: () => boolean;
}): ToJSONBase => ({
  id: role,
  type: `$w.${compType}`,
  global: isGlobal(),
  rendered: isRendered(),
});

const _elementPropsSDKFactory: CorvidSDKPropsFactory<
  IElementPropsSDKProps,
  IElementPropsSDK
> = api => ({
  onMouseIn: handler => registerCorvidMouseEvent('onMouseEnter', api, handler),

  onMouseOut: handler => registerCorvidMouseEvent('onMouseLeave', api, handler),

  removeEventHandler: (type, handler) => {
    const { getSdkInstance } = api;

    if (typeof type !== 'string') {
      reportError(
        messageTemplates.error_type({
          propertyName: 'type',
          functionName: 'removeEventHandler',
          value: type,
          expectedType: 'string',
        }),
      );
      return getSdkInstance();
    }

    if (typeof handler !== 'function') {
      reportError(
        messageTemplates.error_type({
          propertyName: 'handler',
          functionName: 'removeEventHandler',
          value: handler,
          expectedType: 'function',
        }),
      );
      return getSdkInstance();
    }

    return unregisterCorvidEvent(type, api, handler);
  },

  get rendered() {
    return api.metaData.isRendered();
  },

  toJSON() {
    return toJSONBase(api.metaData);
  },
});

const viewportPropsSDKFactory = createViewportPropsSDKFactory();

export const elementPropsSDKFactory = composeSDKFactories(
  basePropsSDKFactory,
  viewportPropsSDKFactory,
  _elementPropsSDKFactory,
  effectsTriggersSDKFactory,
);

type CreateElementPropsSDKFactoryOptions = {
  useHiddenCollapsed?: boolean;
  hasPortal?: boolean;
};

export const createElementPropsSDKFactory = ({
  useHiddenCollapsed = true,
  hasPortal = false,
}: CreateElementPropsSDKFactoryOptions | undefined = {}) => {
  return composeSDKFactories(
    basePropsSDKFactory,
    _elementPropsSDKFactory,
    effectsTriggersSDKFactory,
    useHiddenCollapsed
      ? createVisibilityPropsSDKFactory(hasPortal)
      : viewportPropsSDKFactory,
  );
};
