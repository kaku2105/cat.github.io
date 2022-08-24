import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';

export interface IDisablePropSDKProps {
  isDisabled: boolean;
}
export interface IDisablePropSDKActions {
  disable?: () => Promise<void>;
  enable?: () => Promise<void>;
}

export interface IDisabledPropSDK {
  enabled: boolean;
  disable: () => Promise<void>;
  enable: () => Promise<void>;
}

export const disablePropsSDKFactory: CorvidSDKPropsFactory<
  IDisablePropSDKProps,
  IDisabledPropSDK
> = ({ setProps, props }) => ({
  get enabled() {
    return typeof props.isDisabled !== 'undefined' ? !props.isDisabled : true;
  },

  disable: () => {
    setProps({ isDisabled: true });
    return Promise.resolve();
  },

  enable: () => {
    setProps({ isDisabled: false });
    return Promise.resolve();
  },
});
