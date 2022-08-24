import type {
  SdkInstance,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';

export interface IChildrenPropSDK {
  children: Array<SdkInstance>;
}

export const childrenPropsSDKFactory: CorvidSDKPropsFactory<
  {},
  IChildrenPropSDK
> = ({ getChildren }) => {
  return {
    get children() {
      return getChildren();
    },
  };
};
