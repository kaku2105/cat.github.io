import * as mediaItemUtils from './mediaItemUtils';
import { types, errors } from './common';

import { MediaType, CreatedItem, ParsedItem, ErrorMessage } from './types';

const matchers = {
  externalUrl: /(^https?)|(^data)|(^blob)|(^\/\/)/,
  inlineSvg: /<svg[\s\S]*>[\s\S]*<\/svg>/im,
};

const extraMatchersByType = {
  [mediaItemUtils.types.VECTOR]: [matchers.externalUrl, matchers.inlineSvg],
  [mediaItemUtils.types.IMAGE]: [matchers.externalUrl],
  [mediaItemUtils.types.DOCUMENT]: [],
  [mediaItemUtils.types.VIDEO]: [],
  [mediaItemUtils.types.AUDIO]: [matchers.externalUrl],
};

/**
 * Create a MediaItem in the form of 'wix:<media_type>:<uri>/...' or extra supported source(e.g., external url) of one of the supported type
 */
function createMediaSrc({
  mediaId,
  type,
  title,
  width,
  height,
  posterId,
  watermark,
  duration,
}: any): CreatedItem {
  if (
    // @ts-ignore
    extraMatchersByType[type]?.some(matcher => matcher.test(mediaId))
  ) {
    return { item: mediaId };
  }

  return mediaItemUtils.createMediaItemUri({
    mediaId,
    type,
    title,
    width,
    height,
    posterId,
    watermark,
    duration,
  });
}

/**
 * Parse a media item url of one of the supported types, including extra source type(e.g. external url)
 */
function parseMediaSrc(mediaItemSrc: string, type: MediaType): ParsedItem {
  if (!Object.values(types).includes(type)) {
    return { error: errors.unknown_media_type };
  }

  if (extraMatchersByType[type].some(matcher => matcher.test(mediaItemSrc))) {
    return { type, mediaId: mediaItemSrc };
  }

  const mediaItemUri = mediaItemUtils.parseMediaItemUri(mediaItemSrc);
  if ((mediaItemUri as ErrorMessage).error === errors.non_string_media_id) {
    return mediaItemUri;
  }

  if (
    mediaItemUri.error === errors.unknown_media_type ||
    type !== mediaItemUri.type
  ) {
    return { error: errors.bad_media_id };
  }

  return mediaItemUri;
}

/**
 * Checks if a given url is a valid media source url
 */
function isValidMediaSrc(mediaSrc: string, type: MediaType) {
  const isValidMediaItemUri = mediaItemUtils.isValidMediaItemUri(
    mediaSrc,
    type,
  );
  return (
    isValidMediaItemUri ||
    (extraMatchersByType[type] &&
      extraMatchersByType[type].some(matcher => matcher.test(mediaSrc)))
  );
}

export { isValidMediaSrc, createMediaSrc, parseMediaSrc, errors, types };
