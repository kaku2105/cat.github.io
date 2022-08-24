import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations';
import { IAnchorSDKFactory } from '../Anchor.types';
import {
  basePropsSDKFactory,
  createViewportPropsSDKFactory,
  toJSONBase,
} from '../../../core/corvid/props-factories';

const anchorSDKFactory: IAnchorSDKFactory = ({ props, metaData }) => ({
  get name() {
    return props.name;
  },
  toJSON() {
    return {
      ...toJSONBase(metaData),
      name: props.name,
    };
  },
});

export const sdk: IAnchorSDKFactory = composeSDKFactories(
  basePropsSDKFactory,
  createViewportPropsSDKFactory(),
  anchorSDKFactory,
);

export default createComponentSDKModel(sdk);
