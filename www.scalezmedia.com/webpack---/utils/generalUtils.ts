export const deg2rad = (angleInDeg) => (angleInDeg * Math.PI) / 180;
export const isIterable = (value) => Symbol.iterator in Object(value);
export const toArray = (obj = []) => isIterable(obj) && typeof obj !== 'string'
    ? Array.from(obj)
    : obj === null
        ? []
        : [obj];
/**
 * union arrays
 * Cahnged to a better implementation from here https://stackoverflow.com/a/27664971
 */
export const unionArrays = (...arr) => Array.from(new Set([].concat(...arr)));
//# sourceMappingURL=generalUtils.js.map