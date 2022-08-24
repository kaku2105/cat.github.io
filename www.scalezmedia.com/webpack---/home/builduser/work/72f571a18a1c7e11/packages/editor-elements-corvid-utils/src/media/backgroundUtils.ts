import _ from 'lodash';
import { FillLayersProps } from '@wix/thunderbolt-components';
import { ParsedItem } from './types';
import { isValidMediaSrc, parseMediaSrc } from './mediaSrcHandler';

type posterImageType = {
  type: string;
  uri: string;
  width: number;
  height: number;
  title: string;
};

export type mediaDataType = {
  posterImageRef: Partial<posterImageType>;
  name: string;
  fileName: string;
  type: string;
  videoId: string;
  mediaId: string;
  title: string | undefined;
  width: number;
  height: number;
  watermark: string;
};

export const BG_VIDEO_DEFAULTS = {
  loop: true,
  preload: 'auto',
  muted: true,
  isVideoEnabled: true,
};

const getVideoPosterObject = ({
  mediaId,
  posterId,
  width,
  height,
  title,
}: ParsedItem) => {
  return {
    type: 'WixVideo',
    videoId: mediaId,
    posterImageRef: {
      type: 'Image',
      uri: posterId,
      width,
      height,
      title,
    },
  };
};

export const getScrollEffect = (fillLayers: FillLayersProps = {}) => {
  const { bgEffectName = '' } = fillLayers.backgroundMedia || {};
  return {
    hasBgScrollEffect: bgEffectName ? 'true' : '',
    bgEffectName,
  };
};

export const hasVideo = (props: { fillLayers?: FillLayersProps }) => {
  const { fillLayers = {} } = props;
  return fillLayers?.video?.videoInfo?.videoId;
};

export const getIdFromUrl = (fileUrl: string) => {
  const result = fileUrl.match(/(?:\/|^)([0-9a-fA-F_]+)(?:\/|$)/);
  if (!result) {
    return '';
  }

  return result.length > 1 ? result[1] : '';
};

const getVideoId = (videoId: string) => {
  return videoId.replace('video/', '');
};

const getObjectValueByKey = (object: any, key: string) => {
  return object[key] || object[_.camelCase(key)];
};

const fixMediaTitleLength = (value: string, lengthLimit: number) => {
  const CHARS_TO_ADD = '...';
  const NUM_OF_CHARS_TO_KEEP = 3;

  if (value.length <= lengthLimit) {
    return value;
  }
  const arr = value.split('');
  const numOfCharsToRemove = value.length - lengthLimit + CHARS_TO_ADD.length;
  const isFileTypeSuffix =
    value.lastIndexOf('.') >
    value.length - numOfCharsToRemove - NUM_OF_CHARS_TO_KEEP;
  const fileTypeSuffixIndex = isFileTypeSuffix
    ? value.lastIndexOf('.')
    : value.length - 1;
  const removeIndex =
    fileTypeSuffixIndex - numOfCharsToRemove - NUM_OF_CHARS_TO_KEEP;
  arr.splice(removeIndex, numOfCharsToRemove, CHARS_TO_ADD);
  return arr.join('');
};

const parseVideoQualities = (fileOutput: any) => {
  const mp4Videos = _.filter(fileOutput.video, { format: 'mp4' });
  const storyboard = _.find(fileOutput.storyboard, { format: 'mp4' });
  const qualities = _.map(mp4Videos, function (quality) {
    return _.pick(quality, ['width', 'height', 'quality', 'url']);
  });

  if (storyboard) {
    qualities.push({
      quality: 'storyboard',
      width: storyboard.width,
      height: storyboard.height,
      url: storyboard.url,
    });
  }

  return qualities;
};

const parseAdaptiveUrls = (fileOutput: any) => {
  const adaptiveVideo = getObjectValueByKey(fileOutput, 'adaptive_video');
  return _.map(adaptiveVideo, item => {
    return {
      format: item.format,
      url: item.url,
    };
  });
};

const parseMediaFeatures = (fileInfo: any) => {
  const mediaFeatures = [];
  if (fileInfo.tags && _.includes(fileInfo.tags, '_mp4_alpha')) {
    mediaFeatures.push('alpha');
  }
  return _.isEmpty(mediaFeatures) ? null : mediaFeatures;
};

