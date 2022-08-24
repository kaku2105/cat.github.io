import * as React from 'react';
import classNames from 'classnames';
import {
  IRadioButtonProps,
  IRadioButtonImperativeActions,
} from '../../RadioGroup.types';
import style from './style/RadioButtonDefaultSkin.scss';

const noop = () => {};

const RadioButton: React.ForwardRefRenderFunction<
  IRadioButtonImperativeActions,
  IRadioButtonProps
> = (props, ref) => {
  const {
    name,
    value,
    label,
    checked = false,
    required,
    isDisabled,
    shouldShowValidityIndication,
    onChecked = noop,
    onClick = noop,
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => {
    return {
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      setCustomValidity: message => {
        if (message.type === 'message') {
          inputRef.current?.setCustomValidity(message.message);
        }
      },
      get isFocused() {
        return (
          !!inputRef.current && inputRef.current === document.activeElement
        );
      },
      get isChecked() {
        return !!inputRef.current && inputRef.current.checked;
      },
    };
  });

  const containerClasses = classNames(style.RadioButtonDefaultSkin, {
    [style.disabled]: isDisabled,
    [style.validationIndication]: !!shouldShowValidityIndication,
  });

  const onChange = React.useMemo(
    () => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChecked(event);
      inputRef.current?.focus();
    },
    [onChecked],
  );

  return (
    <label className={containerClasses}>
      <input
        onClick={onClick}
        ref={inputRef}
        type="radio"
        className={style.input}
        checked={checked}
        value={value}
        onChange={onChange}
        required={required}
        disabled={isDisabled}
        name={name}
      />
      <div className={style.circleShadow}>
        <div className={style.circle}></div>
      </div>
      <div className={style.text} data-testid="label">
        {label}
      </div>
    </label>
  );
};

export default React.forwardRef(RadioButton);
