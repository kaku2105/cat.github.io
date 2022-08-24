import { assert } from '../../assert';
import { ValidationResult } from '../createSchemaValidator';

export function validateBoolean(value: unknown): ValidationResult {
  if (!assert.isBoolean(value)) {
    return ValidationResult.InvalidType;
  }

  return ValidationResult.Valid;
}
