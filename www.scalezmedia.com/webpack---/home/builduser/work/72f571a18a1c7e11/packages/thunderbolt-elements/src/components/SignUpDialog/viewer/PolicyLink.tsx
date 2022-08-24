import * as React from 'react';
import classNames from 'classnames';
import { IPolicyLink } from '../SignUpDialog.types';
import { closeDialog } from './constants';
import style from './style/style.scss';

export const PolicyLink: React.FC<IPolicyLink> = ({
  onCloseDialogCallback,
  privacyLinkLabel,
  link,
  testId,
  className,
}) => {
  return (
    <a
      className={classNames(style.dialogLink, className)}
      href={link.href}
      target={link.target}
      rel="noreferrer"
      data-testid={testId}
      onClick={closeDialog(link.target, onCloseDialogCallback)}
    >
      {privacyLinkLabel}
    </a>
  );
};
