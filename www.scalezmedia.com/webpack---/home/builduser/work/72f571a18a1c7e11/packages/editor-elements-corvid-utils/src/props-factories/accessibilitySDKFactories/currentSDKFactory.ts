import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaCurrentSDK } from './types';

const currentSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaCurrentSDK
> = ({ setProps, props }) => ({
  get current() {
    return props.ariaAttributes?.current;
  },

  set current(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        current: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createCurrentSDK = withValidation(currentSDKFactory, {
  type: ['object'],
  properties: {
    current: {
      type: ['string'],
      enum: ['step', 'page', 'true', 'false', 'location', 'date', 'time'],
    },
  },
});
