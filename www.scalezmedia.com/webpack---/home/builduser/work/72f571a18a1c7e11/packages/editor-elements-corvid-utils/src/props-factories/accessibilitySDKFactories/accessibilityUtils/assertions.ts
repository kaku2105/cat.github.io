import type { SdkInstance } from '@wix/editor-elements-types/corvid';

export const isTextElement = (sdkInstance: SdkInstance) =>
  isElement(sdkInstance) &&
  (sdkInstance.type === '$w.Text' || sdkInstance.type === '$w.CollapsibleText');

export const isElement = (sdkInstance: SdkInstance) =>
  Boolean(sdkInstance.id && sdkInstance.uniqueId && sdkInstance.type);

export const isEmptyValue = (value: SdkInstance) =>
  value === undefined || value === null;
