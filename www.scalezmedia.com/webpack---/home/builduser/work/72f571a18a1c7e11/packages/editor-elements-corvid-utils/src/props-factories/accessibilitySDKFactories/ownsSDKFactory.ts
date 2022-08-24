import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { createElementValidator } from './accessibilityUtils/validators';
import { AriaAttributesSDKProps, AriaOwnsSDK } from './types';

const ownsSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaOwnsSDK
> = ({ setProps, props, create$w }) => ({
  get owns() {
    if (!props.ariaAttributes?.owns) {
      return undefined;
    }
    const $w = create$w();
    return $w(`#${props.ariaAttributes.owns}`);
  },

  set owns(selector) {
    if (!selector) {
      setProps({
        ariaAttributes: {
          ...props.ariaAttributes,
          owns: undefined,
        },
      });
      return;
    }

    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        owns: selector.uniqueId,
      },
    });
  },
});

const customRules = {
  owns: [createElementValidator('owns')],
};

export const createOwnsSDK = withValidation(
  ownsSDKFactory,
  {
    type: ['object'],
    properties: {
      owns: {
        type: ['object', 'nil'],
      },
    },
  },
  customRules,
);
