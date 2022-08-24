import {
  isValidHexaOrHex,
  isValidRGBOrRGBA,
  isKeyword,
} from './colorAssertions';
import { colorKeywords } from './colorKeywords';

export const getChannelsFromHex = (color: string) => {
  const chunkSize = Math.floor((color.length - 1) / 3);
  return color
    .slice(1)
    .match(new RegExp(`.{${chunkSize}}`, 'g')) as RegExpMatchArray;
};

export const convertHexUnitTo256 = (hex: string) =>
  parseInt(hex.repeat(2 / hex.length), 16);

export const convertHexaOrHexToRGBAUnits = (color: string) => {
  if (!isValidHexaOrHex(color)) {
    return;
  }
  const hexArr = getChannelsFromHex(color);
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  const alpha = typeof a !== 'undefined' ? roundToTwoDecimals(a / 255) : 1;
  return [r, g, b, alpha];
};

export const convertRGBAorRGBToRGBAUnits = (color: string) => {
  if (!isValidRGBOrRGBA(color)) {
    return;
  }
  const inParts = color.substring(color.indexOf('(')).split(',');
  const r = parseInt(inParts[0].substring(1).trim(), 10);
  const g = parseInt(inParts[1].trim(), 10);
  const b = parseInt(inParts[2].trim(), 10);
  const a =
    inParts[3] &&
    parseFloat(inParts[3].substring(0, inParts[3].length - 1).trim());
  const alpha = typeof a !== 'undefined' ? a : 1;
  return [r, g, b, alpha];
};

export const convertColorToRGBAUnits = (color: string) =>
  isValidHexaOrHex(color)
    ? convertHexaOrHexToRGBAUnits(color)!
    : isValidRGBOrRGBA(color)
    ? convertRGBAorRGBToRGBAUnits(color)!
    : isKeyword(color)
    ? convertHexaOrHexToRGBAUnits(colorKeywords[color])!
    : undefined;

export const extractOpacity = (color: string) => {
  const colorUnits = convertColorToRGBAUnits(color);
  if (colorUnits) {
    return colorUnits[3];
  }
  return;
};

export const applyOpacity = (color: string, opacity: number | string) => {
  const colorUnits = convertColorToRGBAUnits(color);
  if (colorUnits) {
    const [r, g, b] = colorUnits;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return;
};

export const roundToTwoDecimals = (number: number) =>
  Math.round(number * 1e2) / 1e2;
