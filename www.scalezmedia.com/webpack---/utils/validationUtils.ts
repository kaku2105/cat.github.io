import { toArray } from './generalUtils';
/**
 * Validate if a value is a real number
 * From https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 * With one change - not supporting numeric strings
 */
function isNumber(n) {
    return !Number.isNaN(n) && Number.isFinite(n);
}
/**
 * Validate if a string value is of the form '123.456' / '-123.456' / '+=123.456' / '-=123.456'
 */
function isRelativeNumber(n) {
    return typeof n === 'string' && /^(-|[+-]=)?\d*\.?\d+$/.test(n);
}
/**
 * Validate if a value is a number, a number string or a relative number (+=/-=)
 */
function isNumberLike(n) {
    return isNumber(+n) || isRelativeNumber(n);
}
/**
 * Validate if a value is a real object
 * Based on https://stackoverflow.com/a/14706877, Added check for isArray()
 */
function isObject(obj) {
    const type = typeof obj;
    return (type === 'function' || (type === 'object' && !Array.isArray(obj) && !!obj));
}
const validateTypes = {
    string(_key, validator, param) {
        if (typeof param !== 'string') {
            return false;
        }
        if (validator.enum) {
            return validator.enum.includes(param);
        }
        if (validator.pattern) {
            return param.match(validator.pattern);
        }
        return true;
    },
    number(_key, validator, param) {
        if (!isNumber(param)) {
            return false;
        }
        const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = validator;
        return (param >= min &&
            param <= max &&
            (!validator.enum || validator.enum.includes(param)));
    },
    integer(key, validator, param) {
        const isFloat = validateTypes.number(key, validator, param);
        return isFloat && parseInt(param, 10) === param;
    },
    numberLike(_key, _validator, param) {
        return isNumberLike(param);
    },
    boolean(_key, _validator, param) {
        return typeof param === 'boolean';
    },
    object(_key, validator, param) {
        if (isObject(param)) {
            if (isObject(validator.properties)) {
                return validateSchema(validator.properties, param);
            }
            return true;
        }
        return false;
    },
    array(_key, _validator, param) {
        return Array.isArray(param);
    },
    element(_key, _validator, param) {
        if (!isObject(param)) {
            return false;
        }
        const constructorType = param.constructor.name || param.constructor.toString(); // IE has no function.name
        return constructorType.match(/HTML.*Element/);
    },
    elements(key, validator, param) {
        if (!isObject(param)) {
            return false;
        }
        return toArray(param).every((element) => validateTypes.element(key, validator, element));
    },
};
/**
 * Validate animation properties by schema
 * The schema structure is loosely based on JSON Schema
 * TODO: document schema types and structure
 * TODO: document validation errors
 */
function validateSchema(schema, params, logger) {
    const errors = Object.entries(schema)
        .map(([key, validator]) => {
        const value = params[key];
        const validateType = validateTypes[validator.type];
        const isValid = typeof value !== 'undefined' && validateType
            ? validateType(key, validator, value)
            : true;
        return (!isValid && {
            key,
            value: JSON.stringify(value),
            expected: validator,
        });
    })
        .filter((value) => value);
    if (logger && errors.length) {
        logger(errors);
    }
    return !errors.length;
}
export { validateSchema, validateTypes, isNumber };
//# sourceMappingURL=validationUtils.js.map