import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../..';
import { createTextElementValidator } from './accessibilityUtils/validators';
import { AriaAttributesSDKProps, LabelledBySDK } from './types';

const labelledBySDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  LabelledBySDK
> = ({ setProps, props, create$w }) => ({
  get labelledBy() {
    if (!props.ariaAttributes?.labelledBy) {
      return undefined;
    }
    const $w = create$w();
    return $w(`#${props.ariaAttributes.labelledBy}`);
  },
  set labelledBy(selector) {
    if (!selector) {
      setProps({
        ariaAttributes: {
          ...props.ariaAttributes,
          labelledBy: undefined,
        },
      });
      return;
    }

    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        labelledBy: selector.uniqueId,
      },
    });
  },
});

const customRules = {
  labelledBy: [createTextElementValidator('labelledBy')],
};

export const createLabelledBySDK = withValidation(
  labelledBySDKFactory,
  {
    type: ['object'],
    properties: {
      labelledBy: {
        type: ['object', 'nil'],
      },
    },
  },
  customRules,
);
