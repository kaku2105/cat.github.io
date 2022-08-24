import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { StyleSDKOptions } from '../stylePropsSDKFactory';
import { createPixelValidator } from './validation';
import { getScopedVar } from './styleUtils';
import { cssVars } from './constants';
import { IStylePropsSDKOptions } from './types';

export type IBorderWidthSDK = {
  borderWidth: string;
  styleSDKOptions: StyleSDKOptions;
};

export const createBorderWidthPropsSDKFactory = (
  options: Partial<IStylePropsSDKOptions> = {},
) => {
  const { prefix, withoutDefaultValue } = options;

  const cssRule = getScopedVar({
    name: cssVars.borderWidth,
    prefix,
  });

  const validatePixel = createPixelValidator({
    propertyName: 'borderWidth',
    cssProperty: 'width',
  });

  const _borderWidthPropsSDKFactory: CorvidSDKPropsFactory<
    IBorderWidthSDK,
    { borderWidth?: string | null }
  > = ({ setStyles, sdkData, createSdkState }) => {
    const editorInitialWidth = sdkData?.initialSdkStyles?.borderWidth;
    const [state, setState] = createSdkState(
      {
        borderWidth: withoutDefaultValue ? undefined : editorInitialWidth,
      },
      'borderWidth',
    );
    return {
      set borderWidth(borderWidth) {
        setState({ borderWidth });
        setStyles({ [cssRule]: borderWidth });
      },
      get borderWidth() {
        return state.borderWidth;
      },
      reset() {
        setState({ borderWidth: editorInitialWidth });
        setStyles({ [cssRule]: undefined });
      },
    };
  };

  return withValidation(
    _borderWidthPropsSDKFactory,
    {
      type: ['object'],
      properties: {
        borderWidth: {
          type: ['string', 'nil'],
        },
      },
    },
    {
      borderWidth: [validatePixel],
    },
  );
};
