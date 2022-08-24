import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { composeSDKFactories } from '../composeSDKFactories';
import {
  AriaAttributesSDK,
  AriaAttributesSDKOptions,
  AriaAttributesSDKProps,
  createAriaLabelSDK,
  createAtomicSDK,
  createBusySDK,
  createCurrentSDK,
  createDescribedBySDK,
  createErrorMessageSDK,
  createExpandedSDK,
  IAccessibilityPropSDK,
  IAccessibilityPropSDKOptions,
  IAccessibilityPropSDKProps,
  createLabelledBySDK,
  legacyAriaLabelSDKFactory,
  createLiveSDK,
  OtherAccessibilitySDKOptions,
  createOwnsSDK,
  createRelevantSDK,
  createRoleSDK,
  screenReaderSDKFactory,
  createTabIndexSDK,
  createControlsSDK,
  createRoleDescriptionSDK,
  createAriaHiddenSDK,
  createAriaPressedSDK,
  createAriaHaspopupSDK,
} from './accessibilitySDKFactories';

const ariaFactoryMap: Record<
  keyof AriaAttributesSDKOptions,
  CorvidSDKPropsFactory<AriaAttributesSDKProps, any>
> = {
  enableAriaLabel: createAriaLabelSDK,
  enableAriaDescribedBy: createDescribedBySDK,
  enableAriaLabelledBy: createLabelledBySDK,
  enableAriaAtomic: createAtomicSDK,
  enableAriaBusy: createBusySDK,
  enableAriaCurrent: createCurrentSDK,
  enableAriaExpanded: createExpandedSDK,
  enableAriaLive: createLiveSDK,
  enableAriaOwns: createOwnsSDK,
  enableAriaControls: createControlsSDK,
  enableAriaRoleDescription: createRoleDescriptionSDK,
  enableAriaRelevant: createRelevantSDK,
  enableAriaErrorMessage: createErrorMessageSDK,
  enableAriaHidden: createAriaHiddenSDK,
  enableAriaPressed: createAriaPressedSDK,
  enableAriaHaspopup: createAriaHaspopupSDK,
};

const accessibilityFactoryMap: Record<
  keyof OtherAccessibilitySDKOptions,
  CorvidSDKPropsFactory<IAccessibilityPropSDKProps, any>
> = {
  enableLegacyAriaLabel: legacyAriaLabelSDKFactory,
  enableScreenReader: screenReaderSDKFactory,
  enableRole: createRoleSDK,
  enableTabIndex: createTabIndexSDK,
};

const createAriaAttributesSDKFactory = (
  ariaAttributeOptions: AriaAttributesSDKOptions,
): CorvidSDKPropsFactory<AriaAttributesSDKProps, AriaAttributesSDK> => {
  const sdkFactories: Array<CorvidSDKPropsFactory<any, any, any>> = [];

  Object.entries(ariaAttributeOptions).forEach(
    ([option, enabled]) =>
      enabled &&
      ariaFactoryMap[option] &&
      sdkFactories.push(ariaFactoryMap[option]),
  );

  const ariaAttributesSDKFactory: CorvidSDKPropsFactory<
    AriaAttributesSDKProps,
    AriaAttributesSDK
  > = api => ({
    ariaAttributes: composeSDKFactories(...sdkFactories)(api),
  });

  return ariaAttributesSDKFactory;
};

export const createAccessibilityPropSDKFactory =
  ({
    enableLegacyAriaLabel = false,
    enableAriaLabel = true,
    enableAriaDescribedBy = true,
    enableAriaLabelledBy = true,
    enableAriaAtomic = false,
    enableAriaBusy = false,
    enableAriaHidden = false,
    enableAriaPressed = false,
    enableAriaHaspopup = false,
    enableAriaCurrent = false,
    enableAriaExpanded = false,
    enableAriaLive = false,
    enableAriaOwns = false,
    enableAriaControls = false,
    enableAriaRoleDescription = false,
    enableAriaRelevant = false,
    enableRole = false,
    enableTabIndex = false,
    enableAriaErrorMessage = false,
    enableScreenReader = false,
  }: IAccessibilityPropSDKOptions = {}): CorvidSDKPropsFactory<
    IAccessibilityPropSDKProps,
    IAccessibilityPropSDK
  > =>
  api => {
    const sdkFactories: Array<CorvidSDKPropsFactory<any, any, any>> = [];

    const ariaAttributesOptions = {
      enableAriaLabel,
      enableAriaDescribedBy,
      enableAriaLabelledBy,
      enableAriaAtomic,
      enableAriaBusy,
      enableAriaCurrent,
      enableAriaExpanded,
      enableAriaLive,
      enableAriaOwns,
      enableAriaControls,
      enableAriaRoleDescription,
      enableAriaRelevant,
      enableAriaErrorMessage,
      enableAriaHidden,
      enableAriaPressed,
      enableAriaHaspopup,
    };

    const otherAccessibilityOptions = {
      enableLegacyAriaLabel,
      enableScreenReader,
      enableRole,
      enableTabIndex,
    };

    const enableAriaAttributes = Object.values(ariaAttributesOptions).some(
      optionEnabled => optionEnabled,
    );

    if (enableAriaAttributes) {
      const ariaAttributesSDKFactory = createAriaAttributesSDKFactory(
        ariaAttributesOptions,
      );
      sdkFactories.push(ariaAttributesSDKFactory);
    }

    Object.entries(otherAccessibilityOptions).forEach(
      ([option, enabled]) =>
        enabled &&
        accessibilityFactoryMap[option] &&
        sdkFactories.push(accessibilityFactoryMap[option]),
    );

    const accessibilitySdkFactory = composeSDKFactories(...sdkFactories);

    return { accessibility: accessibilitySdkFactory(api) };
  };
