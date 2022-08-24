import { MediaItemType } from './types';

export const types: MediaItemType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  VECTOR: 'vector',
};

export const errors = {
  empty_media_id: 'empty_media_id',
  empty_poster_id: 'empty_poster_id',
  bad_media_id: 'bad_media_id',
  unknown_media_type: 'unknown_media_type',
  missing_width_height: 'missing_width_height',
  non_string_media_id: 'non_string_media_id',
};
