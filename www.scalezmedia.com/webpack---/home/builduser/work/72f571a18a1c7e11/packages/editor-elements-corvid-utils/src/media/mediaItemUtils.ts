import {
  ImageItem,
  DocumentItem,
  VideoItem,
  AudioItem,
  VectorItem,
  ParsedItem,
  MediaType,
  CreatedItem,
  ErrorMessage,
} from './types';

import { types, errors } from './common';

const templates = {
  vector: (svgId: string, filename: string) =>
    `wix:vector://v1/${svgId}/${filename}`,
  image: (
    uri: string,
    filename: string,
    width: number,
    height: number,
    watermark?: string,
  ) =>
    `wix:image://v1/${uri}/${filename}#originWidth=${width}&originHeight=${height}${
      watermark ? `&watermark=${watermark}` : ''
    }`,
  document: (uri: string, filename: string) =>
    `wix:document://v1/${uri}/${filename}`,
  video: (
    videoId: string,
    posterId: string,
    filename: string,
    width: number = 0,
    height: number = 0,
  ) =>
    `wix:video://v1/${videoId}/${filename}#posterUri=${posterId}&posterWidth=${width}&posterHeight=${height}`,
  audio: (uri: string, filename: string, duration: number) =>
    `wix:audio://v1/${uri}/${filename}#duration=${duration}`,
};

/* eslint-disable no-useless-escape */
const matchers = {
  vector: /^wix:vector:\/\/v1\/([^\/]+)\/([^\/]*)$/,
  image:
    /^wix:image:\/\/v1\/([^\/]+)\/([^\/]+)#originWidth=([0-9]+)&originHeight=([0-9]+)(?:&watermark=([^\/]+))?$/,
  document: /^wix:document:\/\/v1\/([^\/]+)\/([^\/]+)$/,
  video:
    /^wix:video:\/\/v1\/([^\/]+)\/([^\/]+)#posterUri=([^\/]+)&posterWidth=([0-9]+)&posterHeight=([0-9]+)$/,
  audio: /^wix:audio:\/\/v1\/([^\/]+)\/([^\/]+)#duration=([0-9]+)$/,
  deprecated_video:
    /^wix:video:\/\/v1\/([^\/]+)\/([^\/]+)\/#posterUri=([^\/]+)&posterWidth=([0-9]+)&posterHeight=([0-9]+)$/,
  deprecated_image: /^image:\/\/v1\/([^\/]+)\/([0-9]+)_([0-9]+)\/([^\/]*)$/,
  deprecated_type: /^(image):/,
  type: /^wix:(\w+):/,
  splitExtension: /\.(?=[^.]+$)/,
  emptyTitle: /^_\./,
};
/* eslint-enable no-useless-escape*/

const matchersByType = {
  vector: [matchers.vector],
  image: [matchers.image, matchers.deprecated_image],
  document: [matchers.document],
  video: [matchers.video, matchers.deprecated_video],
  audio: [matchers.audio],
};

/**
 * Return a file name, use the extension from uri if the title has none
 */
function convertTitleToFilename(
  type: MediaType,
  title: string = '',
  uri: string,
): string {
  const [uriName, uriExtension] = uri.split(matchers.splitExtension);
  const [titleName, titleExtension] = title.split(matchers.splitExtension);

  let filename;

  switch (type) {
    case types.IMAGE:
      filename = `${titleName || '_'}.${titleExtension || uriExtension}`;
      break;
    case types.DOCUMENT:
      filename = `${titleName || uriName}.${titleExtension || uriExtension}`;
      break;
    case types.VIDEO:
      filename = `${titleName || '_'}${
        titleExtension ? `.${titleExtension}` : ''
      }`;
      break;
    case types.AUDIO:
      filename = `${titleName || uriName}.${titleExtension || uriExtension}`;
      break;
    case types.VECTOR:
      filename = `${titleName || uriName}.${titleExtension || uriExtension}`;
      break;
    default:
      filename = '';
      break;
  }
  return encodeURI(filename);
}

/**
 * return filename or an empty string
 */
function convertFilenameToTitle(filename: string): string {
  return matchers.emptyTitle.test(filename) ? '' : decodeURI(filename);
}

/**
 * Create a MediaItem for an image, width and height are mandatory numbers
 */
function createImageItem({
  mediaId,
  title,
  width,
  height,
  watermark,
}: Partial<ImageItem>): CreatedItem {
  if (!mediaId) {
    return { error: errors.empty_media_id };
  }

  if (typeof height !== 'number' || typeof width !== 'number') {
    return { error: errors.missing_width_height };
  }

  const filename = convertTitleToFilename(types.IMAGE, title, mediaId);
  return { item: templates.image(mediaId, filename, width, height, watermark) };
}

/**
 * Create a MediaItem for a document
 */
function createDocumentItem({
  mediaId,
  title,
}: Partial<DocumentItem>): CreatedItem {
  if (!mediaId) {
    return { error: errors.empty_media_id };
  }
  const filename = convertTitleToFilename(types.DOCUMENT, title, mediaId);
  return { item: templates.document(mediaId, filename) };
}

/**
 * Create a MediaItem for a vector image
 */
function createVectorItem({
  mediaId,
  title,
}: Partial<VectorItem>): CreatedItem {
  if (!mediaId) {
    return { error: errors.empty_media_id };
  }
  const filename = convertTitleToFilename(types.VECTOR, title, mediaId);
  return { item: templates.vector(mediaId, filename) };
}

/**
 * Create a MediaItem for a video, posterId is a mandatory image uri, width and height are mandatory numbers
 */
