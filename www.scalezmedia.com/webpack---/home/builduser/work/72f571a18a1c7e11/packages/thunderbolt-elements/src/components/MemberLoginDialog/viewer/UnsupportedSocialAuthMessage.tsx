import * as React from 'react';
import classnames from 'classnames';
import { IUnsupportedSocialAuthMessageProps } from '../MemberLoginDialog.types';
import { ReactComponent as GoogleIcon } from './assets/google.svg';
import { ReactComponent as FacebookIcon } from './assets/facebook.svg';
import { MemberLoginDialogTranslationKeys as keys, testIds } from './utils';
import style from './style/style.scss';

export const UnsupportedSocialAuthMessage: React.FC<IUnsupportedSocialAuthMessageProps> =
  ({
    isSocialLoginFacebookEnabled,
    isSocialLoginGoogleEnabled,
    translate,
    mode,
    reportCopyToClipboardBi,
    styleMode = 'dialog',
  }) => {
    const [isToastVisible, setToastVisible] = React.useState(false);

    const copyUrlToClipboard = () => {
      const dummyElement = document.createElement('input');
      const currURL = window.location.href;
      document.body.appendChild(dummyElement);
      dummyElement.value = currURL;
      dummyElement.select();
      document.execCommand('copy');
      document.body.removeChild(dummyElement);
      reportCopyToClipboardBi();
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    };

    const authMessageStyle = {
      dialog: style.dialogSocialAuthUnsupportedMessage,
      custom: style.customSocialAuthUnsupportedMessage,
    };

    const linkCopied = translate(keys.linkCopied, 'Link Copied');
    const copyLinkText = translate(keys.copyLinkText, 'Copy link');

    let inAppMessageTranslation;
    if (isSocialLoginGoogleEnabled || isSocialLoginFacebookEnabled) {
      // @ts-ignore
      const authMethodsTranslationKey:
        | 'google'
        | 'facebook'
        | 'googlefacebook' = `${isSocialLoginGoogleEnabled ? 'google' : ''}${
        isSocialLoginFacebookEnabled ? 'facebook' : ''
      }`;
      inAppMessageTranslation = translate(
        keys.inAppBrowserSocialAuth(mode, authMethodsTranslationKey),
        'To Login with Google or Facebook copy this page link and open it in another browser.',
      );
    }

    return (
      <>
        <div
          data-testid={testIds.socialAuthMessage}
          className={classnames(
            style.inAppBrowserSocialAuth,
            authMessageStyle[styleMode],
          )}
        >
          <div className={classnames(style.socialAuthIcons)}>
            {isSocialLoginGoogleEnabled && (
              <GoogleIcon className={classnames(style.socialIcon)} />
            )}
            {isSocialLoginFacebookEnabled && (
              <FacebookIcon className={classnames(style.socialIcon)} />
            )}
          </div>
          <div className={classnames(style.inAppSocialAuthText)}>
            {inAppMessageTranslation}
            &nbsp;
            <button
              type="button"
              className={classnames(style.copyLink)}
              onClick={copyUrlToClipboard}
              data-testid={testIds.copyLinkButton}
            >
              {copyLinkText}
            </button>
          </div>
        </div>
        <div
          className={classnames(style.hiddenLinkCopiedToast, {
            [style.visiblelinkCopiedToast]: isToastVisible,
          })}
        >
          {linkCopied}
        </div>
      </>
    );
  };
