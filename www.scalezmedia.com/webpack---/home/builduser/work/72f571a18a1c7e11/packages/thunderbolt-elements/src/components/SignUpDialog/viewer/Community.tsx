import * as React from 'react';
import classnames from 'classnames';
import { ILink } from '../SignUpDialog.types';
import { ITranslate } from '../../SiteMembersInput/SiteMembersInput.types';
import { IDirection } from '../../MemberLoginDialog/MemberLoginDialog.types';
import style from './style/style.scss';
import { SignUpDialogTranslationKeys as keys, testIds } from './constants';
import { PolicyLink } from './PolicyLink';

export const Community: React.FC<{
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  isCodeOfConductNeeded: boolean;
  codeOfConductLink: ILink;
  translate: ITranslate;
  directionByLanguage: IDirection;
  onCloseDialogCallback: () => void;
}> = ({
  checked,
  setChecked,
  translate,
  directionByLanguage,
  isCodeOfConductNeeded,
  codeOfConductLink,
  onCloseDialogCallback,
}) => {
  const [isReadMoreOpen, setReadMoreOpen] = React.useState(false);

  const label = translate(keys.community.label, `Join this site’s community.`);
  const readMore = translate(keys.community.read.more, 'Read more');
  const readLess = translate(keys.community.read.less, 'Read less');
  const content = translate(
    keys.community.content,
    `Connect with members of our site. Leave comments, follow people and more. Your nickname, profile image, and public activity will be visible on our site.`,
  );
  const codeOfConductLinkLabel = translate(
    keys.community.codeOfConductLink,
    `Code of Conduct.`,
  );
  const toggleCommunity = () => setChecked(!checked);
  const toggleReadMore = () => setReadMoreOpen(!isReadMoreOpen);
  return (
    <div className={style.communityCheckboxWrapper}>
      <div
        className={classnames(style.communityCheckboxFirstRow, {
          [style.rtl]: directionByLanguage === 'rtl',
        })}
      >
        <label data-testid={testIds.community.label}>
          <input
            name="isGoing"
            type="checkbox"
            checked={checked}
            onChange={toggleCommunity}
          />
          {label}
        </label>
        <button
          className={style.dialogLink}
          onClick={toggleReadMore}
          data-testid={testIds.community.readMore}
          type="button"
        >
          {isReadMoreOpen ? readLess : readMore}
        </button>
      </div>
      {isReadMoreOpen && (
        <div>
          <span data-testid={testIds.community.content}>{content}</span>
          {isCodeOfConductNeeded && (
            <PolicyLink
              onCloseDialogCallback={onCloseDialogCallback}
              privacyLinkLabel={codeOfConductLinkLabel}
              testId={testIds.community.codeOfConductLink}
              link={codeOfConductLink}
              className={style.codeOfConductLink}
            />
          )}
        </div>
      )}
    </div>
  );
};
