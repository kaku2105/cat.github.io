import * as React from 'react';
import classnames from 'classnames';
import { ISiteMembersInputProps, ITranslate } from '../SiteMembersInput.types';
import TextInput from '../../TextInput/viewer/TextInput';
import { ITextInputImperativeActions } from '../../TextInput/TextInput.types';
import { getDataAttributes } from '../../../core/commons/utils';
import style from './style/style.scss';
import { testIds } from './constants';

type IRefActions = {
  validate: (translate: ITranslate) => boolean;
  setError: (errorMsg?: string) => void;
};

export type ISiteMembersInputRef = HTMLInputElement & IRefActions;

const SiteMembersInput: React.ForwardRefRenderFunction<
  IRefActions,
  ISiteMembersInputProps
> = (props, ref) => {
  const {
    id,
    className,
    label,
    value,
    isValid,
    inputType,
    autoFocus,
    placeholder,
    validationFn,
    errorMessage,
    onValueChanged,
    directionByLanguage,
    maxLength,
    borderInput = false,
  } = props;
  const inputRef = React.useRef<ITextInputImperativeActions>(null);
  const [shouldShowValidityIndication, setShouldShowValidityIndication] =
    React.useState(!isValid);
  const [inlineErrorMsg, setInlineErrorMsg] = React.useState<
    string | undefined
  >(errorMessage);
  const errorMessageId = `siteMembersInputErrorMessage_${id}`;
  React.useImperativeHandle(ref, () => {
    return {
      validate: (translate: ITranslate) => {
        const errorMsg = validationFn?.(value, translate);

        if (!errorMsg) {
          return true;
        }
        setShouldShowValidityIndication(true);
        setInlineErrorMsg(errorMsg);
        inputRef.current!.setCustomValidity({
          type: 'message',
          message: errorMsg,
        });
        inputRef.current!.focus();
        return false;
      },
      setError: (errorMsg?: string) => {
        setShouldShowValidityIndication(true);
        const message = errorMsg ? errorMsg : '';
        inputRef.current!.setCustomValidity({
          type: 'message',
          message,
        });
        if (!errorMsg) {
          return;
        }
        setInlineErrorMsg(errorMsg);
      },
    };
  });

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={classnames(className, style.emailInput, {
        [style.invalid]: !borderInput && shouldShowValidityIndication,
        [style.rtl]: directionByLanguage === 'rtl',
      })}
      data-testid={testIds.container}
    >
      <TextInput
        maxLength={maxLength}
        ref={inputRef}
        id={`input_${id}`}
        inputType={inputType}
        skin="AppsTextInputSkin"
        data-testid={testIds.input}
        value={value}
        label={label}
        placeholder={placeholder}
        required
        autoComplete={false}
        autoComplete_="off"
        readOnly={false}
        isDisabled={false}
        autoFocus={autoFocus}
        shouldShowValidityIndication={shouldShowValidityIndication}
        hideValidityIndication={() => {
          setShouldShowValidityIndication(false);
          setInlineErrorMsg(undefined);
        }}
        onValueChange={onValueChanged}
        ariaAttributes={{
          describedBy: !inlineErrorMsg ? undefined : errorMessageId,
        }}
      />
      {inlineErrorMsg && (
        <span
          id={errorMessageId}
          data-testid={testIds.inlineErrorMsg}
          className={classnames({
            [style.rtl]: directionByLanguage === 'rtl',
          })}
        >
          {inlineErrorMsg}
        </span>
      )}
    </div>
  );
};

export default React.forwardRef(SiteMembersInput);
