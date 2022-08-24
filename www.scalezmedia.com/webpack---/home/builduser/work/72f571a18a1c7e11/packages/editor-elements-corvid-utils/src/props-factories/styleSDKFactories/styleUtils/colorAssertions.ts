import { colorKeywords } from './colorKeywords';

export function isRGBAColor(value: string) {
  const rxValidRgba =
    /\b([R][G][B][A][(]\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(\s*,\s*((0\.[0-9]*)|(1\.0)|(1)|(0)))?[)])/i;
  return rxValidRgba.test(value);
}
export function isRGBColor(value: string) {
  const rxValidRgb =
    /\b([R][G][B][(]\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(\s*)[)])/i;
  return rxValidRgb.test(value);
}

export function isHexColor(value: string) {
  const validHexColor = /^#(([a-f0-9]){3}){1,2}$/i;
  return validHexColor.test(value);
}

export function isHexaColor(value: string) {
  const validHexaColor = /^#([a-f0-9]{8}|[a-f0-9]{4})\b$/gi;
  return validHexaColor.test(value);
}

export function isKeyword(color: string) {
  return colorKeywords[color];
}

export function isValidRGBOrRGBA(color: string) {
  return isRGBColor(color) || isRGBAColor(color);
}

export function isValidHexaOrHex(color: string) {
  return isHexaColor(color) || isHexColor(color);
}

export function isValidColor(color: string) {
  return isValidHexaOrHex(color) || isValidRGBOrRGBA(color) || isKeyword(color);
}
