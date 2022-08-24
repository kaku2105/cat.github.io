import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaRoleDescriptionSDK } from './types';

const roleDescriptionSDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaRoleDescriptionSDK
> = ({ setProps, props }) => ({
  get roleDescription() {
    return props.ariaAttributes?.roleDescription;
  },
  set roleDescription(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        roleDescription: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createRoleDescriptionSDK = withValidation(
  roleDescriptionSDKFactory,
  {
    type: ['object'],
    properties: {
      roleDescription: {
        type: ['string'],
        minLength: 1,
        maxLength: 100,
      },
    },
  },
);
