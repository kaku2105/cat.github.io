import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';

import { AriaAttributesSDKProps, AriaAtomicSDK } from './types';

const atomicSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaAtomicSDK
> = ({ setProps, props }) => ({
  get atomic() {
    return props.ariaAttributes?.atomic;
  },

  set atomic(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        atomic: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createAtomicSDK = withValidation(atomicSDKFactory, {
  type: ['object'],
  properties: {
    atomic: {
      type: ['boolean'],
    },
  },
});
