import type {
  CorvidSDKPropsFactory,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidEvent } from '../corvidEvents';

export interface IChangePropsSDK {
  onChange: (handler: CorvidEventHandler) => void;
}

export interface IChangePropsSDKActions<T = Element> {
  onChange?: (event: React.ChangeEvent<T>) => void;
}

export const changePropsSDKFactory: CorvidSDKPropsFactory<{}, IChangePropsSDK> =
  api => ({
    onChange: handler => registerCorvidEvent('onChange', api, handler),
  });
