import * as React from 'react';
import { MouseEvent, KeyboardEvent } from 'react';
import classnames from 'classnames';
import { performOnEnter } from '../../../core/commons/utils';
import { IEmailAuthProps } from '../MemberLoginDialog.types';
import BasicButton from '../../SiteButton/viewer/skinComps/BaseButton/BasicButton.skin';
import SiteMembersInput, {
  ISiteMembersInputRef,
} from '../../SiteMembersInput/viewer/SiteMembersInput';
import {
  serverErrorsHandler,
  validateSiteMembersEmail,
  validateSiteMembersPassword,
} from '../../SiteMembersInput/viewer/utils';
import Captcha from '../../Captcha/viewer/Captcha';
import { useInvisibleCaptcha } from '../useInvisibleCaptcha';
import { ITranslate } from '../../SiteMembersInput/SiteMembersInput.types';
import { MemberLoginDialogTranslationKeys as keys, testIds } from './utils';

export const EmailAuth: React.FC<IEmailAuthProps> = ({
  id,
  translate,
  onForgetYourPasswordClick,
  onSubmitStart,
  onSubmitEnd,
  submit,
  style,
  mode,
  submitButtonLabel,
  isCommunityChecked,
  language,
  directionByLanguage,
  shouldUseInvisibleCaptcha,
  shouldForceCaptchaVerification = false,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [recaptchaToken, setReCaptchaToken] = React.useState('');
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [shouldRenderACaptchaState, setShouldRenderACaptchaState] =
    React.useState(shouldForceCaptchaVerification);
  const [executeInvisibleCaptcha] = useInvisibleCaptcha({
    language,
    shouldUseInvisibleCaptcha,
  });
  const isSignIn = mode === 'login';
  const startLoading = () => {
    onSubmitStart();
    setIsButtonDisabled(true);
  };
  const stopLoading = () => {
    setIsButtonDisabled(false);
    onSubmitEnd();
  };

  const mobileForgotPassword = translate(
    keys.mobileForgotPassword,
    'Forgot password?',
  );
  const forgotPassword = translate(keys.forgotPassword, 'Forgot password?');
  const passwordText = {
    title: translate(keys.password.title, 'Password'),
    label: translate(keys.password.label, 'Password'),
  };
  const emailText = {
    title: translate(keys.email.title, 'Email'),
    label: translate(keys.email.label, 'Email'),
  };
  const emailRef = React.useRef<ISiteMembersInputRef>(null);
  const passwordRef = React.useRef<ISiteMembersInputRef>(null);

  const submitForm = _submitForm(
    passwordRef,
    emailRef,
    translate,
    startLoading,
    shouldUseInvisibleCaptcha,
    executeInvisibleCaptcha,
    mode,
    submit,
    email,
    password,
    recaptchaToken,
    setShouldRenderACaptchaState,
    isSignIn,
    stopLoading,
    isCommunityChecked,
  );
  const onKeyDownHandler = performOnEnter(submitForm);

  return (
    <>
      <form
        data-testid={testIds.emailAuth}
        className={style.customLogin}
        onKeyDown={onKeyDownHandler}
      >
        <div className={style.content}>
          <div className={style.email}>
            <SiteMembersInput
              id={`emailInput_${id}`}
              inputType="email"
              data-testid="emailInput"
              value={email}
              label={emailText.label}
              onValueChanged={_email => setEmail(_email)}
              ref={emailRef}
              isValid={true}
              autoFocus={true}
              validationFn={validateSiteMembersEmail}
              directionByLanguage={directionByLanguage}
            />
          </div>
          <div className={style.password}>
            <SiteMembersInput
              id={`passwordInput_${id}`}
              inputType="password"
              data-testid="passwordInput"
              value={password}
              label={passwordText.label}
              onValueChanged={_password => setPassword(_password)}
              ref={passwordRef}
              isValid={true}
              validationFn={validateSiteMembersPassword[mode]}
              directionByLanguage={directionByLanguage}
            />
          </div>
        </div>
        {isSignIn && (
          <div className={style.switchLinkContainer}>
            <button
              className={classnames(style.forgotYourPasswordLink, style.mobile)}
              data-testid="forgotPasswordMobile"
              onClick={onForgetYourPasswordClick}
              type="button"
            >
              {mobileForgotPassword}
            </button>
            <button
              className={classnames(
                style.forgotYourPasswordLink,
                style.desktop,
              )}
              data-testid="forgotPasswordDesktop"
              onClick={onForgetYourPasswordClick}
              type="button"
            >
              {forgotPassword}
            </button>
          </div>
        )}
        {shouldRenderACaptchaState && (
          <div className={style.captchaWrapper}>
            <Captcha
              language={language}
              id="signInCaptcha"
              onTokenChange={(token = '') => {
                setReCaptchaToken(token);
              }}
              token={recaptchaToken}
              isMobileFriendly={false}
            />
          </div>
        )}
        <div data-testid="submit" className={style.actionButton}>
          <BasicButton
            label={submitButtonLabel}
            id={`okButton_${id}`}
            isDisabled={isButtonDisabled}
            hasPlatformClickHandler={true}
            link={undefined}
            onClick={submitForm}
          />
        </div>
      </form>
    </>
  );
};
function _submitForm(
  passwordRef: React.RefObject<ISiteMembersInputRef>,
  emailRef: React.RefObject<ISiteMembersInputRef>,
  translate: ITranslate,
  startLoading: () => void,
  shouldUseInvisibleCaptcha: boolean,
  executeInvisibleCaptcha: (action: string) => Promise<string>,
  mode: string,
  submit: (
    email: string,
    password: string,
    options?: {
      recaptchaToken?: string;
      invisibleRecaptchaToken?: string;
      isCommunityChecked?: boolean;
    },
  ) => Promise<void>,
  email: string,
  password: string,
  recaptchaToken: string,
  setShouldRenderACaptchaState: React.Dispatch<React.SetStateAction<boolean>>,
  isSignIn: boolean,
  stopLoading: () => void,
  isCommunityChecked?: boolean,
) {
  return async (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    const isPasswordValid = passwordRef.current!.validate(translate);
    const isEmailValid = emailRef.current!.validate(translate);
    if (isEmailValid && isPasswordValid) {
      startLoading();
      try {
        // We don't want an issue with the captcha to block the submit
        const invisibleRecaptchaToken = shouldUseInvisibleCaptcha
          ? await executeInvisibleCaptcha(mode).catch(() => undefined)
          : undefined;
        await submit(email, password, {
          // an empty recaptchaToken might be '' so in case the captcha is empty we prefer
          // to pass undefined over an empty string.
          recaptchaToken: recaptchaToken ? recaptchaToken : undefined,
          isCommunityChecked,
          invisibleRecaptchaToken,
        });
      } catch (error) {
        // In case of admin approval / email approval flow the dialog will be replaced with
        // another dialog so the following refs will be lost.
        if (error === 'authentication canceled') {
          return;
        }
        const errorMsg = serverErrorsHandler(error);
        // 19971 is the error code for telling the user he needs to fill the reCaptcha.
        if (errorMsg.includes('19971')) {
          // There is an edge case where the client FT for verifying a captcha might be
          // off while the server FT might be on, in here we handle this case by
          // overriding the client FT state in case we get from the server a requirement
          // for sending a captcha token.
          setShouldRenderACaptchaState(true);
        }
        const defaultErrorMsg = translate(
          'SMForm_Error_General_Err',
          'Server error. Try again later.',
        );
        if (isSignIn) {
          passwordRef.current?.setError(translate(errorMsg, defaultErrorMsg));
          emailRef.current?.setError();
        } else {
          emailRef.current?.setError(translate(errorMsg, defaultErrorMsg));
        }
      }
      stopLoading();
    }
  };
}
