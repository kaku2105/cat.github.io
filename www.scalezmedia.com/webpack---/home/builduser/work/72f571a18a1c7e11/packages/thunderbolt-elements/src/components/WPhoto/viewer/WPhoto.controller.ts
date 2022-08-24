import type { IComponentController } from '@wix/editor-elements-types/thunderbolt';
import {
  IWPhotoProps,
  IWPhotoControllerActions,
  WPhotoStateRefs,
} from '../WPhoto.types';

const compController: IComponentController<IWPhotoProps, WPhotoStateRefs> = {
  mapStateToProps: ({ experiments }) => ({
    lazyLoadImgExperimentOpen:
      !!experiments?.['specs.thunderbolt.lazyLoadImages'],
    fetchPriorityExperimentOpen:
      !!experiments?.['specs.thunderbolt.fetchPriority'],
  }),
  mapActionsToProps: ({ updateProps }): IWPhotoControllerActions => ({
    onSizeChange: (width, height) => {
      updateProps({ width, height });
    },
  }),
};

export default compController;
