import type { ValidationSchema } from '../../validations';

export const menuItemSchema: ValidationSchema = {
  type: ['object'],
  properties: {
    link: {
      type: ['string', 'nil'],
    },
    label: {
      type: ['string', 'nil'],
      minLength: 1,
      maxLength: 40,
    },
    target: {
      type: ['string', 'nil'],
    },
    selected: {
      type: ['boolean', 'nil'],
    },
    menuItems: {
      type: ['array', 'nil'],
    },
  },
};

export const getMenuItemsSchema = (depth: number): ValidationSchema => ({
  type: ['object'],
  properties: {
    ...new Array(depth + 1).fill(null).reduce(
      acc => ({
        menuItems: {
          type: ['array', 'nil'],
          items: {
            ...menuItemSchema,
            properties: {
              ...menuItemSchema.properties,
              ...acc,
            },
          },
        },
      }),
      {
        menuItems: menuItemSchema.properties.menuItems,
      },
    ),
  },
});
