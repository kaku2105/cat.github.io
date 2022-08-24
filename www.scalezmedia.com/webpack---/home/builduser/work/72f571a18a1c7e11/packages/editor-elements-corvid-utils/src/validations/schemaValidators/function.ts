import { assert } from '../../assert';
import { ValidationResult } from '../createSchemaValidator';

export function validateFunction(value: unknown): ValidationResult {
  if (!assert.isFunction(value)) {
    return ValidationResult.InvalidType;
  }

  return ValidationResult.Valid;
}
