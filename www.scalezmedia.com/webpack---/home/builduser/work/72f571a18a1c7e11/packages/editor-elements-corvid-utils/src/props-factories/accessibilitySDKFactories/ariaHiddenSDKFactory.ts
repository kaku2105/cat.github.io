import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { assert } from '../..';
import { withValidation } from '../../validations';
import { AriaAttributesSDKProps, AriaHiddenSDK } from './types';

const ariaHiddenSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaHiddenSDK
> = ({ setProps, props }) => ({
  get hidden() {
    return props.ariaAttributes?.hidden;
  },
  set hidden(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        hidden: assert.isNil(value) ? undefined : value,
      },
    });
  },
});

export const createAriaHiddenSDK = withValidation(ariaHiddenSDKFactory, {
  type: ['object'],
  properties: {
    hidden: {
      type: ['boolean'],
    },
  },
});
