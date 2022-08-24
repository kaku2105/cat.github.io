import { reportWarning } from '../../../reporters';
import { messageTemplates } from '../../../messages';
import { effectInfoLink, IEffectOptions, EFFECTS } from '../../animations';
import { effectsValidationSchema } from './effectValidationSchema';
import { createEffectOptionsValidation } from './effectOptionsValidation';

const isEmpty = (value: Record<string, any>) => {
  return Object.keys(value).length === 0;
};

export const createEffectValidation = ({ compName }: { compName: string }) => {
  return ({
    effectName,
    effectOptions,
    propertyName,
  }: {
    effectName?: string;
    effectOptions?: IEffectOptions;
    propertyName: 'hide' | 'show';
  }) => {
    const validateEffectOption = createEffectOptionsValidation({
      propertyName,
      compName,
    });

    // effectName - undefined, effectOptions - undefined
    if (!effectName && !effectOptions) {
      return false;
    }

    // effectName - undefined, effectOptions - not empty
    if (!effectName && effectOptions && !isEmpty(effectOptions)) {
      reportWarning(
        messageTemplates.warning_effect_options_not_set({
          propertyName,
          compName,
          infoLink: effectInfoLink(propertyName),
        }),
      );
      return false;
    }

    // deprecated effectName fits propertyName && effecOptions not empty ?
    const PROPERTY = propertyName === 'hide' ? 'HIDE' : 'SHOW';
    const deprecatedValues = EFFECTS[PROPERTY]?.deprecatedValues;

    if (
      effectName &&
      effectOptions &&
      deprecatedValues &&
      deprecatedValues.find((effect: string) => effect === effectName) &&
      !isEmpty(effectOptions)
    ) {
      reportWarning(
        messageTemplates.warning_deprecated_effect_with_options({
          compName,
          effectName,
          propertyName,
          infoLink: effectInfoLink(propertyName),
        }),
      );
      return false;
    }

    // deprecated effectName fits
    if (deprecatedValues.find((effect: string) => effect === effectName)) {
      return true;
    }

    // effectName - isValid?
    if (effectName && !(effectName in effectsValidationSchema)) {
      reportWarning(
        messageTemplates.warning_invalid_effect_name({
          propertyName,
          compName,
          effectName,
          infoLink: effectInfoLink(propertyName),
        }),
      );
      return false;
    }

    // effectOptions - isValid?
    if (!validateEffectOption(effectName, effectOptions)) {
      return false;
    }

    return true;
  };
};
