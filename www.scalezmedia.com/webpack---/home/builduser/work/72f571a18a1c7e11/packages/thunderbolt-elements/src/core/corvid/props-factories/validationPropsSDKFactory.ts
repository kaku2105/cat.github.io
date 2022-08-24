import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '@wix/editor-elements-corvid-utils';
import {
  getCustomValidityMessage,
  getValidationData,
  setCustomValidator,
  setValidationData,
  InputValidator,
  OnValidateArgs,
  CustomValidator,
  ValidityObject,
  HtmlValidationMessageOverrideKeys,
} from '../inputUtils';

export interface IValidationPropSDKProps {
  // isValid is used for some, but not all, input components
  isValid?: boolean;
  shouldShowValidityIndication: boolean;
}

export interface IValidationPropsImperativeActions {
  setCustomValidity: (
    message:
      | { type: 'message'; message: string }
      | { type: 'key'; key: HtmlValidationMessageOverrideKeys },
  ) => void;
}

export interface IValidationPropsSDKActions<TProps> {
  validateValueAndShowIndication: (propsOverrides?: Partial<TProps>) => void;
  hideValidityIndication: () => void;
  validateValue?: () => void;
}

export interface IValidationPropSDK {
  valid: boolean;
  validationMessage: string;
  validity: ValidityObject;
  onCustomValidation: (validator: CustomValidator, override: boolean) => void;
  updateValidityIndication: () => void;
  resetValidityIndication: () => void;
}

export const createValidationPropsSDKFactory = <
  TProps extends IValidationPropSDKProps,
  TCompRef extends IValidationPropsImperativeActions,
>(
  inputValidator: InputValidator<TProps, TCompRef>,
) => {
  inputValidator.onValidate(
    ({
      viewerSdkAPI,
      validationDataResult,
      showValidityIndication,
    }: OnValidateArgs<TProps, TCompRef>) => {
      const { setProps, compRef } = viewerSdkAPI;
      const prevValidationData = getValidationData(viewerSdkAPI);
      const prevCustomValidityMessage =
        getCustomValidityMessage(prevValidationData);
      const customValidityMessage =
        getCustomValidityMessage(validationDataResult);
      const prevHtmlValidationMessageOverrideKey =
        prevValidationData.htmlValidationMessageOverride.key;
      const htmlValidationMessageOverrideKey =
        validationDataResult.htmlValidationMessageOverride.key;

      if (validationDataResult.validity.customError) {
        if (prevCustomValidityMessage !== customValidityMessage) {
          compRef.setCustomValidity({
            type: 'message',
            message: customValidityMessage,
          });
        }
      } else if (htmlValidationMessageOverrideKey) {
        if (
          prevValidationData.validity.customError ||
          prevHtmlValidationMessageOverrideKey !==
            htmlValidationMessageOverrideKey
        ) {
          compRef.setCustomValidity({
            type: 'key',
            key: htmlValidationMessageOverrideKey,
          });
        }
      } else if (
        prevCustomValidityMessage !== customValidityMessage ||
        prevHtmlValidationMessageOverrideKey !==
          htmlValidationMessageOverrideKey
      ) {
        compRef.setCustomValidity({
          type: 'message',
          message: '',
        });
      }

      const compProps = {
        isValid: validationDataResult.validity.valid,
        ...(showValidityIndication && { shouldShowValidityIndication: true }),
      };

      setValidationData(viewerSdkAPI, validationDataResult);
      setProps(compProps as Partial<TProps>);
    },
  );

  const _validationPropsSDKFactory: CorvidSDKPropsFactory<
    TProps,
    IValidationPropSDK,
    TCompRef
  > = api => {
    const {
      setProps,
      props,
      registerEvent,
      metaData: { isRepeaterTemplate },
    } = api;

    // We don't want to register events on a repeater template
    // since the validation will use the template props
    if (!isRepeaterTemplate) {
      registerEvent('validateValue', () => {
        inputValidator.validate({ viewerSdkAPI: api });
      });
      // We get props override because sometimes props are not updated the way we expect them to be.
      // For example - Checkbox's onChange from the controller updatesProps with the latest checked value. We expect to have these updated props here in validateValueAndShowIndication
      // That is called right after onChange, but in Safari that is not the case. For now we are passing props overrides.

      // Ticket - https://jira.wixpress.com/browse/PLAT-934. PR to revert after the fix (Don't revert the onChange radioGroup changes!) - https://github.com/wix-private/editor-elements/pull/2584
      registerEvent(
        'validateValueAndShowIndication',
        (propsOverrides?: Partial<TProps>) => {
          const updatedProps = {
            ...props,
            ...propsOverrides,
          };

          const viewerSdkAPI = {
            ...api,
            props: updatedProps,
          };

          inputValidator.validate({
            viewerSdkAPI,
            showValidityIndication: true,
          });
        },
      );
      registerEvent('hideValidityIndication', () => {
        setProps({ shouldShowValidityIndication: false } as Partial<TProps>);
      });

      inputValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: false,
      });
    }

    return {
      get valid() {
        return getValidationData(api).validity.valid;
      },
      get validationMessage() {
        return getValidationData(api).validationMessage;
      },
      get validity() {
        return getValidationData(api).validity;
      },
      onCustomValidation(validator: CustomValidator, override = true) {
        setCustomValidator(api, validator, override);

        inputValidator.validate({
          viewerSdkAPI: api,
        });
      },
      updateValidityIndication() {
        setProps({ shouldShowValidityIndication: true } as Partial<TProps>);
      },
      resetValidityIndication() {
        setProps({ shouldShowValidityIndication: false } as Partial<TProps>);
      },
    };
  };

  return withValidation(_validationPropsSDKFactory, {
    type: ['object'],
    properties: {
      onCustomValidation: {
        type: ['function'],
        args: [{ type: ['function'] }, { type: ['boolean'] }],
      },
    },
  });
};
