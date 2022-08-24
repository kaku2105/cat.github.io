import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations';
import {
  IPageBackgroundSDK,
  IPageBackgroundSDKFactory,
  PageBackgroundProps,
} from '../PageBackground.types';
import { backgroundPropsSDKFactory } from '../../../core/corvid/props-factories/backgroundPropsSDKFactory';

export const sdk: IPageBackgroundSDKFactory = composeSDKFactories<
  PageBackgroundProps,
  IPageBackgroundSDK
>(backgroundPropsSDKFactory);

export default createComponentSDKModel(sdk);
