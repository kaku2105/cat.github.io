import * as React from 'react';
import { ITranslate } from '../SiteMembersInput/SiteMembersInput.types';
import { serverErrorsHandler } from '../SiteMembersInput/viewer/utils';

type IUseSocialErrorHandler = (
  translate: ITranslate,
  socialErrorMsg?: string,
) => [
  string,
  (error: any) => void,
  <TCallback extends (...args: Array<any>) => any>(
    cb: TCallback,
  ) => (...args: Parameters<TCallback>) => ReturnType<TCallback>,
];

export const getResetSocialAuthError =
  (resetFn: () => void) =>
  <TCallback extends (...args: Array<any>) => any>(cb: TCallback) =>
  (...args: Parameters<TCallback>) => {
    resetFn();
    return cb(...args) as ReturnType<TCallback>;
  };

export const useSocialErrorHandler: IUseSocialErrorHandler = (
  translate,
  socialErrorMsg = '',
) => {
  const [socialAuthError, setSocialAuthError] = React.useState(socialErrorMsg);
  const translateAndSetSocialAuthError = (error: any) => {
    const errorMsg = serverErrorsHandler(error);
    const defaultErrorMsg = translate(
      'SMForm_Error_General_Err',
      'Server error. Try again later.',
    );
    setSocialAuthError(translate(errorMsg, defaultErrorMsg));
  };
  const resetSocialAuthError = getResetSocialAuthError(() =>
    setSocialAuthError(''),
  );
  return [
    socialAuthError,
    translateAndSetSocialAuthError,
    resetSocialAuthError,
  ];
};
