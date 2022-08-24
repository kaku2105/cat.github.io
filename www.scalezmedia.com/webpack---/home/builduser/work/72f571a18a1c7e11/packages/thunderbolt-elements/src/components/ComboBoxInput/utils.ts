import { ComboBoxInputOption } from '@wix/thunderbolt-components';

export const isOptionWithSelectedText = (
  options: Array<ComboBoxInputOption>,
  optionValue: string,
) => {
  const selectedText = options.find(
    option => option.value === optionValue,
  )?.selectedText;

  return selectedText !== null && selectedText !== undefined;
};

export const noop = () => {};

export const calculateElemWidth = (elem: HTMLElement) =>
  elem.getBoundingClientRect().width;
