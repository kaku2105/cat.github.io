import {
  SchemaReporter,
  MessageParams,
  ValidationResult,
} from '../createSchemaValidator';
import { assert } from '../../assert';
import { ObjectSchema, Schema } from '..';
import { messages } from '../../messages';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;

export function validateObject(
  value: unknown,
  schema: ObjectSchema,
  validateSchema: (
    value: unknown,
    schema: Schema,
    params: MessageParams,
  ) => boolean,
  reportError: SchemaReporter,
  reportWarning: SchemaReporter,
  messageParams: MessageParams,
): ValidationResult {
  if (!assert.isObject(value)) {
    return ValidationResult.InvalidType;
  }

  if (schema.required) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (
      let propNameIdx = 0;
      propNameIdx < schema.required.length;
      propNameIdx++
    ) {
      if (!hasOwnProperty.call(value, schema.required[propNameIdx])) {
        reportError(
          messages.missingFieldMessage({
            functionName: messageParams.functionName,
            index: messageParams.index,
            propertyName: schema.required[propNameIdx],
          }),
          { ...messageParams, value },
        );
        return ValidationResult.Invalid;
      }
    }
  }

  if (schema.properties) {
    const propNames = getOwnPropertyNames(schema.properties);

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let propNameIdx = 0; propNameIdx < propNames.length; propNameIdx++) {
      const propName = propNames[propNameIdx];
      if (hasOwnProperty.call(value, propName)) {
        const propSchema = schema.properties[propName];
        const propValue = (value as any)[propName]; // hmmm...

        if (
          !validateSchema(propValue, propSchema, {
            functionName: messageParams.functionName,
            index: messageParams.index,
            propertyName: propName,
          })
        ) {
          return ValidationResult.Invalid;
        }
      }
    }
  }

  return ValidationResult.Valid;
}
