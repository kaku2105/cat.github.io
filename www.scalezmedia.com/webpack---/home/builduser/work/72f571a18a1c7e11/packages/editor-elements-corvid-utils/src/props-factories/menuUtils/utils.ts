import type {
  LinkTarget,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';
import { assert } from '../../assert';

type LinkUtils = Parameters<
  CorvidSDKPropsFactory<any, any>
>[0]['platformUtils']['linkUtils'];

export type PageList = Record<string, { title: string }>;

const externalRegex = /^(http|https):\/\/(.*)/;
const pageUrlRegex = /^\/([^ ?#]*)[?]?(.*)/;

export const isPageUrl = (url: string) => pageUrlRegex.test(url);
export const isExternalPage = (url: string) => externalRegex.test(url);

export const getLink = ({
  link,
  target,
  linkUtils,
}: {
  link?: string;
  target?: string;
  linkUtils: LinkUtils;
}) => {
  if (!assert.isNil(link)) {
    const passedTarget = (target ||
      (isExternalPage(link) ? '_blank' : '_self')) as LinkTarget;
    return linkUtils.getLinkProps(link, passedTarget);
  }

  return {};
};

const getPageTitleFromUrl = (
  url: string,
  pageList: PageList,
): string | undefined => {
  const key = url.slice(1);

  if (pageList.hasOwnProperty(key)) {
    return pageList[key]?.title;
  }

  return undefined;
};

export const getLabel = ({
  link,
  label,
  pageList,
}: {
  link?: string;
  label?: string;
  pageList: PageList;
}) => {
  if (!assert.isNil(label)) {
    return label;
  }

  if (!assert.isNil(link) && isPageUrl(link)) {
    return getPageTitleFromUrl(link, pageList);
  }

  return undefined;
};
