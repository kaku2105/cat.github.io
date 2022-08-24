/* eslint-disable no-console */
export type Reporter = (message: string) => void;

export const WIX_SDK_ERROR_TEXT = 'Wix code SDK error:';
export const WIX_SDK_WARNING_TEXT = 'Wix code SDK warning:';
export const WIX_SDK_MESSAGE_TEXT = 'Wix code SDK message:';

export const reportError: Reporter = (message: string) => {
  console.error(`${WIX_SDK_ERROR_TEXT} ${message}`);
};

export const reportWarning: Reporter = (message: string) => {
  console.warn(`${WIX_SDK_WARNING_TEXT} ${message}`);
};

export const reportMessage: Reporter = (message: string) => {
  console.log(`${WIX_SDK_MESSAGE_TEXT} ${message}`);
};
