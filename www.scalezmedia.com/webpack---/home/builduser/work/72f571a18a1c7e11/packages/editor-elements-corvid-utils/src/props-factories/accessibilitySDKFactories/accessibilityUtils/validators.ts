import type { SdkInstance } from '@wix/editor-elements-types/corvid';
import { getNotSelectorError, getNotTextSelectorError } from '..';
import { messages, reportError } from '../../..';
import { isElement, isTextElement } from './assertions';

const baseValidator = (
  propertyName: string,
  allowNil: boolean,
  predicate: (sdkInstance: SdkInstance) => boolean,
  failedPredicateError: string,
  sdkInstance: SdkInstance,
) => {
  if (!sdkInstance) {
    if (allowNil) {
      return true;
    }

    reportError(
      messages.invalidTypeMessage({
        value: sdkInstance,
        types: ['object'],
        propertyName,
        functionName: `set ${propertyName}`,
        index: undefined,
      }),
    );
    return false;
  }

  if (!predicate(sdkInstance)) {
    reportError(failedPredicateError);
    return false;
  }

  return true;
};

export const createElementValidator =
  (propertyName: string, allowNil: boolean = true) =>
  (sdkInstance: SdkInstance) =>
    baseValidator(
      propertyName,
      allowNil,
      isElement,
      getNotSelectorError(propertyName),
      sdkInstance,
    );

export const createTextElementValidator =
  (propertyName: string, allowNil: boolean = true) =>
  (sdkInstance: SdkInstance) =>
    baseValidator(
      propertyName,
      allowNil,
      isTextElement,
      getNotTextSelectorError(propertyName),
      sdkInstance,
    );
