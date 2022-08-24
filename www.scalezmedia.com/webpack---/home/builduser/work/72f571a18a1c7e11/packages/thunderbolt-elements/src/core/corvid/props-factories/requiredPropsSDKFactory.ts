import type {
  CorvidSDKApi,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';
import { withValidation } from '@wix/editor-elements-corvid-utils';
import { InputValidator } from '../inputUtils';

export interface IRequiredPropSDKProps {
  required: boolean;
}

export interface IRequiredPropSDK {
  required: boolean;
}

const _requiredPropsSDKFactory =
  <TProps extends IRequiredPropSDKProps, TCompRef>(
    inputValidator: InputValidator<TProps, TCompRef>,
  ): CorvidSDKPropsFactory<IRequiredPropSDKProps, IRequiredPropSDK, TCompRef> =>
  api => ({
    get required() {
      return api.props.required || false;
    },
    set required(value) {
      api.setProps({ required: value });
      inputValidator.validate({
        viewerSdkAPI: api as CorvidSDKApi<TProps, any, TCompRef>,
        showValidityIndication: true,
      });
    },
  });

export const createRequiredPropsSDKFactory = <
  TProps extends IRequiredPropSDKProps,
  TCompRef,
>(
  inputValidator: InputValidator<TProps, TCompRef>,
) =>
  withValidation(_requiredPropsSDKFactory<TProps, TCompRef>(inputValidator), {
    type: ['object'],
    properties: {
      required: {
        type: ['boolean'],
      },
    },
  });
