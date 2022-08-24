/// <reference types="grecaptcha" />

export type RecaptchaScriptParams = {
  hl?: string;
  isInvisible?: boolean;
  key?: string;
};

declare let window: Window & {
  grecaptcha_onload: () => void;
  grecaptcha: { enterprise: ReCaptchaV2.ReCaptcha };
};

export const loadScript = (
  scriptParams: RecaptchaScriptParams,
): Promise<ReCaptchaV2.ReCaptcha> =>
  isSdkExist()
    ? Promise.resolve(getSdk())
    : new Promise(resolve => {
        // preventing a race condition if the SDK already loaded from TB
        const id = setInterval(() => {
          if (isSdkExist()) {
            clearTimeout(id);
            resolve(getSdk());
          }
        }, 500);
        window.grecaptcha_onload = () => {
          clearInterval(id);
          resolve(getSdk());
        };
        window.document.body.append(createRecaptchaScriptElement(scriptParams));
      });

function isSdkExist() {
  return !!window.grecaptcha?.enterprise?.render;
}

function getSdk() {
  return window.grecaptcha?.enterprise;
}

function createRecaptchaScriptElement(scriptParams: RecaptchaScriptParams) {
  const { hl, isInvisible, key } = scriptParams;
  const script = window.document.createElement('script');
  script.defer = true;
  script.async = true;
  const sdkUrl = 'https://www.google.com/recaptcha/enterprise.js';
  const url = new URL(sdkUrl);
  if (hl) {
    url.searchParams.append('hl', hl);
  }
  url.searchParams.append('onload', 'grecaptcha_onload');
  const render = isInvisible && key ? key : 'explicit';
  url.searchParams.append('render', render);
  script.src = url.toString();
  return script;
}
