const emailRegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const urlRegExp =
  /^(?:(?:https?:)\/\/)(?:(?:[\u0400-\uA69F\w][\u0400-\uA69F\w-]*)?[\u0400-\uA69F\w]\.)+(?:[\u0400-\uA69Fa-z]+|\d{1,3})(?::[\d]{1,5})?(?:[/?#].*)?$/i;
const wixSVGShapeRegExp = /^wix:vector:\/\/v1\/svgshape\.v[12]/;
const wixMediaRegExp = /^wix:vector:\/\/v1\/[0-9|a-z|_]+.svg/;

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isArray<TItem = any>(value: unknown): value is Array<TItem> {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !isArray(value);
}

export function isInteger(value: unknown): value is number {
  return Number.isInteger(value as any);
}

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isIn(value: any, arr: Array<any>): boolean {
  return arr.includes(value);
}

export function isAbove(value: number, limit: number) {
  return value > limit;
}

export function isBelow(value: number, limit: number) {
  return value < limit;
}

export function isEmail(value: string) {
  return emailRegExp.test(value);
}

export function isUrl(value: string) {
  return urlRegExp.test(value);
}

export function isInlineSvg(maybeSvg: string) {
  return maybeSvg.startsWith('<svg');
}

export function isWixSVGShape(maybeShape: string) {
  return wixSVGShapeRegExp.test(maybeShape);
}

export function isWixMediaUrl(maybeSvg: string) {
  return wixMediaRegExp.test(maybeSvg);
}

export function isSVG(value: string) {
  return Boolean(
    value &&
      (isWixMediaUrl(value) ||
        isUrl(value) ||
        isInlineSvg(value) ||
        isWixSVGShape(value)),
  );
}

export function is(value: any, predicates: Array<(value: any) => boolean>) {
  return predicates.every(p => p(value));
}