const url2uri = (url: string) => {
  // eslint-disable-next-line
  return url.replace(/^(.*[\/])/, '');
};

const parseVideoPosters = (fileOutput: any) => {
  return _.map(fileOutput.image, image => {
    return url2uri(image.url);
  });
};

const parseVideoFileInfo = (fileInfo: any, info: any) => {
  const TITLE_LENGTH_LIMIT = 100;

  const fileInput = getObjectValueByKey(fileInfo, 'file_input');
  const fileOutput = getObjectValueByKey(fileInfo, 'file_output');
  const videoId = getIdFromUrl(fileInfo.fileUrl || fileInfo.file_name);
  const title = fixMediaTitleLength(fileInfo.title, TITLE_LENGTH_LIMIT);
  const qualities = parseVideoQualities(fileOutput);
  const adaptiveVideo = parseAdaptiveUrls(fileOutput);
  const mediaFeatures = parseMediaFeatures(fileInfo);
  // parse poster - get the first item in data
  const imageData: any = _.head(fileOutput.image);
  const posterImageRef = {
    type: 'Image',
    width: imageData.width,
    height: imageData.height,
    uri: url2uri(imageData.url),
    description: info.path ? info.path : undefined,
  };

  const parsed = {
    type: 'WixVideo',
    title,
    videoId,
    duration: +(fileInput.duration / 1000).toFixed(2),
    posterImageRef,
    generatedPosters: parseVideoPosters(fileOutput),
    qualities,
    adaptiveVideo,
    artist: { name: fileInfo.vendor || '', id: fileInfo.reference || '' },
    hasAudio:
      getObjectValueByKey(_.head(fileOutput.video), 'audio_bitrate') !== -1,
    fps: _.get(_.head(fileOutput.video), 'fps', '').toString(),
    mediaFeatures: mediaFeatures || [],
  };

  return parsed;
};

const getVideoBackgroundObject = (fileInfo: any, info: any) => {
  const MEDIA_OBJECT_DEFAULTS = {
    animatePoster: 'none',
    autoPlay: true,
    playbackRate: 1,
    fittingType: 'fill',
    hasBgScrollEffect: '',
    bgEffectName: '',
    isVideoDataExists: '1',
    alignType: 'center',
    videoFormat: 'mp4',
    playerType: 'html5',
    isEditorMode: false,
    isViewerMode: true,
    videoHeight: fileInfo.file_input.height,
    videoWidth: fileInfo.file_input.width,
  };

  const mediaObject = parseVideoFileInfo(fileInfo, info);
  return {
    mediaObject: {
      ...MEDIA_OBJECT_DEFAULTS,
      ...mediaObject,
    },
    ...BG_VIDEO_DEFAULTS,
  };
};

const getFullVideoData = (
  videoId: string,
  callback: (videoMedia: any) => void,
) => {
  videoId = getVideoId(videoId);
  const VIDEO_INFO_END_POINT = `https://files.wix.com/site/media/files/${videoId}/info`;
  fetch(VIDEO_INFO_END_POINT)
    .then(response => response.json())
    .then(response => {
      const fullVideoMediaRef = getVideoBackgroundObject(response, {});
      callback(fullVideoMediaRef);
    });
};

export const getMediaDataFromSrc = (
  value: string,
): Partial<mediaDataType> | null => {
  if (isValidMediaSrc(value, 'video')) {
    const parseMediaItem = parseMediaSrc(value, 'video');
    if (parseMediaItem.error) {
      return null;
    }

    return {
      ...getVideoPosterObject(parseMediaItem),
      ...{
        name: parseMediaItem.title,
        fileName: parseMediaItem.title,
        type: 'WixVideo',
      },
    };
  } else {
    const parseMediaItem = parseMediaSrc(value, 'image');
    if (parseMediaItem.error) {
      return null;
    }
    return {
      ...parseMediaItem,
      ...{
        name: parseMediaItem.title,
        type: 'Image',
      },
    };
  }
};

export const getFullMediaData = (
  mediaData: any,
  callback: (media?: any) => void,
) => {
  if (mediaData.videoId) {
    getFullVideoData(mediaData.videoId, callback);
    return;
  }
  callback();
};
