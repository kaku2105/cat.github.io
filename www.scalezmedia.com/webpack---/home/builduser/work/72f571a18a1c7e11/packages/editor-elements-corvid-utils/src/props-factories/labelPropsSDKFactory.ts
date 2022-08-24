import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../validations';

export interface ILabelPropSDKProps {
  label?: string | null;
}

export interface ILabelPropSDK {
  label?: string | null;
}

const _labelPropsSDKFactory: CorvidSDKPropsFactory<
  ILabelPropSDKProps,
  ILabelPropSDK
> = ({ setProps, props }) => ({
  get label() {
    return props.label || '';
  },
  set label(value) {
    const label = value || '';
    setProps({ label });
  },
});

export const labelPropsSDKFactory = withValidation(_labelPropsSDKFactory, {
  type: ['object'],
  properties: {
    label: {
      type: ['string', 'nil'],
      warnIfNil: true,
    },
  },
});
