import { assert } from '../../assert';
import { ValidationResult } from '../createSchemaValidator';

export function validateDate(value: unknown): ValidationResult {
  if (!assert.isDate(value)) {
    return ValidationResult.InvalidType;
  }

  return ValidationResult.Valid;
}
