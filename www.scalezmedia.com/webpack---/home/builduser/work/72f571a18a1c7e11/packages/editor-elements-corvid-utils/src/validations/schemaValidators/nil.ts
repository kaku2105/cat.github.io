import { assert } from '../../assert';
import { ValidationResult } from '../createSchemaValidator';

export function validateNil(value: unknown): ValidationResult {
  if (!assert.isNil(value)) {
    return ValidationResult.InvalidType;
  }

  return ValidationResult.Valid;
}
