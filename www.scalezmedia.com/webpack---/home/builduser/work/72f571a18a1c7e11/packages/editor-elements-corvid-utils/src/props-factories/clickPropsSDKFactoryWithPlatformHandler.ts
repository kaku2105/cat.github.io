import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';

import {
  clickPropsSDKFactory,
  IClickPropSDK,
  IClickPropSDKProps,
} from './clickPropsSDKFactory';

export interface IClickPropWithUpdateHandlerSDKProps
  extends IClickPropSDKProps {
  hasPlatformClickHandler: boolean;
}

export const clickPropsSDKFactoryWithUpdatePlatformHandler: CorvidSDKPropsFactory<
  IClickPropWithUpdateHandlerSDKProps,
  IClickPropSDK
> = api => {
  const clickPropsApi = clickPropsSDKFactory(api);
  const { setProps, props } = api;

  return {
    ...clickPropsApi,
    onClick: handler => {
      clickPropsApi.onClick(handler);
      if (!props.hasPlatformClickHandler) {
        setProps({
          hasPlatformClickHandler: true,
        });
      }
    },
  };
};
