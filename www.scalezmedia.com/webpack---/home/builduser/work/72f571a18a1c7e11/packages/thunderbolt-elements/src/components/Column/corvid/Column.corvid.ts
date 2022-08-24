import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import type { CorvidTypes } from '@wix/editor-elements-types/corvid';
import { createComponentSDKModel } from '@wix/editor-elements-integrations';
import {
  MediaContainerCompProps,
  IMediaContainerSDK,
} from '../../MediaContainers/MediaContainer/MediaContainer.types';
import { sdk as mediaContainerPropsSDKFactory } from '../../MediaContainers/MediaContainer/corvid/MediaContainer.corvid';
import { toJSONBase } from '../../../core/corvid/props-factories';

const columnPropsSDKFactory: CorvidTypes.CorvidSDKFactory = ({ metaData }) => ({
  get type() {
    return '$w.Column';
  },
  toJSON() {
    return {
      ...toJSONBase(metaData),
      type: '$w.Column',
    };
  },
});

export const sdk = composeSDKFactories<
  MediaContainerCompProps,
  IMediaContainerSDK
>(mediaContainerPropsSDKFactory, columnPropsSDKFactory);

export default createComponentSDKModel(sdk);
