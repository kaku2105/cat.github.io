import * as React from 'react';
import classNames from 'classnames';
import {
  IRadioGroupProps,
  IRadioGroupImperativeActions,
  IRadioButtonImperativeActions,
  RadioGroupOption,
} from '../RadioGroup.types';
import { getDataAttributes } from '../../../core/commons/utils';
import style from './style/RadioGroupDefaultSkin.scss';
import RadioButton from './RadioButton/RadioButton';

const noop = () => {};

// TODO onBlur and onFocus are not implemented in RadioGroup in bolt
// If we are going to implement them we need to make sure they are not triggered on changing between radio buttons
const RadioGroup: React.ForwardRefRenderFunction<
  IRadioGroupImperativeActions,
  IRadioGroupProps
> = (props, ref) => {
  const {
    id,
    className,
    label = '',
    value,
    options,
    required,
    isDisabled,
    shouldShowValidityIndication,
    validateValueAndShowIndication = noop,
    onChange = noop,
    setValue = noop,
    onClick = noop,
    onDblClick = noop,
    onMouseEnter = noop,
    onMouseLeave = noop,
  } = props;

  const inputRefs = React.useRef<Array<IRadioButtonImperativeActions | null>>(
    [],
  );

  React.useImperativeHandle(ref, () => {
    return {
      focus: () => {
        const checkedItem =
          inputRefs.current?.find(_ref => _ref?.isChecked) ||
          inputRefs.current?.[0];

        checkedItem?.focus();
      },
      blur: () => {
        const focusedItem = inputRefs.current?.find(_ref => _ref?.isFocused);

        focusedItem?.blur();
      },
      setCustomValidity: message => {
        inputRefs.current?.forEach(_ref => {
          _ref?.setCustomValidity(message);
        });
      },
    };
  });

  const _onChange = React.useMemo(
    () => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      validateValueAndShowIndication();
      onChange(event);
    },
    [setValue, onChange, validateValueAndShowIndication],
  );

  const _onClick: React.MouseEventHandler<HTMLInputElement> = event => {
    if (!isDisabled) {
      onClick(event);
    }
  };

  const _onDblClick: React.MouseEventHandler<HTMLInputElement> = event => {
    if (!isDisabled) {
      onDblClick(event);
    }
  };

  const _onMouseEnter: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onMouseEnter(event);
    }
  };

  const _onMouseLeave: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onMouseLeave(event);
    }
  };

  const containerClasses = classNames(className, style.RadioGroupDefaultSkin, {
    [style.requiredIndication]: required && label,
  });

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={containerClasses}
      onDoubleClick={_onDblClick}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
    >
      <fieldset>
        <legend className={style.groupLabelLegend}>
          {label && (
            <div data-testid="groupLabel" className={style.groupLabel}>
              {label}
            </div>
          )}
        </legend>
        <div className={style.items}>
          {options.map((option: RadioGroupOption, index: number) => (
            <RadioButton
              ref={el => (inputRefs.current[index] = el)}
              key={index}
              {...option}
              checked={option.value === value}
              required={required}
              isDisabled={isDisabled}
              shouldShowValidityIndication={shouldShowValidityIndication}
              onClick={_onClick}
              onChecked={_onChange}
              name={id}
            ></RadioButton>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default React.forwardRef(RadioGroup);
