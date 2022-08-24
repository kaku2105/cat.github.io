import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaLiveSDK } from './types';

const liveSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaLiveSDK
> = ({ setProps, props }) => ({
  get live() {
    return props.ariaAttributes?.live;
  },

  set live(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        live: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createLiveSDK = withValidation(liveSDKFactory, {
  type: ['object'],
  properties: {
    live: {
      type: ['string'],
      enum: ['polite', 'assertive'],
    },
  },
});
