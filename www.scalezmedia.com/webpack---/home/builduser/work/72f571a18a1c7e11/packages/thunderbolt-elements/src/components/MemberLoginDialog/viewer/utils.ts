import { BusinessLogFn } from '../MemberLoginDialog.types';

export const INVISIBLE_CAPTCHA_SITE_KEY =
  '6LdoPaUfAAAAAJphvHoUoOob7mx0KDlXyXlgrx5v';
export const translationFeature = 'dialogMixinTranslations';
export const PASS_MIN_LEN = 4;
export const PASS_MAX_LEN = 100;

export const testIds = {
  socialAuth: 'socialAuth',
  emailAuth: 'emailAuth',
  socialAuthMessage: 'socialAuthMessage',
  copyLinkButton: 'copyLinkButton',
  switchToSignUp: 'switchToSignUp',
  switchToSignUpDescription: 'switchToSignUpDescription',
  forgotPasswordMobile: 'forgotPasswordMobile',
  forgotPasswordDesktop: 'forgotPasswordDesktop',
  switchToEmailLink: 'switchToEmailLink',
  submit: 'submit',
};

export const MemberLoginDialogTranslationKeys = {
  title: 'dialogMixinTranslation_log_in',
  submitButton: 'dialogMixinTranslations_log_in_btn_new',
  switchDialogLink: 'SMRegister_sign_up_new',
  mobileForgotPassword: 'dialogMixinTranslations_forgot_password_mobile_new',
  forgotPassword: 'dialogMixinTranslations_forgot_password',
  switchToSignUp: 'dialogMixinTranslations_switch_to_signup_material',
  socialSectionDivider: 'dialogMixinTranslations_or_log_in_with',
  emailSectionDivider: 'dialogMixinTranslations_or_email_new',
  inAppBrowserSocialAuth: (
    authMethod: 'signup' | 'login',
    socialMethod: 'google' | 'facebook' | 'googlefacebook',
  ) => {
    // e.g- To Login with Google or Facebook copy this page link and open it in another browser.
    return `dialogMixinTranslations_copy.${authMethod}.${socialMethod}`;
  },
  copyLinkText: 'dialogMixinTranslations_copy_link',
  password: {
    title: 'SMForm_Password',
    label: 'PasswordLogin_Password',
  },
  email: {
    title: 'SMForm_Email',
    label: 'SMForm_Email',
  },
  social: {
    iframeTitle: 'dialogMixinTranslations_social_login',
    google: 'dialogMixinTranslations_login_google',
    facebook: 'dialogMixinTranslations_login_facebook',
  },
  switchToAuthWithEmail: 'dialogMixinTranslations_login_switch_email',
  linkCopied: 'dialogMixinTranslations_link_copied',
};

export const getReportCopyToClipboardBiCallback =
  (
    reportBi: BusinessLogFn,
    options: { biVisitorId: string; metaSiteId: string },
  ) =>
  () =>
    reportBi(
      {
        src: 5,
        evid: 1643,
        ...options,
      },
      { endpoint: 'site-members' },
    );
