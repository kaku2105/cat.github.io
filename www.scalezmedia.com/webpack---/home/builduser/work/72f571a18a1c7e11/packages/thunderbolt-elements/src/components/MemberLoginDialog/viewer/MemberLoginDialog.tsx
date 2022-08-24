import * as React from 'react';
import classnames from 'classnames';
import {
  IMemberLoginDialogProps,
  IIFrameConfig,
  ISocialVendors,
} from '../MemberLoginDialog.types';
import Preloader from '../../Preloader/viewer/Preloader';
import { activateByEnterButton } from '../../../core/commons/a11y';
import { useSocialErrorHandler } from '../useSocialErrorHandler';
import { getDataAttributes } from '../../../core/commons/utils';
import { SocialAuth, SocialIcons } from './SocialAuth';
import { EmailAuth } from './EmailAuth';
// eslint-disable-next-line import/order
import SiteMembersDialogLayout from '../../SiteMembersDialogLayout/viewer/SiteMembersDialogLayout';
import style from './style/style.scss';
import {
  translationFeature,
  MemberLoginDialogTranslationKeys as keys,
  getReportCopyToClipboardBiCallback,
} from './utils';
import { useAuthIframeSubscription } from './useAuthIframeSubscription';
import { UnsupportedSocialAuthMessage } from './UnsupportedSocialAuthMessage';

