import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations';
import {
  IMediaContainerSDK,
  IMediaContainerSDKFactory,
  MediaContainerCompProps,
  IMediaContainerOwnSDKFactory,
} from '../MediaContainer.types';
import { backgroundPropsSDKFactory } from '../../../../core/corvid/props-factories/backgroundPropsSDKFactory';

import {
  childrenPropsSDKFactory,
  clickPropsSDKFactoryWithUpdatePlatformHandler,
  createElementPropsSDKFactory,
  toJSONBase,
} from '../../../../core/corvid/props-factories';

const type = '$w.Container';

const mediaContainerSDKFactory: IMediaContainerOwnSDKFactory = ({
  metaData,
}) => {
  return {
    get type() {
      return type;
    },
    toJSON() {
      return {
        ...toJSONBase(metaData),
        type,
      };
    },
  };
};

const elementPropsSDKFactory = createElementPropsSDKFactory();

export const sdk: IMediaContainerSDKFactory = composeSDKFactories<
  MediaContainerCompProps,
  IMediaContainerSDK
>(
  elementPropsSDKFactory,
  mediaContainerSDKFactory,
  childrenPropsSDKFactory,
  clickPropsSDKFactoryWithUpdatePlatformHandler,
  backgroundPropsSDKFactory,
);

export default createComponentSDKModel(sdk);
