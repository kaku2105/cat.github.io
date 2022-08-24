import * as React from 'react';
import classnames from 'classnames';
import BasicButton from '../../SiteButton/viewer/skinComps/BaseButton/BasicButton.skin';
import {
  IIFrameConfig,
  IMode,
  IPrivacyStatus,
  ISocialAuthLogin,
  ISocialIcons,
  ISocialVendors,
} from '../MemberLoginDialog.types';
import Preloader from '../../Preloader/viewer/Preloader';
import { MemberLoginDialogTranslationKeys as keys, testIds } from './utils';

export const SocialAuth = React.forwardRef<HTMLIFrameElement, ISocialAuthLogin>(
  (
    {
      id,
      emailSectionDivider,
      switchToAuthWithEmail,
      enabledSocialVendors,
      iframeConfig,
      goToEmailAuthScreen,
      isEmailLoginEnabled,
      style,
      mode,
      ready,
      translate,
      error,
    },
    ref,
  ) => {
    return (
      <>
        <div
          data-testid={testIds.socialAuth}
          className={style.socialLoginWrapper}
        >
          <SocialIcons
            id={id}
            enabledSocialVendors={enabledSocialVendors}
            iframeConfig={iframeConfig}
            style={style}
            mode={mode}
            ready={ready}
            translate={translate}
            error={error}
            ref={ref}
          />
        </div>

        {isEmailLoginEnabled && (
          <>
            <div
              className={classnames(
                style.emailSectionDivider,
                style.sectionDivider,
              )}
            >
              <span className={style.emailSectionDividerText}>
                {emailSectionDivider}
              </span>
            </div>
            <div data-testid="switchToEmailLink" className={style.expandButton}>
              <BasicButton
                label={switchToAuthWithEmail}
                data-testid="switchToEmailLink"
                id={`switchToEmailLink_${id}`}
                isDisabled={false}
                hasPlatformClickHandler={true}
                link={undefined}
                onClick={() => goToEmailAuthScreen(false)}
              />
            </div>
          </>
        )}
      </>
    );
  },
);

export const SocialIcons = React.forwardRef<HTMLIFrameElement, ISocialIcons>(
  (
    {
      enabledSocialVendors,
      iframeConfig,
      style,
      mode,
      translate,
      isHorizontal,
      ready, // Will be set to true if we've recieved a PAGE_READY postMessage from the iframe
      error, // Will be set to a non-empty string if a postMessage handler threw an error
    },
    ref,
  ) => {
    const src = serializeIframeSource(
      { ...iframeConfig, enabledSocialVendors, mode },
      !!isHorizontal,
    );
    const socialVendorsLength = Array.from(enabledSocialVendors).length;
    const height = isHorizontal
      ? '50px'
      : socialVendorsLength * 40 + (socialVendorsLength - 1) * 16 + 4 + 'px';

    const [isSocialIframeLoaded, setSocialIframeLoaded] = React.useState(
      !!ready,
    );

    const socialLoginIframeClass = classnames(style.socialLoginIframe, {
      [style.ready]: isSocialIframeLoaded || ready,
    });
    const title = translate(keys.social.iframeTitle, 'Social login');

    return (
      <div className={style.socialLoginWrapper}>
        <iframe
          data-testid="socialAuthIframe"
          src={src}
          className={socialLoginIframeClass}
          title={title}
          frameBorder="0"
          scrolling="no"
          style={{ height }}
          onLoad={() => setSocialIframeLoaded(true)}
          ref={ref}
        />
        <Preloader enabled={!(isSocialIframeLoaded || ready)} dark={true} />
        <p className={style.socialLoginErrorMsg}>{error}</p>
      </div>
    );
  },
);

export const serializeIframeSource = (
  iframeConfig: IIFrameConfig & {
    enabledSocialVendors: Set<ISocialVendors>;
    mode: IMode;
  },
  isHorizontal: boolean,
) => {
  const params = {
    mode: iframeConfig.mode,
    lang: iframeConfig.language,
    vendors: Array.from(iframeConfig.enabledSocialVendors).join(','),
    extraCss: classnames('svg-style', { horizontal: isHorizontal }),
    visitorId: iframeConfig.biVisitorId,
    bsi: iframeConfig.bsi,
    collectionId: iframeConfig.smCollectionId,
    svSession: iframeConfig.svSession,
    useGoogleSdk: (!!iframeConfig.useGoogleSdk).toString(),
  };
  const paramsString = new URLSearchParams(params).toString();
  const privacyStatus = getPrivacyStatus(iframeConfig.isCommunityChecked);
  const templatePathUrl = `https://users.wix.com/wix-sm/view/social/frame/${iframeConfig.metaSiteId}`;
  return `${templatePathUrl}?${paramsString}#privacyStatus=${privacyStatus}`;
};

export const getPrivacyStatus = (
  isJoinCommunityChecked: boolean,
): IPrivacyStatus => {
  return isJoinCommunityChecked ? 'PUBLIC' : 'PRIVATE';
};
