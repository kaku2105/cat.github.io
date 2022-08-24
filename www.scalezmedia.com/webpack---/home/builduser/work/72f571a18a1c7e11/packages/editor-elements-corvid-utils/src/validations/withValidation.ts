import type {
  CorvidSDKFactory,
  CorvidSDKApi,
} from '@wix/editor-elements-types/corvid';
import { reportError, reportWarning } from '../reporters';
import { ObjectSchema, FunctionSchema } from './schema.types';
import { createSchemaValidator } from './createSchemaValidator';

export type ValidationSchema = Pick<ObjectSchema, 'type'> &
  Required<Pick<ObjectSchema, 'properties'>>;

export type CustomPropertyValidator<TProps, TSDKData = {}> = (
  value: any,
  api: CorvidSDKApi<TProps, TSDKData>,
) => boolean;

export type CustomPropertyValidators<
  TProps extends object,
  TSDKData extends object,
> = Array<CustomPropertyValidator<TProps, TSDKData>>;

export function createCompSchemaValidator(
  compName: string,
  { suppressIndexErrors = false }: { suppressIndexErrors?: boolean } = {},
) {
  return createSchemaValidator({ reportError, reportWarning }, compName, {
    suppressIndexErrors,
  });
}

export type CustomValidationRules<
  TProps extends object,
  TSDK extends object,
  TSDKData extends object = object,
> = Partial<
  { [prop in keyof TSDK]: CustomPropertyValidators<TProps, TSDKData> }
>;

export function withValidation<
  TProps extends object,
  TSDK extends object,
  TSDKData extends object,
>(
  sdkFactory: CorvidSDKFactory<TProps, TSDK, TSDKData>,
  schema: ValidationSchema,
  rules: CustomValidationRules<TProps, TSDK, TSDKData> = {},
): CorvidSDKFactory<TProps, TSDK, TSDKData> {
  return (api: CorvidSDKApi<TProps, TSDKData>): TSDK => {
    const sdk: { [key: string]: any } = sdkFactory(api);
    const schemaValidator = createCompSchemaValidator(api.metaData.role);
    const argsSchemaValidator = createCompSchemaValidator(api.metaData.role, {
      suppressIndexErrors: true,
    });

    const sdkWithValidation = Object.keys(sdk).reduce((acc, sdkPropName) => {
      const propDesc = Object.getOwnPropertyDescriptor(
        sdk,
        sdkPropName,
      ) as PropertyDescriptor;

      const propWithValidationDesc: PropertyDescriptor = {
        // retrieve value from sdk
        enumerable: true,
        configurable: true,
      };
      // data descriptor (functions, variables)
      if (propDesc.value) {
        if (typeof propDesc.value === 'function') {
          propWithValidationDesc.value = (...args: Array<any>) => {
            const argsSchema =
              schema.properties[sdkPropName] &&
              (schema.properties[sdkPropName] as FunctionSchema).args;

            const customValidation:
              | CustomPropertyValidators<TProps, TSDKData>
              | undefined = rules[sdkPropName as keyof TSDKData];

            let isValid = true;

            if (argsSchema) {
              isValid = argsSchemaValidator(
                args,
                { type: ['array'], items: argsSchema },
                sdkPropName,
              );
            }

            if (isValid && customValidation) {
              isValid = customValidation.every(p => p(args, api));
            }

            return isValid ? propDesc.value(...args) : undefined;
          };
        } else {
          // delegate assignment to sdk
          propWithValidationDesc.value = propDesc.value;
        }
      }
      // accessor descriptor
      else {
        if (propDesc.get) {
          propWithValidationDesc.get = () => sdk[sdkPropName];
        }

        if (propDesc.set) {
          propWithValidationDesc.set = value => {
            const customValidation:
              | CustomPropertyValidators<TProps, TSDKData>
              | undefined = rules[sdkPropName as keyof TSDKData];

            let isValid = true;

            if (schema.properties[sdkPropName]) {
              isValid = schemaValidator(
                value,
                schema.properties[sdkPropName],
                sdkPropName,
              );
            }

            if (isValid && customValidation) {
              isValid = customValidation.every(p => p(value, api));
            }

            if (!isValid) {
              return;
            }

            // delegate assignment to sdk
            sdk[sdkPropName] = value;
          };
        }
      }

      Object.defineProperty(acc, sdkPropName, propWithValidationDesc);

      return acc;
    }, {});

    return sdkWithValidation as TSDK;
  };
}
