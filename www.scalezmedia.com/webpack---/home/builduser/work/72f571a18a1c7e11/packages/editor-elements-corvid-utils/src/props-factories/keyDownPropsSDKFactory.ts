import type {
  CorvidSDKPropsFactory,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidEvent } from '../corvidEvents';

export interface IKeyDownPropsSDKProps {}

export interface IKeyDownPropsSDK {
  onKeyDown: (handler: CorvidEventHandler) => void;
}

export interface IKeyDownPropsSDKActions {
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const keyDownPropsSDKFactory: CorvidSDKPropsFactory<
  IKeyDownPropsSDKProps,
  IKeyDownPropsSDK
> = api => {
  return {
    onKeyDown: handler => registerCorvidEvent('onKeyDown', api, handler),
  };
};
