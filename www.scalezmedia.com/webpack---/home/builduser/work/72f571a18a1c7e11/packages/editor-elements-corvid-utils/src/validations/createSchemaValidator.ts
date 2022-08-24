import { assert } from '../assert';
import { messages } from '../messages';
import * as Schemas from './schema.types';
import * as typeValidators from './schemaValidators';

export const ValidationResult = {
  Valid: 'valid',
  Invalid: 'invalid',
  InvalidType: 'invalid-type',
} as const;

type TValidationResult = typeof ValidationResult;
// eslint-disable-next-line no-redeclare
export type ValidationResult = TValidationResult[keyof TValidationResult];

export type ReporterMessageParams = MessageParams & { value: unknown };
export type SchemaReporter = (
  message: string,
  messageParams?: ReporterMessageParams,
) => void;

export type ValidatorsMap = {
  [P in Schemas.SchemaType]: (
    value: unknown,
    schema: Schemas.SchemaTypeNameMap[P],
    messageParams: MessageParams,
  ) => ValidationResult;
};

export type MessageParams = {
  functionName: string;
  propertyName: string;
  index: number | undefined;
};

export type ValidationReporters = {
  reportError: SchemaReporter;
  reportWarning: SchemaReporter;
};

export function createSchemaValidator(
  { reportError, reportWarning }: ValidationReporters,
  compName: string,
  { suppressIndexErrors = false }: { suppressIndexErrors?: boolean } = {},
) {
  function validate(
    value: unknown,
    schema: Schemas.Schema,
    setterName: string,
  ) {
    return validateSchema(value, schema, {
      functionName: setterName,
      propertyName: setterName,
      /**
       * This intentional? In such a case all errors related to "index"
       * will never be fired
       */
      index: undefined,
    });
  }

  function validateSchema(
    value: unknown,
    schema: Schemas.Schema,
    params: MessageParams,
  ) {
    if (schema.warnIfNil && assert.isNil(value)) {
      reportWarning(
        messages.nilAssignmentMessage({
          ...params,
          compName,
        }),
        { ...params, value },
      );
    }

    let typeIdx = 0;
    for (; typeIdx < schema.type.length; typeIdx++) {
      const validateSchemaForType = validatorsMap[schema.type[typeIdx]];
      const validationResult = validateSchemaForType(
        value,
        schema as any,
        params,
      );
      if (validationResult !== ValidationResult.InvalidType) {
        return validationResult === ValidationResult.Valid;
      }
    }

    if (typeIdx === schema.type.length) {
      reportError(
        messages.invalidTypeMessage({
          value,
          types: schema.type,
          ...params,
        }),
        { ...params, value },
      );
    }

    return false;
  }

  const validatorsMap: ValidatorsMap = {
    object: (value, schema, messageParams) => {
      return typeValidators.validateObject(
        value,
        schema,
        validateSchema,
        reportError,
        reportWarning,
        messageParams,
      );
    },
    array: (value, schema, messageParams) => {
      return typeValidators.validateArray(
        value,
        schema,
        validateSchema,
        reportError,
        messageParams,
        suppressIndexErrors,
      );
    },
    number: (value, schema, messageParams) => {
      return typeValidators.validateNumber(
        value,
        schema,
        reportError,
        messageParams,
      );
    },
    integer: (value, schema, messageParams) => {
      return typeValidators.validateInteger(
        value,
        schema,
        reportError,
        messageParams,
      );
    },
    string: (value, schema, messageParams) => {
      return typeValidators.validateString(
        value,
        schema,
        reportError,
        messageParams,
      );
    },
    boolean: value => {
      return typeValidators.validateBoolean(value);
    },
    date: value => {
      return typeValidators.validateDate(value);
    },
    nil: value => {
      return typeValidators.validateNil(value);
    },
    function: value => {
      return typeValidators.validateFunction(value);
    },
  };

  return validate;
}