function createVideoItem({
  mediaId,
  title,
  width,
  height,
  posterId,
}: Partial<VideoItem>): CreatedItem {
  if (!mediaId) {
    return { error: errors.empty_media_id };
  }
  if (!posterId) {
    return { error: errors.empty_poster_id };
  }
  if (isNaN(height || NaN) || isNaN(width || NaN)) {
    return { error: errors.missing_width_height };
  }
  const strippedMediaId = mediaId.replace('video/', '');

  const filename = convertTitleToFilename(types.VIDEO, title, strippedMediaId);
  return {
    item: templates.video(strippedMediaId, posterId, filename, width, height),
  };
}

/**
 * Create a MediaItem for a audio
 */
function createAudioItem({
  mediaId,
  title,
  duration,
}: Omit<AudioItem, 'type'>): CreatedItem {
  if (!mediaId) {
    return { error: errors.empty_media_id };
  }
  const filename = convertTitleToFilename(types.AUDIO, title, mediaId);
  return { item: templates.audio(mediaId, filename, duration || 0) };
}

/**
 * Parse an image MediaItem
 */
function parseImageItem(item: string): ImageItem | ErrorMessage {
  const [, mediaId, filename, width, height, watermark] =
    item.match(matchers.image) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId) {
    const parsed = {
      type: types.IMAGE,
      mediaId,
      title,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      watermark,
    };
    return parsed;
  }
  return { error: errors.bad_media_id };
}

function parseDeprecatedImageItem(item: string): ImageItem | ErrorMessage {
  const [, mediaId, width, height, filename] =
    item.match(matchers.deprecated_image) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId) {
    return {
      type: types.IMAGE,
      mediaId,
      title,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    };
  }
  return { error: errors.bad_media_id };
}

/**
 * Parse a document MediaItem
 */
function parseDocumentItem(item: string): DocumentItem | ErrorMessage {
  const [, mediaId, filename] = item.match(matchers.document) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId) {
    return {
      type: types.DOCUMENT,
      mediaId,
      title,
    };
  }
  return { error: errors.bad_media_id };
}

/**
 * Parse a vector MediaItem
 */
function parseVectorItem(item: string): VectorItem | ErrorMessage {
  const [, mediaId, filename] = item.match(matchers.vector) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId) {
    return {
      type: types.VECTOR,
      mediaId,
      title,
    };
  }
  return { error: errors.bad_media_id };
}

/**
 * Parse a video MediaItem
 */
function parseVideoItem(item: string): VideoItem | ErrorMessage {
  const videoMatcher = matchers.deprecated_video.test(item)
    ? matchers.deprecated_video
    : matchers.video;
  const [, mediaId, filename, posterId, width, height] =
    item.match(videoMatcher) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId && posterId) {
    return {
      type: types.VIDEO,
      mediaId,
      posterId,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      title,
    };
  }
  return { error: errors.bad_media_id };
}

/**
 * Parse a audio MediaItem
 */
function parseAudioItem(item: string): AudioItem | ErrorMessage {
  const [, mediaId, filename, duration] = item.match(matchers.audio) || [];
  const title = convertFilenameToTitle(filename);

  if (mediaId) {
    return {
      type: types.AUDIO,
      mediaId,
      title,
      duration: parseInt(duration, 10),
    };
  }
  return { error: errors.bad_media_id };
}

/**
 * Create a MediaItem in the form of 'wix:<media_type>:<uri>/...' of one of the supported type
 */
function createMediaItemUri({
  mediaId,
  type,
  title,
  width,
  height,
  posterId,
  watermark,
  duration,
}: ParsedItem): CreatedItem {
  switch (type) {
    case types.IMAGE:
      return createImageItem({ mediaId, title, width, height, watermark });
    case types.DOCUMENT:
      return createDocumentItem({ mediaId, title });
    case types.VECTOR:
      return createVectorItem({ mediaId, title });
    case types.VIDEO:
      return createVideoItem({ mediaId, title, width, height, posterId });
    case types.AUDIO:
      return createAudioItem({ mediaId, title, duration });
    default:
      return { error: errors.unknown_media_type };
  }
}

/**
 * Parse a media item url of one of the supported types
 */
function parseMediaItemUri(mediaItemUri: string = ''): ParsedItem {
  if (typeof mediaItemUri !== 'string') {
    return { error: errors.non_string_media_id };
  }

  const [, type] = mediaItemUri.match(matchers.type) || [];
  switch (type) {
    case types.IMAGE:
      return parseImageItem(mediaItemUri);
    case types.DOCUMENT:
      return parseDocumentItem(mediaItemUri);
    case types.VECTOR:
      return parseVectorItem(mediaItemUri);
    case types.VIDEO:
      return parseVideoItem(mediaItemUri);
    case types.AUDIO:
      return parseAudioItem(mediaItemUri);
    default:
      const [, deprecatedType] =
        mediaItemUri.match(matchers.deprecated_type) || [];
      if (deprecatedType) {
        return parseDeprecatedImageItem(mediaItemUri);
      }
      return { error: errors.unknown_media_type };
  }
}

/**
 * Checks if a given url is a valid media item url
 */
function isValidMediaItemUri(
  mediaItemUri: string = '',
  type: MediaType,
): boolean {
  const typeMatchers = matchersByType[type];
  return (
    typeMatchers && typeMatchers.some(matcher => matcher.test(mediaItemUri))
  );
}

export {
  isValidMediaItemUri,
  createMediaItemUri,
  parseMediaItemUri,
  errors,
  types,
};
