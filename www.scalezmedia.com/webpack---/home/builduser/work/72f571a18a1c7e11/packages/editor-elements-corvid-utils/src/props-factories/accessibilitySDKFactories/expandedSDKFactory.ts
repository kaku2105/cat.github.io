import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaExpandedSDK } from './types';

const expandedSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaExpandedSDK
> = ({ setProps, props }) => ({
  get expanded() {
    return props.ariaAttributes?.expanded;
  },

  set expanded(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        expanded: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createExpandedSDK = withValidation(expandedSDKFactory, {
  type: ['object'],
  properties: {
    expanded: {
      type: ['boolean'],
    },
  },
});
