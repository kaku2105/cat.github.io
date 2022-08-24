import {
  SchemaReporter,
  MessageParams,
  ValidationResult,
} from '../createSchemaValidator';
import { assert } from '../../assert';
import { StringSchema } from '..';
import { messages } from '../../messages';

export function validateString(
  value: unknown,
  schema: StringSchema,
  reportError: SchemaReporter,
  messageParams: MessageParams,
): ValidationResult {
  const { minLength, maxLength, enum: enumArray, pattern } = schema;

  if (!assert.isString(value)) {
    return ValidationResult.InvalidType;
  }

  if (enumArray && !assert.isIn(value, enumArray)) {
    reportError(
      messages.invalidEnumValueMessage({
        value,
        enum: enumArray,
        ...messageParams,
      }),
      { ...messageParams, value },
    );
    return ValidationResult.Invalid;
  }

  if (
    (minLength && assert.isBelow(value.length, minLength)) ||
    (maxLength && assert.isAbove(value.length, maxLength))
  ) {
    reportError(
      messages.invalidStringLengthMessage({
        value,
        minimum: minLength as number, // minimum / maximum has to be of type number,
        maximum: maxLength,
        ...messageParams,
      }),
      { ...messageParams, value },
    );
    return ValidationResult.Invalid;
  }

  if (pattern && !new RegExp(pattern).test(value)) {
    reportError(
      messages.patternMismatchMessage({
        value,
        ...messageParams,
      }),
      { ...messageParams, value },
    );
    return ValidationResult.Invalid;
  }

  return ValidationResult.Valid;
}
