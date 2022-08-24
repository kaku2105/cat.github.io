import * as React from 'react';
import classNames from 'classnames';
import { MouseEvent, KeyboardEvent } from 'react';
import { getDataAttributes, performOnEnter } from '../../../core/commons/utils';
import { IRequestPasswordResetDialogProps } from '../RequestPasswordResetDialog.types';
import BasicButton from '../../SiteButton/viewer/skinComps/BaseButton/BasicButton.skin';
import SiteMembersInput, {
  ISiteMembersInputRef,
} from '../../SiteMembersInput/viewer/SiteMembersInput';
import SiteMembersDialogLayout from '../../SiteMembersDialogLayout/viewer/SiteMembersDialogLayout';
import {
  serverErrorsHandler,
  validateSiteMembersEmail,
} from '../../SiteMembersInput/viewer/utils';
import style from './style/RequestPasswordResetDialog.scss';
import {
  RequestPasswordResetDialogTranslationKeys as keys,
  translationFeature,
} from './constants';

const RequestPasswordResetDialog: React.FC<IRequestPasswordResetDialogProps> =
  props => {
    const {
      id,
      className,
      isCloseable,
      onCloseDialogCallback,
      onSubmitCallback,
      directionByLanguage = 'ltr',
    } = props;

    const translate = props.translate!.bind(null, translationFeature);
    const [email, setEmail] = React.useState('');

    const headlineId = `requestPasswordResetHeadline_${id}`;

    const titleText = translate(keys.title, 'Reset Password');
    const pleaseEnterEmailText = translate(
      keys.pleaseEnterEmail,
      'Please enter your email address',
    );
    const submitButtonText = translate(
      keys.resetPasswordButton,
      'Reset Password',
    );

    const emailText = {
      title: translate(keys.email.title, 'Email'),
      label: translate(keys.email.label, 'Email'),
    };
    const emailRef = React.useRef<ISiteMembersInputRef>(null);
    const submitForm = async (e: MouseEvent | KeyboardEvent) => {
      e.preventDefault();
      if (emailRef.current!.validate(translate)) {
        try {
          await onSubmitCallback(email);
        } catch (error) {
          const errorMsg = serverErrorsHandler(error);
          const defaultErrorMsg = translate(
            'SMForm_Error_General_Err',
            'Server error. Try again later.',
          );
          emailRef.current!.setError(translate(errorMsg, defaultErrorMsg));
        }
      }
    };

    const onKeyDownHandler = performOnEnter(submitForm);

    return (
      <SiteMembersDialogLayout
        isCloseable={isCloseable}
        translate={props.translate}
        onCloseDialogCallback={onCloseDialogCallback}
        headlineId={headlineId}
      >
        <div
          id={id}
          {...getDataAttributes(props)}
          className={classNames(className, style.requestPasswordResetDialog)}
        >
          <h3 id={headlineId} className={style.title} data-testid="title">
            {titleText}
          </h3>
          <form className={style.wrapper} onKeyDown={onKeyDownHandler}>
            <div data-testid="enterEmailSubtitle" className={style.subtitle}>
              {pleaseEnterEmailText}
            </div>
            <div className={style.content}>
              <SiteMembersInput
                id={`emailInput_${id}`}
                inputType="email"
                data-testid="emailInput"
                value={email}
                label={emailText.label}
                onValueChanged={setEmail}
                ref={emailRef}
                isValid={true}
                autoFocus={true}
                validationFn={validateSiteMembersEmail}
                directionByLanguage={directionByLanguage}
              />
            </div>
            <div className={style.footer}>
              <div data-testid="submit" className={style.actionButton}>
                <BasicButton
                  label={submitButtonText}
                  id={`okButton_${id}`}
                  isDisabled={false}
                  hasPlatformClickHandler={true}
                  link={undefined}
                  onClick={submitForm}
                />
              </div>
            </div>
          </form>
        </div>
      </SiteMembersDialogLayout>
    );
  };

export default RequestPasswordResetDialog;
