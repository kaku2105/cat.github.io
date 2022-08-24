import type { IPlatformHandlers } from '@wix/editor-elements-types/corvid';
import { assert } from './assert';

export const SVG_FALLBACK_CONTENT = '<svg data-failed />';
export const SVG_TYPE_INLINE = 'inline';
export const SVG_TYPE_WIX_MEDIA = 'wixMedia';
export const SVG_TYPE_URL = 'url';

const WIX_MEDIA_PREFIX_REGEX = /^wix:vector:\/\/v1\//;

const WIX_MEDIA_REGEX = /^wix:vector:\/\/v1\/[0-9|a-z|_]+.svg/;

const resolveSvgShape = (value: string, baseSvgMediaUrl: string) => {
  /**
   * Shapes have next format `wix:vector://v1/svgshape.v2.Svg_283bac5c7f3f4b348e0f68e27825aaa0/`
   * and they handled separately:
   * https://github.com/wix-private/santa-core/blob/master/santa-core-utils/src/coreUtils/core/svgUtils.js#L61
   */
  const extractShapeUri = (svgId: string) => {
    const [, shapeVersion, hash, svgName] = svgId
      .replace(/^.*\//, '')
      .split('.');

    const version = shapeVersion === 'v1' ? 1 : 2;
    const svgHash = hash.replace(/svg_/i, '');

    return `${svgHash + (version === 1 ? `_svgshape.v1.${svgName}` : '')}.svg`;
  };

  const [svgShape] = value.replace(WIX_MEDIA_PREFIX_REGEX, '').split('/');
  const svgUri = extractShapeUri(svgShape);

  return {
    type: SVG_TYPE_WIX_MEDIA,
    data: `${baseSvgMediaUrl}/${svgUri}`,
  };
};

const extractWixMediaUrl = (value: string) => {
  const [wixMediaUrl] = WIX_MEDIA_REGEX.exec(value) || [];

  return wixMediaUrl;
};

export const createSvgWixMediaUrl = (id: string, title: string) => {
  const titleSuffix = title ? encodeURIComponent(title) : '';
  return `wix:vector://v1/${id}/${titleSuffix}`;
};

export const resolveSvg = (src: string, baseSvgMediaUrl: string) => {
  if (assert.isWixSVGShape(src)) {
    return resolveSvgShape(src, baseSvgMediaUrl);
  }

  const wixMediaUrl = extractWixMediaUrl(src);

  if (wixMediaUrl) {
    const svgId = wixMediaUrl.replace(WIX_MEDIA_PREFIX_REGEX, '');

    return {
      type: SVG_TYPE_WIX_MEDIA,
      data: `${baseSvgMediaUrl}${svgId}`,
    };
  }

  if (assert.isInlineSvg(src)) {
    return { type: SVG_TYPE_INLINE, data: src };
  }

  return { type: SVG_TYPE_URL, data: src };
};

export const fetchSvg = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    }
  } catch {
    /* do nothing */
  }
  return SVG_FALLBACK_CONTENT;
};

export const resolveAndFetchSvg = async (
  src: string,
  baseSvgMediaUrl: string,
  sanitizeSVG: IPlatformHandlers['sanitizeSVG'],
) => {
  const { type, data } = resolveSvg(src, baseSvgMediaUrl);

  if (type === SVG_TYPE_INLINE) {
    return data;
  }

  let content = await fetchSvg(data);

  if (!isFallbackSvg(content) && type !== SVG_TYPE_WIX_MEDIA) {
    try {
      const { svg } = await sanitizeSVG(content);
      content = svg || SVG_FALLBACK_CONTENT;
    } catch (e) {
      content = SVG_FALLBACK_CONTENT;
    }
  }

  return content;
};

export const isFallbackSvg = (svg: string) => svg === SVG_FALLBACK_CONTENT;
