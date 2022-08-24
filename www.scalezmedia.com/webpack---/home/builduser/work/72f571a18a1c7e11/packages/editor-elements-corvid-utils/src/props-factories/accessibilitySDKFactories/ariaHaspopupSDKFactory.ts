import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { assert } from '../..';
import { withValidation } from '../../validations';
import { AriaAttributesSDKProps, AriaHaspopupSDK } from './types';

const ariaHaspopupSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaHaspopupSDK
> = ({ setProps, props }) => ({
  get haspopup() {
    return props.ariaAttributes?.haspopup;
  },
  set haspopup(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        haspopup: assert.isNil(value) ? undefined : value,
      },
    });
  },
});

export const createAriaHaspopupSDK = withValidation(ariaHaspopupSDKFactory, {
  type: ['object'],
  properties: {
    haspopup: {
      type: ['string'],
      enum: ['false', 'true'],
    },
  },
});