const MemberLoginDialog: React.FC<IMemberLoginDialogProps> = props => {
  /* eslint-disable jsx-a11y/anchor-is-valid */
  const {
    id,
    className,
    isSocialLoginGoogleEnabled,
    isSocialLoginFacebookEnabled,
    isEmailLoginEnabled,
    isSocialAuthSupported,
    submit,
    onSwitchDialogLinkClick,
    onForgetYourPasswordClick,
    language,
    biVisitorId,
    bsi,
    smCollectionId,
    svSession,
    metaSiteId,
    onCloseDialogCallback,
    isCloseable,
    onTokenMessage,
    onBackendSocialLogin,
    reportBi,
    displayMode,
    getHostReadyPayload,
    directionByLanguage,
  } = props;
  const translate = props.translate!.bind(null, translationFeature);
  const headlineId = `loginHeadline_${id}`;
  const [
    socialAuthError,
    translateAndSetSocialAuthError,
    resetSocialAuthError,
  ] = useSocialErrorHandler(translate);
  const formType = 'default';

  const [iframeReady, setIframeReady] = React.useState(false);
  const iframeRef = useAuthIframeSubscription(
    resetSocialAuthError(onTokenMessage),
    resetSocialAuthError(onBackendSocialLogin),
    reportBi,
    displayMode,
    formType,
    undefined,
    () => setIframeReady(true),
    translateAndSetSocialAuthError,
    getHostReadyPayload,
  );

  const iframeConfig: IIFrameConfig = {
    bsi,
    language,
    biVisitorId,
    smCollectionId,
    svSession,
    metaSiteId,
    isCommunityChecked: false,
    useGoogleSdk: props.useGoogleSdk,
  };

  const enabledSocialVendors = new Set<ISocialVendors>();
  if (isSocialLoginGoogleEnabled) {
    enabledSocialVendors.add('google');
  }
  if (isSocialLoginFacebookEnabled) {
    enabledSocialVendors.add('facebook');
  }
  const isExternalWebsiteInSocialInAppBrowser =
    !isSocialAuthSupported && isEmailLoginEnabled;
  const isSocialAuthEnabled =
    isSocialLoginGoogleEnabled || isSocialLoginFacebookEnabled;
  // If no social auth enabled or we in external wix site inside social in app browser we skip to sign in with email page
  const [showSocialAuthScreen, setShowSocialAuthScreen] = React.useState(
    isSocialAuthEnabled && !isExternalWebsiteInSocialInAppBrowser,
  );
  const [isFormLoading, setIsFormLoading] = React.useState(false);

  const title = translate(keys.title, 'Log In');
  const submitButtonLabel = translate(keys.submitButton, 'Log In');
  const switchDialogLink = translate(keys.switchDialogLink, 'Sign Up');
  const switchToSignUp = translate(keys.switchToSignUp, 'New to this site?');
  const emailSectionDivider = translate(keys.emailSectionDivider, 'or');
  const switchToAuthWithEmail = translate(
    keys.switchToAuthWithEmail,
    'Log in with Email',
  );
  const socialSectionDividerLabel = translate(
    keys.socialSectionDivider,
    'or log in with',
  );

  const presentedAuthMethodScreen = showSocialAuthScreen ? (
    <SocialAuth
      id={id}
      emailSectionDivider={emailSectionDivider}
      switchToAuthWithEmail={switchToAuthWithEmail}
      goToEmailAuthScreen={resetSocialAuthError(setShowSocialAuthScreen)}
      enabledSocialVendors={enabledSocialVendors}
      iframeConfig={iframeConfig}
      style={style}
      isEmailLoginEnabled={isEmailLoginEnabled}
      mode="login"
      ready={iframeReady}
      ref={iframeRef}
      translate={translate}
      error={socialAuthError}
    />
  ) : (
    <EmailAuth
      id={id}
      translate={translate}
      onForgetYourPasswordClick={onForgetYourPasswordClick}
      onSubmitStart={() => setIsFormLoading(true)}
      onSubmitEnd={() => setIsFormLoading(false)}
      submit={submit}
      style={style}
      mode="login"
      submitButtonLabel={submitButtonLabel}
      language={language}
      directionByLanguage={directionByLanguage}
      shouldUseInvisibleCaptcha={props.shouldUseInvisibleCaptcha}
      shouldForceCaptchaVerification={props.shouldForceCaptchaVerification}
    />
  );

  return (
    <SiteMembersDialogLayout
      isCloseable={isCloseable}
      translate={props.translate}
      onCloseDialogCallback={onCloseDialogCallback}
      headlineId={headlineId}
      displayMode={displayMode}
      dialogPosition="start"
    >
      <div
        id={id}
        {...getDataAttributes(props)}
        className={classnames(className, style.memberLoginContent, {
          [style.formLoading]: isFormLoading,
          [style.rtl]: directionByLanguage === 'rtl',
        })}
      >
        <h1 id={headlineId} className={style.title}>
          {title}
        </h1>
        <div
          className={classnames(style.contentWrapper, style.wrapper, {
            [style.horizontal]: isSocialAuthEnabled,
            [style.socialLoginMode]: showSocialAuthScreen,
            [style.vertical]: !isSocialAuthEnabled,
            [style.emailLoginMode]: !showSocialAuthScreen,
          })}
        >
          <div className={style.switchToSignUpContainer}>
            <span
              data-testid="switchToSignUpDescription"
              className={style.switchToSignUpText}
            >
              {switchToSignUp}
            </span>
            <button
              className={style.switchDialogLink}
              data-testid="switchToSignUp"
              onClick={onSwitchDialogLinkClick}
              onKeyDown={activateByEnterButton}
              autoFocus
              type="button"
            >
              {switchDialogLink}
            </button>
          </div>
          {presentedAuthMethodScreen}
          {isSocialAuthEnabled &&
            (isExternalWebsiteInSocialInAppBrowser ? (
              <UnsupportedSocialAuthMessage
                isSocialLoginGoogleEnabled={isSocialLoginGoogleEnabled}
                isSocialLoginFacebookEnabled={isSocialLoginFacebookEnabled}
                translate={translate}
                mode="login"
                styleMode="dialog"
                reportCopyToClipboardBi={getReportCopyToClipboardBiCallback(
                  reportBi,
                  { biVisitorId, metaSiteId },
                )}
              />
            ) : (
              <div
                className={classnames({
                  [style.hideAuthMethod]: showSocialAuthScreen,
                })}
              >
                <div
                  className={classnames(
                    style.socialSectionDivider,
                    style.sectionDivider,
                  )}
                >
                  <span>{socialSectionDividerLabel}</span>
                </div>
                <SocialIcons
                  id={id}
                  enabledSocialVendors={enabledSocialVendors}
                  iframeConfig={iframeConfig}
                  style={style}
                  translate={translate}
                  mode="login"
                  ready={iframeReady}
                  ref={iframeRef}
                  error={socialAuthError}
                  isHorizontal={true}
                />
              </div>
            ))}
        </div>
      </div>
      <div className={style.preloaderContainer}>
        <Preloader enabled={isFormLoading} dark={true} />
      </div>
    </SiteMembersDialogLayout>
  );
};

export default MemberLoginDialog;
