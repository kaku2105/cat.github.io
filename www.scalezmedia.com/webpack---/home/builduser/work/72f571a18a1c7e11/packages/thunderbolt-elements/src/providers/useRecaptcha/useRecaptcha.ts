/// <reference types="grecaptcha" />
import { useRef } from 'react';
import { getScriptOrLoad } from '../ScriptLoader/ScriptLoader';
import { ENTERPRISE_SITE_KEY } from './constants';

export type RecaptchaProps = {
  language?: string;
  theme?: ReCaptchaV2.Parameters['theme'];
  size?: ReCaptchaV2.Parameters['size'];
  tabindex?: number;
  verifiedCallback?: (token: string) => void;
  expiredCallback?: () => void;
  errorCallback?: () => void;
  loadedCallback?: () => void;
};

export type RecaptchaReturnType = [
  (elem: HTMLElement | null) => Promise<void>,
  {
    reset: () => Promise<void>;
  },
];

export const useRecaptcha = ({
  language,
  theme,
  size,
  tabindex,
  verifiedCallback,
  expiredCallback,
  errorCallback,
  loadedCallback,
}: RecaptchaProps): RecaptchaReturnType => {
  const cacheResultRef = useRef<RecaptchaReturnType>();

  const widgetIdRef = useRef<number | undefined>(undefined);

  if (cacheResultRef.current) {
    return cacheResultRef.current;
  }

  const ref = async (elem: HTMLElement | null) => {
    if (!elem || widgetIdRef.current) {
      return;
    }
    const sdk = await getScriptOrLoad('recaptcha', {
      hl: language,
    });

    widgetIdRef.current = sdk.render(elem, {
      sitekey: ENTERPRISE_SITE_KEY,
      theme,
      size,
      tabindex,
      callback: verifiedCallback,
      'expired-callback': expiredCallback,
      'error-callback': errorCallback,
    });

    if (loadedCallback) {
      sdk.ready(() => {
        let iframe = elem.querySelector('iframe');

        if (iframe) {
          iframe.onload = () => loadedCallback();

          // Fallback: in case iframe already loaded
          try {
            iframe = elem.querySelector('iframe');
            const iframeContent =
              iframe &&
              (iframe.contentDocument ||
                (iframe.contentWindow && iframe.contentWindow.document));

            if (iframeContent) {
              const body = iframeContent.querySelector('body');

              // if body not empty, iframe has loaded
              if (body && body.innerHTML !== '') {
                loadedCallback();
              }
            }
          } catch (err) {
            // If there is an error here, possible cross origin error
            // therefore that means iframe loaded
            loadedCallback();
          }
        } else {
          // Fallback: in case iframe was not found
          loadedCallback();
        }
      });
    }
  };

  const reset = async () => {
    if (typeof widgetIdRef.current !== 'number') {
      return;
    }
    const sdk = await getScriptOrLoad('recaptcha', {
      hl: language,
    });
    if (sdk && !!sdk.render) {
      sdk.reset(widgetIdRef.current);
    }
  };

  return (cacheResultRef.current = [
    ref,
    {
      reset,
    },
  ]);
};
