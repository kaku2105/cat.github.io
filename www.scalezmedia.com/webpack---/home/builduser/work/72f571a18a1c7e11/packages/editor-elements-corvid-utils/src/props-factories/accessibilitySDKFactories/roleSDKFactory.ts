import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { RoleSDKProps, RoleSDK } from './types';

const roleSDKFactory: CorvidSDKPropsFactory<RoleSDKProps, RoleSDK> = ({
  setProps,
  props,
}) => ({
  get role() {
    return props.role;
  },

  set role(value) {
    setProps({
      role: isEmptyValue(value) ? undefined : value,
    });
  },
});

export const createRoleSDK = withValidation(roleSDKFactory, {
  type: ['object'],
  properties: {
    role: {
      type: ['string'],
    },
  },
});
