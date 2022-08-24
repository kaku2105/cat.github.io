import type {
  CorvidSDKPropsFactory,
  CorvidSDKApi,
} from '@wix/editor-elements-types/corvid';
import { withValidation } from '@wix/editor-elements-corvid-utils';
import { InputValidator } from '../inputUtils';

export interface ICheckedPropSDKProps {
  checked: boolean;
}

export interface ICheckedPropSDK {
  checked: boolean;
}

const _checkedPropsSDKFactory =
  <TProps extends ICheckedPropSDKProps, TCompRef>(
    inputValidator: InputValidator<TProps, TCompRef>,
  ): CorvidSDKPropsFactory<ICheckedPropSDKProps, ICheckedPropSDK> =>
  api => {
    const { props, setProps } = api;

    return {
      get checked() {
        return props.checked || false;
      },
      set checked(value) {
        setProps({ checked: value || false });
        inputValidator.validate({
          viewerSdkAPI: api as CorvidSDKApi<TProps, any, TCompRef>,
          showValidityIndication: true,
        });
      },
    };
  };

export const createCheckedPropsSDKFactory = <
  TProps extends ICheckedPropSDKProps,
  TCompRef,
>(
  inputValidator: InputValidator<TProps, TCompRef>,
) =>
  withValidation(_checkedPropsSDKFactory(inputValidator), {
    type: ['object'],
    properties: {
      checked: {
        type: ['boolean', 'nil'],
      },
    },
  });
