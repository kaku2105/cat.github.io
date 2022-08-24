/// <reference types="grecaptcha" />

import * as React from 'react';
import { getScriptOrLoad } from '../../providers/ScriptLoader/ScriptLoader';
import { INVISIBLE_CAPTCHA_SITE_KEY } from './viewer/utils';

export type RecaptchaProps = {
  language: string;
  shouldUseInvisibleCaptcha: boolean;
};

export type RecaptchaReturnType = [(action: string) => Promise<string>];

export const useInvisibleCaptcha = ({
  language,
  shouldUseInvisibleCaptcha,
}: RecaptchaProps): RecaptchaReturnType => {
  const captchaSettings = React.useMemo(
    () => ({
      hl: language,
      isInvisible: true,
      key: INVISIBLE_CAPTCHA_SITE_KEY,
    }),
    [language],
  );
  // The script collect the member behavior to determine whether
  // is a human or not so we initialize it while bootstrapping the
  // component even due we not yet call the execute method.
  React.useEffect(() => {
    if (!shouldUseInvisibleCaptcha) {
      return;
    }
    getScriptOrLoad('recaptcha', captchaSettings);
  }, [captchaSettings, shouldUseInvisibleCaptcha]);

  const execute = async (action: string) => {
    const sdk = await getScriptOrLoad('recaptcha', captchaSettings);
    return sdk.execute(INVISIBLE_CAPTCHA_SITE_KEY, { action });
  };

  return [execute];
};
