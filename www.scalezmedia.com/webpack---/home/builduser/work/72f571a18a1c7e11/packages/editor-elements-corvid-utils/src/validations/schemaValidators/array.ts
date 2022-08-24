import {
  SchemaReporter,
  MessageParams,
  ValidationResult,
} from '../createSchemaValidator';
import { assert } from '../../assert';
import { ArraySchema, Schema } from '..';

function isTupleSchema(
  schema: Schema | Array<Schema>,
): schema is Array<Schema> {
  return Array.isArray(schema);
}

export function validateArray(
  value: unknown,
  schema: ArraySchema,
  validateSchema: (
    value: unknown,
    schema: Schema,
    params: MessageParams,
  ) => boolean,
  reportError: SchemaReporter,
  messageParams: MessageParams,
  suppressIndexError = false,
): ValidationResult {
  if (!assert.isArray(value)) {
    return ValidationResult.InvalidType;
  }

  let isValid: ValidationResult = ValidationResult.Valid;

  if (schema.items) {
    const itemsToValidateCount = isTupleSchema(schema.items)
      ? Math.min(value.length, schema.items.length)
      : value.length;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let itemIndex = 0; itemIndex < itemsToValidateCount; itemIndex++) {
      const item = value[itemIndex];

      let itemSchema: Schema;
      let propName: string | undefined;

      if (isTupleSchema(schema.items)) {
        itemSchema = schema.items[itemIndex];
        propName = (schema.items[itemIndex] as ArraySchema).name;
      } else {
        itemSchema = schema.items;
        propName = schema.name;
      }

      const isItemValid = validateSchema(item, itemSchema, {
        functionName: messageParams.functionName,
        propertyName: propName || messageParams.propertyName,
        index: !suppressIndexError ? itemIndex : undefined,
      });

      if (!isItemValid) {
        isValid = ValidationResult.Invalid;
      }
    }
  }

  return isValid;
}
