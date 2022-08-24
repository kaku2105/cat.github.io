import * as React from 'react';
import { ILink } from '../SignUpDialog.types';
import { ITranslate } from '../../SiteMembersInput/SiteMembersInput.types';
import style from './style/style.scss';
import { SignUpDialogTranslationKeys as keys, testIds } from './constants';
import { PolicyLink } from './PolicyLink';

export const Policies: React.FC<{
  translate: ITranslate;
  isPrivacyPolicyNeeded: boolean;
  isTermsOfUseNeeded: boolean;
  privacyPolicyLink: ILink;
  termsOfUseLink: ILink;
  onCloseDialogCallback: () => void;
}> = ({
  translate,
  isPrivacyPolicyNeeded,
  isTermsOfUseNeeded,
  privacyPolicyLink,
  termsOfUseLink,
  onCloseDialogCallback,
}) => {
  const content = translate(
    keys.policies.content,
    'By signing up, you agree to our',
  );
  const privacyLinkLabel = translate(
    keys.policies.privacyLink,
    'Privacy Policy',
  );
  const and = translate(keys.policies.and, 'and');
  const termsOfUseLinkLabel = translate(
    keys.policies.termsOfUseLink,
    'Terms of Use',
  );

  return (
    <div className={style.policies}>
      <span data-testid={testIds.policies.content}>{content}</span>
      {isTermsOfUseNeeded && (
        <PolicyLink
          onCloseDialogCallback={onCloseDialogCallback}
          privacyLinkLabel={termsOfUseLinkLabel}
          testId={testIds.policies.termsOfUseLink}
          link={termsOfUseLink}
        />
      )}
      {isPrivacyPolicyNeeded && isTermsOfUseNeeded && (
        <span data-testid={testIds.policies.and}>{and}</span>
      )}
      {isPrivacyPolicyNeeded && (
        <PolicyLink
          onCloseDialogCallback={onCloseDialogCallback}
          privacyLinkLabel={privacyLinkLabel}
          testId={testIds.policies.privacyPolicyLink}
          link={privacyPolicyLink}
        />
      )}
    </div>
  );
};
