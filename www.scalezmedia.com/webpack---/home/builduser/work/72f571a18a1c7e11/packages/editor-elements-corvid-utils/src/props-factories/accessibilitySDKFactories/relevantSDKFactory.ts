import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaRelevantSDK } from './types';

const relevantSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaRelevantSDK
> = ({ setProps, props }) => ({
  get relevant() {
    return props.ariaAttributes?.relevant;
  },

  set relevant(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        relevant: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createRelevantSDK = withValidation(relevantSDKFactory, {
  type: ['object'],
  properties: {
    relevant: {
      type: ['string'],
      enum: ['additions', 'additions text', 'all', 'removals', 'text'],
    },
  },
});
