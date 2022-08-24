import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { withValidation } from '../../validations';
import { createColorValidator } from './validation';
import {
  getScopedVar,
  convertColorToRGBAUnits,
  extractOpacity,
  applyOpacity,
  isHexaColor,
  isRGBAColor,
  roundToTwoDecimals,
} from './styleUtils';
import { cssVars } from './constants';
import { IStylePropsSDKOptions } from './types';

export type IBorderColorSDK = {
  borderColor: string;
};

export const createBorderColorPropsSDKFactory = (
  options: IStylePropsSDKOptions = { supportOpacity: true },
) => {
  const { prefix, supportOpacity, withoutDefaultValue } = options;

  const cssRule = getScopedVar({
    name: cssVars.borderColor,
    prefix,
  });

  const validateColor = createColorValidator({
    propertyName: 'borderColor',
    cssProperty: supportOpacity ? 'rgbaColor' : 'rgbColor',
    supportAlpha: supportOpacity,
  });

  const _borderColorPropsSDKFactory: CorvidSDKPropsFactory<
    IBorderColorSDK,
    { borderColor?: string | null }
  > = ({ setStyles, sdkData, createSdkState }) => {
    const editorInitialColor = sdkData?.initialSdkStyles?.borderColor;
    const editorOpacity = extractOpacity(editorInitialColor);

    const [state, setState] = createSdkState(
      {
        borderColor: withoutDefaultValue ? undefined : editorInitialColor,
      },
      'borderColor',
    );

    return {
      set borderColor(value) {
        let borderColor = value;

        /**
         * !Alert! This feature is intended.
         * if mixin does not support opacity - cast it to RGB
         */
        if (!supportOpacity && (isHexaColor(value) || isRGBAColor(value))) {
          const [r, g, b] = convertColorToRGBAUnits(value)!;
          borderColor = `rgb(${r}, ${g}, ${b})`;
        }

        /**
         * !Alert! This feature is intended.
         *  Editor color alpha gets modified by the amount of user color alpha
         */
        if (typeof editorOpacity === 'number' && editorOpacity !== 1) {
          const userOpacity = extractOpacity(value);
          const opacity = userOpacity
            ? roundToTwoDecimals(editorOpacity * userOpacity)
            : editorOpacity;
          borderColor = applyOpacity(borderColor, opacity);
        }

        setState({ borderColor });
        setStyles({ [cssRule]: borderColor });
      },
      get borderColor() {
        return state.borderColor;
      },
      reset() {
        setState({
          borderColor: withoutDefaultValue ? undefined : editorInitialColor,
        });
        setStyles({ [cssRule]: undefined });
      },
    };
  };

  return withValidation(
    _borderColorPropsSDKFactory,
    {
      type: ['object'],
      properties: {
        borderColor: {
          type: ['string', 'nil'],
        },
      },
    },
    {
      borderColor: [validateColor],
    },
  );
};
