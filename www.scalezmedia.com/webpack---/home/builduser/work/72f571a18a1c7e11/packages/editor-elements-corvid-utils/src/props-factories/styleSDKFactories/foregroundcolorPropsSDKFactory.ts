import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { getScopedVar } from './styleUtils';
import { createColorValidator } from './validation';
import { cssVars } from './constants';
import { IStylePropsSDKOptions } from './types';

export type IForegroundColorSDK = {
  foregroundColor: string;
};

export const createForegroundColorPropsSDKFactory = (
  options: Partial<IStylePropsSDKOptions> = {},
) => {
  const { prefix, withoutDefaultValue } = options;

  const cssRule = getScopedVar({
    name: cssVars.foregroundColor,
    prefix,
  });

  const validateColor = createColorValidator({
    propertyName: 'foregroundColor',
    cssProperty: 'rgbaColor',
    supportAlpha: true,
  });

  const _foregroundColorPropsSDKFactory: CorvidSDKPropsFactory<
    IForegroundColorSDK,
    { foregroundColor?: string | null }
  > = ({ setStyles, sdkData, createSdkState }) => {
    const [state, setState] = createSdkState(
      {
        foregroundColor: withoutDefaultValue
          ? undefined
          : sdkData?.initialSdkStyles?.foregroundColor,
      },
      'foregroundColor',
    );
    return {
      set foregroundColor(foregroundColor) {
        setState({ foregroundColor });
        setStyles({ [cssRule]: foregroundColor });
      },
      get foregroundColor() {
        return state.foregroundColor;
      },
      reset() {
        setState({
          foregroundColor: withoutDefaultValue
            ? undefined
            : sdkData?.initialSdkStyles?.foregroundColor,
        });
        setStyles({ [cssRule]: undefined });
      },
    };
  };
  return withValidation(
    _foregroundColorPropsSDKFactory,
    {
      type: ['object'],
      properties: {
        foregroundColor: {
          type: ['string', 'nil'],
        },
      },
    },
    {
      foregroundColor: [validateColor],
    },
  );
};
