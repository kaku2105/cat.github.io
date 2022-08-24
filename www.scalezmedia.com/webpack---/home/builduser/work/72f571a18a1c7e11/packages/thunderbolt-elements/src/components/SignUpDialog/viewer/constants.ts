import { ILinkTarget } from '../SignUpDialog.types';

export const translationFeature = 'dialogMixinTranslations';

export const SignUpDialogTranslationKeys = {
  title: 'SMRegister_sign_up_new',
  submitButton: 'SMRegister_sign_up_new',
  switchDialogLink: 'dialogMixinTranslations_Log_In',
  mobileForgotPassword: 'dialogMixinTranslations_forgot_password_mobile_new',
  switchToSignIn: 'SMRegister_Already_Have_User',
  socialSectionDivider: 'dialogMixinTranslations_or_sign_up_with',
  emailSectionDivider: 'dialogMixinTranslations_or_email_new',
  copyLinkText: 'dialogMixinTranslations_copy_link',
  linkCopied: 'dialogMixinTranslations_link_copied',
  password: {
    title: 'SMForm_Password',
    placeholder: 'PasswordLogin_Password',
  },
  email: {
    title: 'SMForm_Email',
    placeholder: 'SMForm_Email',
  },
  social: {
    iframeTitle: 'dialogMixinTranslations_social_login',
    google: 'dialogMixinTranslations_login_google',
    facebook: 'dialogMixinTranslations_login_facebook',
  },
  switchToAuthWithEmail: 'dialogMixinTranslations_signup_switch_email',
  community: {
    label: 'SMForm_Policies_Join_Community_Label_new',
    read: {
      more: 'SMForm_Policies_Join_Community_Link_new',
      less: 'SMForm_Policies_Join_Community_Link_Less_new',
    },
    content: 'SMForm_Policies_Join_Community_Read_More_Content_new',
    codeOfConductLink: 'SMForm_Policies_CodeOfConduct_new',
  },
  policies: {
    content: 'SMForm_Policies_Agreement_new',
    termsOfUseLink: 'SMForm_Policies_TermsOfUse_new',
    privacyLink: 'SMForm_Policies_PrivacyPolicy_new',
    and: 'SMForm_Policies_And_new',
  },
};

export const testIds = {
  iframe: 'socialAuthIframe',
  headline: 'signUp.headline',
  copyLinkButton: 'copyLinkButton',
  switchToSignUp: {
    title: 'signUp.switchToSignUp',
    description: 'signUp.switchToSignUpDescription',
  },
  switchToEmailLink: 'switchToEmailLink',
  submit: 'submit',
  community: {
    readMore: 'signUp.communityReadMore',
    label: 'signUp.communityLabel',
    content: 'signUp.communityContent',
    codeOfConductLink: 'signUp.codeOfConductLink',
  },
  policies: {
    content: 'signUp.privacyPolicyContent',
    privacyPolicyLink: 'signUp.privacyPolicyLink',
    and: 'signUp.policiesAnd',
    termsOfUseLink: 'signUp.termsOfUseLink',
  },
  socialAuthMessage: 'socialAuthMessage',
  signUpSocialAuth: 'signUpSocialAuth',
  signUpEmailAuth: 'signUpEmailAuth',
};

export const closeDialog =
  (target: ILinkTarget, onCloseDialogCallback: () => void) => () => {
    if (target === '_self') {
      onCloseDialogCallback();
    }
  };
