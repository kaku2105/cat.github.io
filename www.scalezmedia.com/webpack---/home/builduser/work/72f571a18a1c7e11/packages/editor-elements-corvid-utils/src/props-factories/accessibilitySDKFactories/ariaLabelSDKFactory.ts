import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaLabelSDK } from './types';

const ariaLabelSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaLabelSDK
> = ({ setProps, props }) => ({
  get label() {
    return props.ariaAttributes?.label;
  },
  set label(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        label: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createAriaLabelSDK = withValidation(ariaLabelSDKFactory, {
  type: ['object'],
  properties: {
    label: {
      type: ['string'],
      minLength: 1,
      maxLength: 1000,
    },
  },
});
