import type {
  LinkTarget,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';
import {
  withValidation,
  reportError,
  assert,
  messageTemplates,
} from '@wix/editor-elements-corvid-utils';
import { LinkUtils, ISetProps } from '@wix/thunderbolt-symbols';
import { LinkProps } from '../../../components/Link/Link.types';

export interface ILinkPropsSDKProps {
  link?: LinkProps;
}

export interface ILinkPropsSDK {
  link?: string;
  target: string;
}

export const setLink = (
  url: string,
  target: LinkTarget | undefined,
  linkUtils: LinkUtils,
  setProps: ISetProps,
) => {
  if (assert.isNil(url) || url === '') {
    setProps({
      link: undefined,
    });
    return;
  }

  try {
    setProps({
      link: linkUtils.getLinkProps(url, target),
    });
  } catch (e) {
    reportError(
      `The link property that is passed to the link method cannot be set to the value "${url}" as this is not a supported link type.`,
    );
  }
};

export const getLink = (props: ILinkPropsSDKProps, linkUtils: LinkUtils) =>
  props.link ? linkUtils.getLink(props.link) : '';

const _linkPropsSDKFactory: CorvidSDKPropsFactory<
  ILinkPropsSDKProps,
  ILinkPropsSDK
> = ({ setProps, props, platformUtils: { linkUtils } }) => {
  return {
    set link(url: string) {
      setLink(url, props.link?.target, linkUtils, setProps);
    },
    get link() {
      return getLink(props, linkUtils);
    },
    set target(target: LinkTarget) {
      setProps({
        link: { ...props.link, target },
      });
    },
    get target() {
      return props.link?.target ?? '_blank';
    },
  };
};

export const linkPropsSDKFactory = withValidation(
  _linkPropsSDKFactory,
  {
    type: ['object'],
    properties: {
      link: { type: ['string', 'nil'], warnIfNil: true },
      target: { type: ['string', 'nil'], warnIfNil: true },
    },
  },
  {
    target: [
      (target: string) => {
        if (target === '_blank' || target === '_self') {
          return true;
        }

        reportError(messageTemplates.error_target_w_photo({ target }));

        if (assert.isNil(target)) {
          return true;
        }
        return false;
      },
    ],
  },
);
