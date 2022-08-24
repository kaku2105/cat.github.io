import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations';
import {
  childrenPropsSDKFactory,
  clickPropsSDKFactory,
  createStylePropsSDKFactory,
  createElementPropsSDKFactory,
  toJSONBase,
} from '../../../core/corvid/props-factories';
import { styleMixinPrefix } from '../../ScreenWidthContainer/constants';
import { corvidName as type } from '../constants';
import {
  IFooterContainerOwnSDKFactory,
  IFooterContainerProps,
  IFooterContainerSDK,
  IFooterContainerSDKFactory,
} from '../FooterContainer.types';

const footerContainerSDKFactory: IFooterContainerOwnSDKFactory = ({
  metaData,
}) => ({
  get type() {
    return type;
  },
  toJSON() {
    return {
      ...toJSONBase(metaData),
      type,
    };
  },
});

export const stylePropsSDKFactory = createStylePropsSDKFactory(
  {
    BackgroundColor: true,
    BorderColor: true,
  },
  {
    cssVarPrefix: styleMixinPrefix,
  },
);
const elementPropsSDKFactory = createElementPropsSDKFactory({
  useHiddenCollapsed: false,
});

export const sdk: IFooterContainerSDKFactory = composeSDKFactories<
  IFooterContainerProps,
  IFooterContainerSDK
>(
  elementPropsSDKFactory,
  footerContainerSDKFactory,
  childrenPropsSDKFactory,
  clickPropsSDKFactory,
  stylePropsSDKFactory,
);

export default createComponentSDKModel(sdk);
