import type {
  CorvidSDKPropsFactory,
  CorvidSDKFactory,
} from '@wix/editor-elements-types/corvid';
import { withValidation } from '../validations';
import { reportError } from '../reporters';
import { messages } from '../messages';
import {
  IBackgroundColorSDK,
  IBorderColorSDK,
  IForegroundColorSDK,
  IBorderRadiusSDK,
  ITextColorSDK,
  IBorderWidthSDK,
  IStylePropsSDKOptions,
  createBackgroundColorPropsSDKFactory,
  createBorderColorPropsSDKFactory,
  createBorderRadiusPropsSDKFactory,
  createBorderWidthPropsSDKFactory,
  createForegroundColorPropsSDKFactory,
  createTextColorPropsSDKFactory,
} from './styleSDKFactories';
import { composeFactory } from './composeFactoryWithReset';

type StyleProps = IBackgroundColorSDK &
  IBorderColorSDK &
  IForegroundColorSDK &
  IBorderRadiusSDK &
  ITextColorSDK &
  IBorderWidthSDK;

export interface IStylePropSDK {
  style: Partial<StyleProps> & {
    removeProperty: (styleProp: keyof StyleProps) => void;
  };
}

export type StyleSDKOptions = {
  cssVarPrefix?: string;
};

type SDKWithReset = {
  reset: (prop: string) => void;
};

const STYLE_SDK_RESET_METHOD_NAME = 'reset';
function composeSDKFactoriesWithReset<
  TProps extends object,
  TSDK extends object,
  TData extends object = object,
>(
  ...sources: Array<CorvidSDKFactory<any, any, any>>
): CorvidSDKFactory<TProps, TSDK & SDKWithReset, TData> {
  const compose = composeFactory(STYLE_SDK_RESET_METHOD_NAME);
  return api => {
    const objs = sources.map(source => source(api));
    const composedFactories = compose(...objs) as any as TSDK & SDKWithReset;

    // we "hide" the reset method as it's not a public API
    Object.defineProperty(composedFactories, STYLE_SDK_RESET_METHOD_NAME, {
      enumerable: false,
    });

    return composedFactories;
  };
}

const _stylePropsSDKFactory =
  (
    supportedSDKFactories: CorvidSDKFactory<object, object, any, any>,
  ): CorvidSDKPropsFactory<any, IStylePropSDK> =>
  api => {
    const styleSDKs = supportedSDKFactories(api) as IStylePropSDK['style'] &
      SDKWithReset;
    styleSDKs.removeProperty = (propertyName: keyof StyleProps) => {
      if (!(propertyName in styleSDKs)) {
        const styleSdkPropNames = Object.keys(styleSDKs).filter(
          k => k !== 'removeProperty',
        );
        reportError(
          messages.invalidEnumValueMessage({
            functionName: 'removeProperty',
            propertyName: 'propertyName',
            value: propertyName,
            enum: styleSdkPropNames,
            index: undefined,
          }),
        );
        return;
      }

      styleSDKs[STYLE_SDK_RESET_METHOD_NAME]?.(propertyName);
    };

    return {
      get style() {
        return styleSDKs;
      },
    };
  };

type IStyleCSSProperty =
  | 'BackgroundColor'
  | 'BorderColor'
  | 'BorderWidth'
  | 'ForegroundColor'
  | 'BorderRadius'
  | 'TextColor';

const styleFactories = {
  BackgroundColor: createBackgroundColorPropsSDKFactory,
  BorderColor: createBorderColorPropsSDKFactory,
  BorderWidth: createBorderWidthPropsSDKFactory,
  ForegroundColor: createForegroundColorPropsSDKFactory,
  BorderRadius: createBorderRadiusPropsSDKFactory,
  TextColor: createTextColorPropsSDKFactory,
} as const;

const styleFactoriesDefaultOptions: Record<
  IStyleCSSProperty,
  IStylePropsSDKOptions
> = {
  BackgroundColor: {
    supportOpacity: true,
  },
  BorderColor: {
    supportOpacity: true,
  },
  BorderWidth: {},
  ForegroundColor: {
    supportOpacity: true,
  },
  BorderRadius: {},
  TextColor: {},
};

export const createStylePropsSDKFactory = (
  list: Partial<Record<IStyleCSSProperty, boolean | IStylePropsSDKOptions>>,
  styleSDKOptions?: StyleSDKOptions,
) => {
  const supported = (Object.keys(list) as Array<IStyleCSSProperty>).filter(
    value => list[value],
  );

  const supportedSDKFactories = supported.map(value => {
    const stylePropertyOptions =
      typeof list[value] !== 'boolean'
        ? (list[value] as IStylePropsSDKOptions)
        : styleFactoriesDefaultOptions[value];

    return styleFactories[value]({
      prefix: styleSDKOptions?.cssVarPrefix,
      withoutDefaultValue: stylePropertyOptions.withoutDefaultValue,
      supportOpacity: stylePropertyOptions.supportOpacity,
    });
  });

  return withValidation(
    _stylePropsSDKFactory(
      composeSDKFactoriesWithReset(...supportedSDKFactories),
    ),
    {
      type: ['object'],
      properties: {
        style: {
          type: ['object'],
        },
      },
    },
  );
};
