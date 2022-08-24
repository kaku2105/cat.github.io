import * as React from 'react';
import classnames from 'classnames';
import { ISignUpDialogProps } from '../SignUpDialog.types';
import {
  IIFrameConfig,
  ISocialVendors,
} from '../../MemberLoginDialog/MemberLoginDialog.types';
import { activateByEnterButton } from '../../../core/commons/a11y';
import {
  SocialAuth,
  SocialIcons,
} from '../../MemberLoginDialog/viewer/SocialAuth';
import { EmailAuth } from '../../MemberLoginDialog/viewer/EmailAuth';
import SiteMembersDialogLayout from '../../SiteMembersDialogLayout/viewer/SiteMembersDialogLayout';
import { useAuthIframeSubscription } from '../../MemberLoginDialog/viewer/useAuthIframeSubscription';
import { useSocialErrorHandler } from '../../MemberLoginDialog/useSocialErrorHandler';
import { UnsupportedSocialAuthMessage } from '../../MemberLoginDialog/viewer/UnsupportedSocialAuthMessage';
import { getReportCopyToClipboardBiCallback } from '../../MemberLoginDialog/viewer/utils';
import { getDataAttributes } from '../../../core/commons/utils';
import { Community } from './Community';
import { Policies } from './Policies';
import style from './style/style.scss';
import {
  translationFeature,
  SignUpDialogTranslationKeys as keys,
  testIds,
} from './constants';

const SignUpDialog: React.FC<ISignUpDialogProps> = props => {
  const {
    id,
    className,
    isSocialLoginGoogleEnabled,
    isSocialLoginFacebookEnabled,
    isEmailLoginEnabled,
    isSocialAuthSupported,
    submit,
    onSwitchDialogLinkClick,
    language,
    biVisitorId,
    bsi,
    smCollectionId,
    svSession,
    metaSiteId,
    isCommunityInstalled,
    isPrivacyPolicyNeeded,
    isTermsOfUseNeeded,
    isCodeOfConductNeeded,
    codeOfConductLink,
    privacyPolicyLink,
    termsOfUseLink,
    onCloseDialogCallback,
    isCloseable,
    joinCommunityCheckedByDefault,
    onTokenMessage,
    onBackendSocialLogin,
    reportBi,
    displayMode,
    getHostReadyPayload,
    directionByLanguage,
  } = props;
  const translate = props.translate!.bind(null, translationFeature);
  const [
    socialAuthError,
    translateAndSetSocialAuthError,
    resetSocialAuthError,
  ] = useSocialErrorHandler(translate);
  const [isCommunityChecked, setCommunityChecked] = React.useState<boolean>(
    isCommunityInstalled && joinCommunityCheckedByDefault,
  );
  const [iframeReady, setIframeReady] = React.useState(false);

  const headlineId = `signUpHeadline_${id}`;
  const formType = 'default';

  const iframeRef = useAuthIframeSubscription(
    resetSocialAuthError(onTokenMessage),
    resetSocialAuthError(onBackendSocialLogin),
    reportBi,
    displayMode,
    formType,
    isCommunityChecked,
    () => setIframeReady(true),
    translateAndSetSocialAuthError,
    getHostReadyPayload,
  );

  const iframeConfig: IIFrameConfig = {
    language,
    biVisitorId,
    bsi,
    smCollectionId,
    svSession,
    metaSiteId,
    isCommunityChecked,
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
  // If no social auth enabled or we in external wix site inside social in app browser we skip to sign up with email page
  const [showSocialAuthScreen, setShowSocialAuthScreen] = React.useState(
    isSocialAuthEnabled && !isExternalWebsiteInSocialInAppBrowser,
  );
  const [isFormLoading, setIsFormLoading] = React.useState(false);

  const title = translate(keys.title, 'Sign Up');
  const submitButtonLabel = translate(keys.submitButton, 'Sign Up');
  const switchDialogLink = translate(keys.switchDialogLink, 'Log In');
  const switchToSignUp = translate(keys.switchToSignIn, 'Already a member?');
  const emailSectionDivider = translate(keys.emailSectionDivider, 'or');
  const switchToAuthWithEmail = translate(
    keys.switchToAuthWithEmail,
    'Sign up with Email',
  );
  const socialSectionDividerLabel = translate(
    keys.socialSectionDivider,
    'or sign up with',
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
      mode="signup"
      isEmailLoginEnabled={isEmailLoginEnabled}
      translate={translate}
      ref={iframeRef}
      ready={iframeReady}
      error={socialAuthError}
    />
  ) : (
    <EmailAuth
      id={id}
      translate={translate}
      onSubmitStart={() => setIsFormLoading(true)}
      onSubmitEnd={() => setIsFormLoading(false)}
      submit={submit}
      style={style}
      mode="signup"
      submitButtonLabel={submitButtonLabel}
      isCommunityChecked={isCommunityChecked}
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
        className={classnames(classnames(className, style.memberLoginContent), {
          [style.formLoading]: isFormLoading,
          [style.rtl]: directionByLanguage === 'rtl',
        })}
      >
        <h1
          id={`signUpHeadline_${id}`}
          className={style.title}
          data-testid={testIds.headline}
        >
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
              data-testid={testIds.switchToSignUp.description}
              className={style.switchToSignUpText}
            >
              {switchToSignUp}
            </span>
            <button
              className={style.switchDialogLink}
              data-testid={testIds.switchToSignUp.title}
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
                mode="signup"
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
                  mode="signup"
                  ready={iframeReady}
                  ref={iframeRef}
                  error={socialAuthError}
                  isHorizontal={true}
                />
              </div>
            ))}
        </div>
        <div className={style.formFooter}>
          {isCommunityInstalled && (
            <Community
              checked={isCommunityChecked}
              setChecked={setCommunityChecked}
              translate={translate}
              directionByLanguage={directionByLanguage}
              isCodeOfConductNeeded={isCodeOfConductNeeded}
              codeOfConductLink={codeOfConductLink}
              onCloseDialogCallback={onCloseDialogCallback}
            />
          )}
          {(isPrivacyPolicyNeeded || isTermsOfUseNeeded) && (
            <Policies
              translate={translate}
              isPrivacyPolicyNeeded={isPrivacyPolicyNeeded}
              isTermsOfUseNeeded={isTermsOfUseNeeded}
              termsOfUseLink={termsOfUseLink}
              privacyPolicyLink={privacyPolicyLink}
              onCloseDialogCallback={onCloseDialogCallback}
            />
          )}
        </div>
      </div>
      <div
        className={classnames(style.preloader, style.circlePreloader, {
          [style.formLoading]: isFormLoading,
        })}
      />
    </SiteMembersDialogLayout>
  );
};

export default SignUpDialog;
