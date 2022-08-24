import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { isEmptyValue } from './accessibilityUtils/assertions';
import { AriaAttributesSDKProps, AriaBusySDK } from './types';

const busySDKFactory: CorvidSDKPropsFactory<
  AriaAttributesSDKProps,
  AriaBusySDK
> = ({ setProps, props }) => ({
  get busy() {
    return props.ariaAttributes?.busy;
  },

  set busy(value) {
    setProps({
      ariaAttributes: {
        ...props.ariaAttributes,
        busy: isEmptyValue(value) ? undefined : value,
      },
    });
  },
});

export const createBusySDK = withValidation(busySDKFactory, {
  type: ['object'],
  properties: {
    busy: {
      type: ['boolean'],
    },
  },
});
