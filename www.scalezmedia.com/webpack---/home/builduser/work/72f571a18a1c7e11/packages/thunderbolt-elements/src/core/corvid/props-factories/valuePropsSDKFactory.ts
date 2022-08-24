import type {
  CorvidSDKApi,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';
import {
  withValidation,
  createCompSchemaValidator,
  Schema,
  composeSDKFactories,
} from '@wix/editor-elements-corvid-utils';
import { InputValidator } from '../inputUtils';
import {
  IChangePropsSDK,
  changePropsSDKFactory,
} from './changePropsSDKFactory';

export interface IValuePropsSDKProps<TValue> {
  value: TValue;
}

interface IValueOwnPropsSDK<TValue> {
  value: TValue;
}

export type IValuePropsSDK<TValue> = IValueOwnPropsSDK<TValue> &
  IChangePropsSDK;

export type ValueSanitizerFunction<TProps extends { value: any }> = (
  value: any,
  api: CorvidSDKApi<TProps, any, any>,
) => TProps['value'];

const _createValuePropsSDKFactory =
  <TProps extends { value: any }, TCompRef>(
    valueSanitizer: ValueSanitizerFunction<TProps>,
    valueSchema: Schema,
    inputValidator: InputValidator<TProps, TCompRef>,
  ): CorvidSDKPropsFactory<
    IValuePropsSDKProps<TProps['value']>,
    IValueOwnPropsSDK<TProps['value']>,
    TCompRef
  > =>
  api => {
    const { setProps, props, metaData } = api;
    const schemaValidator = createCompSchemaValidator(metaData.role);

    return {
      get value() {
        return props.value;
      },
      set value(value) {
        const sanitizedValue = valueSanitizer(
          value,
          api as CorvidSDKApi<TProps, any, TCompRef>,
        );
        const isValid = schemaValidator(sanitizedValue, valueSchema, 'value');
        if (!isValid) {
          return;
        }
        setProps({ value: sanitizedValue });
        inputValidator.validate({
          viewerSdkAPI: api as CorvidSDKApi<TProps, any, TCompRef>,
          showValidityIndication: true,
        });
      },
    };
  };

export const createValuePropsSdkFactory = <
  TProps extends { value: any },
  TCompRef,
>(
  valueSanitizer: ValueSanitizerFunction<TProps>,
  valueSchema: Schema,
  inputValidator: InputValidator<TProps, TCompRef>,
): CorvidSDKPropsFactory<
  IValuePropsSDKProps<TProps['value']>,
  IValuePropsSDK<any>,
  TCompRef
> =>
  composeSDKFactories(
    changePropsSDKFactory,
    withValidation(
      _createValuePropsSDKFactory<TProps, TCompRef>(
        valueSanitizer,
        valueSchema,
        inputValidator,
      ),
      {
        type: ['object'],
        properties: {},
      },
    ),
  );
