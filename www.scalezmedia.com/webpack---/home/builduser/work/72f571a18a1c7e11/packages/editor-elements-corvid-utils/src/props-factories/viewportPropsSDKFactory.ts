import type {
  CorvidSDKPropsFactory,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidEvent } from '../corvidEvents';
import { createCompSchemaValidator } from '../validations';

export interface IViewportPropSDK {
  onViewportEnter(cb: CorvidEventHandler): void;
  onViewportLeave(cb: CorvidEventHandler): void;
}

type ViewportEventCallback = () => void;

export interface IViewportState {
  onViewportEnter: ReadonlyArray<ViewportEventCallback>;
  onViewportLeave: ReadonlyArray<ViewportEventCallback>;
}

type ViewportEventCallbackType = keyof IViewportState;

export type RegisterCallbackFn = (
  type: ViewportEventCallbackType,
  cb: ViewportEventCallback,
) => void;

export const createViewportPropsSDKFactory = (
  registerCallback?: RegisterCallbackFn,
): CorvidSDKPropsFactory<{}, IViewportPropSDK> => {
  return api => {
    const { metaData, getSdkInstance, create$w, createEvent } = api;

    const functionValidator = (value: Function, setterName: string) =>
      createCompSchemaValidator(metaData.role)(
        value,
        {
          type: ['function'],
        },
        setterName,
      );

    return {
      onViewportEnter: cb => {
        if (!functionValidator(cb, 'onViewportEnter')) {
          return getSdkInstance();
        }

        registerCallback?.('onViewportEnter', () => {
          const corvidEvent = createEvent({ type: 'viewportEnter' });
          const $w = create$w();
          cb(corvidEvent, $w);
        });

        return registerCorvidEvent('onViewportEnter', api, cb);
      },

      onViewportLeave: cb => {
        if (!functionValidator(cb, 'onViewportLeave')) {
          return getSdkInstance();
        }

        registerCallback?.('onViewportLeave', () => {
          const corvidEvent = createEvent({ type: 'viewportLeave' });
          const $w = create$w();
          cb(corvidEvent, $w);
        });

        return registerCorvidEvent('onViewportLeave', api, cb);
      },
    };
  };
};
