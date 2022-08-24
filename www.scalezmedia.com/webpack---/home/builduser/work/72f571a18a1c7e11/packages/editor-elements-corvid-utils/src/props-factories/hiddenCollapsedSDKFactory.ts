import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';
import { IViewportState } from './viewportPropsSDKFactory';
import { createEffectValidation } from './validations';
import {
  effectDefaultOptions,
  IEffectOptions,
  EffectName,
  DeprecatedHideEffectName,
  DeprecatedShowEffectName,
  EFFECTS,
  sharedEffectDefaultOptions,
} from './animations';

export interface IHiddenCollapsedPropSDK {
  hide: (
    effectName?: EffectName | DeprecatedHideEffectName,
    effectOptions?: IEffectOptions,
  ) => Promise<void>;
  show: (
    effectName?: EffectName | DeprecatedShowEffectName,
    effectOptions?: IEffectOptions,
  ) => Promise<void>;
  collapse: () => Promise<void>;
  expand: () => Promise<void>;
  collapsed: boolean;
  hidden: boolean;
  isVisible: boolean;
  isAnimatable: boolean;
}

export const createHiddenCollapsedSDKFactory =
  ({
    viewportState,
    hasPortal = false,
  }: {
    viewportState?: IViewportState;
    hasPortal?: boolean;
  } = {}): CorvidSDKPropsFactory<{}, IHiddenCollapsedPropSDK> =>
  ({
    setStyles,
    portal,
    metaData,
    getSdkInstance,
    runAnimation,
    createSdkState,
    styleUtils,
  }) => {
    const validateEffect = createEffectValidation({
      compName: metaData.role,
    });

    const [state, setState] = createSdkState(
      {
        hidden: metaData.hiddenOnLoad,
        collapsed: metaData.collapsedOnLoad,
      },
      'hidden-collapsed',
    );

    return {
      hide: async (effectName, effectOptions) => {
        if (state.collapsed || state.hidden) {
          setState({ hidden: true });
          return;
        }
        /**
         * If effect options and value are valid - the visibility css rules
         * are controlled by animation library.
         * If not - we set styles through corvid.
         */
        if (
          validateEffect({
            effectName,
            effectOptions,
            propertyName: 'hide',
          })
        ) {
          const animationOptions = {
            animationDirection: EFFECTS.HIDE.suffix,
            effectName,
            effectOptions: {
              ...(effectDefaultOptions?.[effectName!] ||
                sharedEffectDefaultOptions),
              ...effectOptions,
            },
          };

          await Promise.all([
            runAnimation(animationOptions),
            hasPortal ? portal.runAnimation(animationOptions) : undefined,
          ]);
        } else {
          setStyles(styleUtils.getHiddenStyles());

          if (hasPortal) {
            portal.setStyles(styleUtils.getHiddenStyles());
          }
        }
        setState({ hidden: true });
        viewportState?.onViewportLeave?.forEach(cb => cb());
      },
      show: async (effectName, effectOptions) => {
        if (state.collapsed || !state.hidden) {
          setState({ hidden: false });
          return;
        }
        /**
         * If effect options and value are valid - the visibility css rules
         * are controlled by animation library.
         * If not - we set styles through corvid.
         */
        if (
          validateEffect({
            effectName,
            effectOptions,
            propertyName: 'show',
          })
        ) {
          const runAnimationOptions = {
            animationDirection: EFFECTS.SHOW.suffix,
            effectName,
            effectOptions: {
              ...(effectDefaultOptions?.[effectName!] ||
                sharedEffectDefaultOptions),
              ...effectOptions,
            },
          };

          await Promise.all([
            runAnimation(runAnimationOptions),
            hasPortal ? portal.runAnimation(runAnimationOptions) : undefined,
          ]);
        } else {
          setStyles(styleUtils.getShownStyles());

          if (hasPortal) {
            portal.setStyles(styleUtils.getShownStyles());
          }
        }
        setState({ hidden: false });
        viewportState?.onViewportEnter?.forEach(cb => cb());
      },
      collapse: async () => {
        if (!state.collapsed) {
          setStyles(styleUtils.getCollapsedStyles());

          if (hasPortal) {
            portal.setStyles(styleUtils.getCollapsedStyles());
          }
          setState({ collapsed: true });
          if (!state.hidden) {
            viewportState?.onViewportLeave?.forEach(cb => cb());
          }
        }
        return;
      },
      expand: async () => {
        if (state.collapsed) {
          const style = {
            ...styleUtils.getExpandedStyles(),
            visibility: state.hidden ? 'hidden' : null,
          };

          setStyles(style);

          if (hasPortal) {
            portal.setStyles(style);
          }

          setState({ collapsed: false });
          if (!state.hidden) {
            viewportState?.onViewportEnter?.forEach(cb => cb());
          }
        }
        return;
      },
      get collapsed() {
        return state.collapsed;
      },
      get hidden() {
        return Boolean(state.hidden);
      },
      get isVisible() {
        if (!metaData.isRendered()) {
          return false;
        }

        let parentSdk = getSdkInstance();
        while (parentSdk) {
          if (parentSdk.hidden || parentSdk.collapsed) {
            return false;
          }
          parentSdk = parentSdk.parent;
        }

        return true;
      },

      get isAnimatable() {
        return true;
      },
    };
  };
