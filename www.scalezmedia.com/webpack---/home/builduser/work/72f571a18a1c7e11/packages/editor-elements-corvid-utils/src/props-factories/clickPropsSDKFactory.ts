import * as React from 'react';
import type {
  CorvidSDKPropsFactory,
  CorvidMouseEventHandler,
} from '@wix/editor-elements-types/corvid';
import { registerCorvidMouseEvent } from '../corvidEvents';

export interface IClickPropSDKProps {}

export interface IClickPropSDK {
  onClick: (handler: CorvidMouseEventHandler) => void;
  onDblClick: (handler: CorvidMouseEventHandler) => void;
}

export interface IClickPropsSDKActions {
  onClick?: React.MouseEventHandler;
  onDblClick?: React.MouseEventHandler;
}

export const clickPropsSDKFactory: CorvidSDKPropsFactory<
  IClickPropSDKProps,
  IClickPropSDK
> = api => ({
  onClick: handler => registerCorvidMouseEvent('onClick', api, handler),
  onDblClick: handler => registerCorvidMouseEvent('onDblClick', api, handler),
});
