import * as React from 'react';
import {
  IOnBackendSocialLogin,
  IOnTokenMessage,
  ISocialVendors,
  IButtonClickedMsg,
  BusinessLogFn,
  IDisplayMode,
  IFormType,
} from '../MemberLoginDialog.types';

const MSG_TYPES = {
  AUTH_TOKEN: 'auth-token',
  AUTH_DONE: 'auth-done',
  AUTH_CLICKED: 'auth-clicked',
  PAGE_READY: 'page-ready',
  HOST_READY: 'host-ready',
};

const id = 'wix-social-login';
const defaultIframeURL = 'about:blank';

const setPostMessageHandler = (callback: any) => {
  const handlerWrap = function (msg: any) {
    let msgData;

    try {
      // error handling for good JSON
      msgData = JSON.parse(msg.data);
    } catch (ee) {
      return;
    }

    if (msgData.id === id) {
      callback(msgData);
    }
  };

  window.addEventListener('message', handlerWrap);
  return () => window.removeEventListener('message', handlerWrap);
};

const onSocialLoginIframeMessage =
  (
    onTokenMessage: IOnTokenMessage,
    onBackendSocialLogin: IOnBackendSocialLogin,
    onPageReady: () => void,
    reportBi: BusinessLogFn,
    onError: (error: any) => void,
    layout: IDisplayMode,
    formType: IFormType,
    isCommunityChecked?: boolean,
  ) =>
  (msg: any) => {
    switch (msg.type) {
      case MSG_TYPES.AUTH_CLICKED:
        reportButtonClicked(msg, reportBi, layout, formType);
        break;
      case MSG_TYPES.AUTH_TOKEN:
        onTokenReceived(msg, onTokenMessage, onError, isCommunityChecked);
        break;
      case MSG_TYPES.AUTH_DONE:
        onSocialLoginDone(
          msg,
          onBackendSocialLogin,
          onError,
          isCommunityChecked,
        );
        break;
      case MSG_TYPES.PAGE_READY:
        onPageReady();
        break;
      default:
        return;
    }
  };

const onTokenReceived = (
  { token, vendor }: { token: string; vendor: ISocialVendors },
  onTokenMessage: IOnTokenMessage,
  onError: (error: any) => void,
  isCommunityChecked?: boolean,
) => {
  if (!token || typeof onTokenMessage !== 'function') {
    return;
  }
  onTokenMessage(token, vendor, isCommunityChecked).catch(onError);
};

const onSocialLoginDone = (
  msg: any,
  onBackendSocialLogin: IOnBackendSocialLogin,
  onError: (error: any) => void,
  isCommunityChecked?: boolean,
) => {
  if (msg.error) {
    onError(msg.error);
    return;
  }
  onBackendSocialLogin(
    JSON.parse(msg.data),
    'google',
    isCommunityChecked,
  ).catch(onError);
};

export const useAuthIframeSubscription = (
  onTokenMessage: IOnTokenMessage,
  onBackendSocialLogin: IOnBackendSocialLogin,
  reportBi: BusinessLogFn,
  layout: IDisplayMode,
  formType: IFormType,
  isCommunityChecked?: boolean,
  onPageReady: () => void = () => 0,
  onError: (error: any) => void = () => 0,
  getHostReadyPayload: () => {
    visitorId?: string;
    svSession?: string;
  } = () => ({}),
) => {
  React.useEffect(() => {
    return setPostMessageHandler(
      onSocialLoginIframeMessage(
        onTokenMessage,
        onBackendSocialLogin,
        onPageReady,
        reportBi,
        onError,
        layout,
        formType,
        isCommunityChecked,
      ),
    );
  }, [
    isCommunityChecked,
    layout,
    formType,
    onBackendSocialLogin,
    onTokenMessage,
    reportBi,
    onPageReady,
    onError,
  ]);

  return (iframe: HTMLIFrameElement | null) => {
    if (iframe?.contentDocument?.URL === defaultIframeURL) {
      iframe?.addEventListener('load', () => {
        postMessageToIframe(iframe, getHostReadyPayload);
      });
    } else {
      postMessageToIframe(iframe, getHostReadyPayload);
    }
  };
};

const postMessageToIframe = (
  iframe: HTMLIFrameElement | null,
  getHostReadyPayload: () => {
    visitorId?: string;
    svSession?: string;
  },
) => {
  iframe?.contentWindow?.postMessage(
    {
      action: MSG_TYPES.HOST_READY,
      src: id,
      payload: getHostReadyPayload(),
    },
    'https://users.wix.com',
  );
};

export const reportButtonClicked = (
  msg: IButtonClickedMsg,
  reportBi: BusinessLogFn,
  layout: IDisplayMode,
  formType: IFormType,
) => {
  reportBi(
    {
      src: 5,
      evid: 605,
      socialNetwork: msg.vendor,
      layout,
      form_type: formType,
      ...msg,
    },
    { endpoint: 'site-members' },
  );
};
