import {
  SchemaReporter,
  MessageParams,
  ValidationResult,
} from '../createSchemaValidator';
import { assert } from '../../assert';
import { IntegerSchema } from '..';
import { messages } from '../../messages';

export function validateInteger(
  value: unknown,
  schema: IntegerSchema,
  reportError: SchemaReporter,
  messageParams: MessageParams,
): ValidationResult {
  const { minimum, maximum, enum: enumArray } = schema;

  if (!assert.isInteger(value)) {
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
    (assert.isNumber(minimum) && assert.isBelow(value, minimum)) ||
    (assert.isNumber(maximum) && assert.isAbove(value, maximum))
  ) {
    reportError(
      messages.invalidNumberBoundsMessage({
        value,
        minimum: minimum as number, // minimum / maximum has to be of number type
        maximum,
        ...messageParams,
      }),
      { ...messageParams, value },
    );
    return ValidationResult.Invalid;
  }

  return ValidationResult.Valid;
}
