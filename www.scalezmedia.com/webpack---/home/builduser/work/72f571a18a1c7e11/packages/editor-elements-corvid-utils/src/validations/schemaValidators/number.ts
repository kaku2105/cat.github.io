import {
  SchemaReporter,
  MessageParams,
  ValidationResult,
} from '../createSchemaValidator';
import { assert } from '../../assert';
import { NumberSchema } from '..';
import { messages } from '../../messages';

export function validateNumber(
  value: unknown,
  schema: NumberSchema,
  reportError: SchemaReporter,
  messageParams: MessageParams,
): ValidationResult {
  const { minimum, maximum, enum: enumArray } = schema;

  if (!assert.isNumber(value)) {
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
        minimum: minimum as number, // either minimum or maximum are numbers here
        maximum,
        ...messageParams,
      }),
      { ...messageParams, value },
    );
    return ValidationResult.Invalid;
  }

  return ValidationResult.Valid;
}
