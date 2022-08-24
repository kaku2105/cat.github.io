import type {
  CorvidSDKPropsFactory,
  CorvidEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidEvent } from '../corvidEvents';

export interface IFocusPropsSDKProps {}

export interface IFocusPropsSDK {
  focus: () => void;
  blur: () => void;
  onFocus: (handler: CorvidEventHandler) => void;
  onBlur: (handler: CorvidEventHandler) => void;
}

export interface IFocusPropsSDKActions {
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

export interface IFocusPropsImperativeActions {
  focus: () => void;
  blur: () => void;
}

export const focusPropsSDKFactory: CorvidSDKPropsFactory<
  IFocusPropsSDKProps,
  IFocusPropsSDK,
  IFocusPropsImperativeActions
> = api => {
  return {
    focus: () => api.compRef.focus(),
    blur: () => api.compRef.blur(),
    onFocus: handler => registerCorvidEvent('onFocus', api, handler),
    onBlur: handler => registerCorvidEvent('onBlur', api, handler),
  };
};
