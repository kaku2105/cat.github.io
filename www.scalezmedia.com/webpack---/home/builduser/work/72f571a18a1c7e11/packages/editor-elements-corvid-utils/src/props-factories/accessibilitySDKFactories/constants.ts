export const REMOVABLE_ATTRIBUTES = ['ariaLabel'] as const;

export enum ErrorMessages {
  ARIA_LABEL_NOT_STRING = 'aria-label must be string',
  ARIA_LABEL_EMPTY_STRING = "aria-label can't be an empty string",
  REMOVING_MISSING_ATTRIBUTE = 'Cannot remove a non existing attribute',
}

export const getNotTextSelectorError = (property: string) =>
  `The parameter that is passed to the ‘${property}’ property must be a selector function of a text element.`;

export const getNotSelectorError = (property: string) =>
  `The parameter that is passed to the ‘${property}’ property must be a selector function of an element.`;

export const getInvalidScreenReaderValueError = (property: string) =>
  `The parameter that is passed to the ‘${property}’ property must be a string or ‘null’.`;
