import type {
  CorvidSDKPropsFactory,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidEvent } from '../corvidEvents';

export interface IKeyUpPropsSDKProps {}

export interface IKeyUpPropsSDK {
  onKeyUp: (handler: CorvidEventHandler) => void;
}

export interface IKeyUpPropsSDKActions {
  onKeyUp?: (event: React.KeyboardEvent) => void;
}

export const keyUpPropsSDKFactory: CorvidSDKPropsFactory<
  IKeyUpPropsSDKProps,
  IKeyUpPropsSDK
> = api => {
  return {
    onKeyUp: handler => registerCorvidEvent('onKeyUp', api, handler),
  };
};
