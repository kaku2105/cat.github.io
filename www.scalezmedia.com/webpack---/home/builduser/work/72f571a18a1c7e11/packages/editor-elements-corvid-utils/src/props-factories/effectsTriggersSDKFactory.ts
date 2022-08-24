import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { reportError } from '../reporters';
import { messageTemplates } from '../messages';

export interface IEffectsTriggersSDKProps {}

export interface IEffectsTriggersSDK {
  effects: {
    effects: Array<string>;
    activeEffects: Array<string>;
    applyEffects: (effects: Array<string>) => void;
    removeEffects: (effects: Array<string>) => void;
    toggleEffects: (effects: Array<string>) => void;
    removeAllEffects: () => void;
  };
}

export interface IEffectsTriggersActions {}

const validateEffects = (
  possibleEffects: Array<string>,
  effects: Array<string>,
  functionName: string,
) => {
  const invalidEffects = effects.filter(
    name => !possibleEffects.includes(name),
  );
  if (invalidEffects.length) {
    reportError(
      messageTemplates.error_effects_input({
        functionName,
        wrongEffects: invalidEffects,
        allowedEffects: possibleEffects,
      }),
    );
  }
};

export const effectsTriggersSDKFactory: CorvidSDKPropsFactory<
  IEffectsTriggersSDKProps,
  IEffectsTriggersSDK,
  IEffectsTriggersActions
> = api => {
  const getEffects = () => api.effectsTriggersApi?.getEffects() || [];

  return {
    effects: {
      get effects() {
        return getEffects();
      },

      get activeEffects() {
        return api.effectsTriggersApi?.getActiveEffects() || [];
      },

      applyEffects: effects => {
        validateEffects(getEffects(), effects, 'applyEffects');
        api.effectsTriggersApi?.applyEffects(...effects);
      },

      removeEffects: effects => {
        validateEffects(getEffects(), effects, 'removeEffects');
        api.effectsTriggersApi?.removeEffects(...effects);
      },

      toggleEffects: effects => {
        validateEffects(getEffects(), effects, 'toggleEffects');
        api.effectsTriggersApi?.toggleEffects(...effects);
      },

      removeAllEffects: () => api.effectsTriggersApi?.removeAllEffects(),
    },
  };
};
