import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../validations';

export interface IReadOnlyPropSDKProps {
  readOnly: boolean;
}

export interface IReadOnlyPropSDK {
  readOnly: boolean;
}

const _readOnlyPropsSDKFactory: CorvidSDKPropsFactory<
  IReadOnlyPropSDKProps,
  IReadOnlyPropSDK
> = ({ setProps, props }) => ({
  get readOnly() {
    return props.readOnly || false;
  },
  set readOnly(value) {
    setProps({ readOnly: value });
  },
});

export const readOnlyPropsSDKFactory = withValidation(
  _readOnlyPropsSDKFactory,
  {
    type: ['object'],
    properties: {
      readOnly: {
        type: ['boolean'],
      },
    },
  },
);
