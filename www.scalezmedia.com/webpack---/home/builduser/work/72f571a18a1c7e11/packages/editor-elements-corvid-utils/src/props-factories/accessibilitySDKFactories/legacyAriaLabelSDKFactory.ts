import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { assert } from '../../assert';
import { reportError } from '../../reporters';
import { ErrorMessages, REMOVABLE_ATTRIBUTES } from './constants';
import {
  LegacyAriaLabelSDK,
  LegacyAriaLabelSDKProps,
  RemovableAttribute,
} from './types';

export const legacyAriaLabelSDKFactory: CorvidSDKPropsFactory<
  LegacyAriaLabelSDKProps,
  LegacyAriaLabelSDK
> = ({ setProps, props }) => ({
  get ariaLabel() {
    return props.ariaLabel;
  },

  set ariaLabel(label) {
    if (!assert.isString(label)) {
      reportError(ErrorMessages.ARIA_LABEL_NOT_STRING);
      return;
    }
    if (!label.length) {
      reportError(ErrorMessages.ARIA_LABEL_EMPTY_STRING);
      return;
    }

    setProps({ ariaLabel: label });
  },

  remove(attribute) {
    if (!REMOVABLE_ATTRIBUTES.includes(attribute as RemovableAttribute)) {
      reportError(ErrorMessages.REMOVING_MISSING_ATTRIBUTE);
      return;
    }

    setProps({ [attribute]: undefined });
  },
});
