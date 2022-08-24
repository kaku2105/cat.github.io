import type { MenuDataItem } from '@wix/editor-elements-types/thunderbolt';
import { reportError } from '../../../reporters';
import { InvalidTargetError } from '../errors';

export const validateMenuItemsTarget = (
  value: Array<MenuDataItem>,
): boolean => {
  if (!value) {
    return true;
  }

  const checkMenuItemsTarget = (
    items?: Array<MenuDataItem>,
    parentIndex?: number,
  ): boolean =>
    items?.every(({ target, link = '', label = link, menuItems }, index) => {
      if (target != null && target !== '_blank' && target !== '_self') {
        throw new InvalidTargetError({
          index: parentIndex === undefined ? index : parentIndex,
          label,
          target,
        });
      }

      return checkMenuItemsTarget(menuItems, index);
    }) ?? true;

  try {
    return checkMenuItemsTarget(value);
  } catch (error) {
    reportError(error.message);
    return false;
  }
};
