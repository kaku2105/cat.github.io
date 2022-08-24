import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { createPixelValidator } from './validation';
import { getScopedVar } from './styleUtils';
import { cssVars } from './constants';
import { IStylePropsSDKOptions } from './types';

export type IBorderRadiusSDK = {
  borderRadius: string;
};

export const createBorderRadiusPropsSDKFactory = (
  options: Partial<IStylePropsSDKOptions> = {},
) => {
  const { prefix, withoutDefaultValue } = options;

  const cssRule = getScopedVar({
    name: cssVars.borderRadius,
    prefix,
  });

  const validatePixel = createPixelValidator({
    propertyName: 'borderRadius',
    cssProperty: 'radius',
  });

  const _borderRadiusPropsSDKFactory: CorvidSDKPropsFactory<
    IBorderRadiusSDK,
    { borderRadius?: string | null }
  > = ({ setStyles, sdkData, createSdkState }) => {
    const editorInitialRadius = sdkData?.initialSdkStyles?.borderRadius;
    const [state, setState] = createSdkState(
      {
        borderRadius: withoutDefaultValue ? undefined : editorInitialRadius,
      },
      'borderRadius',
    );
    return {
      set borderRadius(borderRadius) {
        setState({ borderRadius });
        setStyles({ [cssRule]: borderRadius });
      },
      get borderRadius() {
        return state.borderRadius;
      },
      reset() {
        setState({ borderRadius: editorInitialRadius });
        setStyles({ [cssRule]: undefined });
      },
    };
  };
  return withValidation(
    _borderRadiusPropsSDKFactory,
    {
      type: ['object'],
      properties: {
        borderRadius: {
          type: ['string', 'nil'],
        },
      },
    },
    {
      borderRadius: [validatePixel],
    },
  );
};
