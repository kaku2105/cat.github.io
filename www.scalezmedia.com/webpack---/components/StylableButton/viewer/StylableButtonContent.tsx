import React, { ReactNode } from 'react';
import { TestIds } from '../constants';
import { classes, st } from './StylableButton.component.st.css';

const ButtonContent: React.FC<{
  icon?: ReactNode;
  label?: string;
  override?: boolean;
}> = props => {
  const { label, icon, override } = props;
  return (
    <div className={classes.container}>
      {label && (
        <span className={classes.label} data-testid={TestIds.buttonLabel}>
          {label}
        </span>
      )}
      {icon && (
        <span
          className={st(classes.icon, { override: !!override })}
          aria-hidden="true"
          data-testid={TestIds.buttonIcon}
        >
          {icon}
        </span>
      )}
    </div>
  );
};
export default ButtonContent;
