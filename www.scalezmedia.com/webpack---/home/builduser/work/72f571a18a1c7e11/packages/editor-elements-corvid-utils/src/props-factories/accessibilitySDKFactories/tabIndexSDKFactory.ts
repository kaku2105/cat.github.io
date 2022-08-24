import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { TabIndexSDKProps, TabIndexSDK } from './types';

const tabIndexSDKFactory: CorvidSDKPropsFactory<TabIndexSDKProps, TabIndexSDK> =
  ({ setProps, props }) => ({
    get tabIndex() {
      return props.tabIndex;
    },

    set tabIndex(value) {
      setProps({
        tabIndex: isEmptyValue(value) ? undefined : value,
      });
    },
  });

export const createTabIndexSDK = withValidation(tabIndexSDKFactory, {
  type: ['object'],
  properties: {
    tabIndex: {
      type: ['number'],
      enum: [0, -1],
    },
  },
});
