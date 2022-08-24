import type {
  CorvidSDKApi,
  CorvidSDKFactory,
  ICorvidEventHandler,
  ICorvidMouseEvent,
} from '@wix/editor-elements-types/corvid';
import type {
  MenuDataItem,
  DeprecatedMenuDataItem,
} from '@wix/editor-elements-types/thunderbolt';

import { assert } from '../assert';
import { withValidation } from '../validations';
import { registerCorvidMouseEvent } from '../corvidEvents';
import { reportError } from '../reporters';
import {
  getLink,
  getLabel,
  PageList,
  LinkTypeError,
  InvalidLabelError,
  getMenuItemsSchema,
  validateMenuItemsDepth,
  validateMenuItemsTarget,
  transformSdkDataToPropData,
  transformPropDataToSdkData,
} from './menuUtils';

export interface IMenuItemsPropsSDKProps {
  id: string;
  items?: Array<DeprecatedMenuDataItem>;
}

export interface IMenuItemsPropsSDKData {
  isSubSubEnabled?: boolean;
  pageList?: PageList;
}

export interface IMenuItemsPropsSDKActions {
  onItemClick(event: React.MouseEvent, item: DeprecatedMenuDataItem): void;
  onItemMouseIn(event: React.MouseEvent, item: DeprecatedMenuDataItem): void;
  onItemMouseOut(event: React.MouseEvent, item: DeprecatedMenuDataItem): void;
  onItemDblClick(event: React.MouseEvent, item: DeprecatedMenuDataItem): void;
}

export interface IMenuItemsPropsSDK {
  menuItems: Array<MenuDataItem>;
  onItemClick(handler: ICorvidEventHandler<ICorvidMouseEvent>): void;
  onItemMouseIn(handler: ICorvidEventHandler<ICorvidMouseEvent>): void;
  onItemMouseOut(handler: ICorvidEventHandler<ICorvidMouseEvent>): void;
  onItemDblClick(handler: ICorvidEventHandler<ICorvidMouseEvent>): void;
}

const _menuItemsPropsSDKFactory: CorvidSDKFactory<
  IMenuItemsPropsSDKProps,
  IMenuItemsPropsSDK,
  IMenuItemsPropsSDKData
> = api => {
  const {
    setProps,
    props,
    platformUtils: { linkUtils },
    sdkData: { pageList } = {},
  } = api;

  if (!pageList) {
    reportError(
      'Page list is not passed into sdkData. Provide it in component mapper to use menuItems SDK properly.',
    );
  }

  const getMenuItems = (items?: IMenuItemsPropsSDK['menuItems']) => {
    if (assert.isArray(items)) {
      return items.map(createMenuDataItem);
    }
    return [];
  };

  const createMenuDataItem = (
    menuDataItem: IMenuItemsPropsSDK['menuItems'][number],
    index: number,
  ): IMenuItemsPropsSDK['menuItems'][number] => {
    const menuSdkItem: IMenuItemsPropsSDK['menuItems'][number] = {};

    try {
      const linkData = getLink({
        linkUtils,
        link: menuDataItem.link,
        target: menuDataItem.target || '_self',
      });

      if (linkData.href) {
        menuSdkItem.link = linkData.href;
        menuSdkItem.target = linkData.target || '_self';
      }
    } catch (error) {
      throw new LinkTypeError(menuDataItem.link || '', index);
    }

    const label = getLabel({
      label: menuDataItem.label,
      link: menuDataItem.link,
      pageList: pageList as PageList,
    });

    if (assert.isNil(label)) {
      throw new InvalidLabelError(index);
    }

    menuSdkItem.label = label;

    if (!assert.isNil(menuDataItem.selected)) {
      menuSdkItem.selected = menuDataItem.selected;
    }

    return {
      ...menuSdkItem,
      menuItems: getMenuItems(menuDataItem.menuItems),
    };
  };

  return {
    get menuItems(): IMenuItemsPropsSDK['menuItems'] {
      const value = props.items?.map(transformPropDataToSdkData) ?? [];
      return value?.map(createMenuDataItem) ?? [];
    },
    set menuItems(value: IMenuItemsPropsSDK['menuItems']) {
      try {
        setProps({
          items:
            value?.map(createMenuDataItem).map(transformSdkDataToPropData) ??
            [],
        });
      } catch (error) {
        reportError(error.message);
      }
    },
    onItemMouseIn: handler =>
      registerCorvidMouseEvent<DeprecatedMenuDataItem>(
        'onItemMouseIn',
        api,
        handler,
        payload => ({
          item: transformPropDataToSdkData(payload),
          type: 'itemMouseIn',
        }),
      ),
    onItemMouseOut: handler =>
      registerCorvidMouseEvent<DeprecatedMenuDataItem>(
        'onItemMouseOut',
        api,
        handler,
        payload => ({
          item: transformPropDataToSdkData(payload),
          type: 'itemMouseOut',
        }),
      ),
    onItemClick: handler =>
      registerCorvidMouseEvent<DeprecatedMenuDataItem>(
        'onItemClick',
        api,
        handler,
        payload => ({
          item: transformPropDataToSdkData(payload),
          type: 'itemMouseClick',
        }),
      ),
    onItemDblClick: handler =>
      registerCorvidMouseEvent<DeprecatedMenuDataItem>(
        'onItemDblClick',
        api,
        handler,
        payload => ({
          item: transformPropDataToSdkData(payload),
          type: 'itemMouseDblClick',
        }),
      ),
  };
};

export function menuItemsPropsSDKFactory(
  api: CorvidSDKApi<IMenuItemsPropsSDKProps, IMenuItemsPropsSDKData>,
) {
  const { sdkData: { isSubSubEnabled = false } = {} } = api;

  const menuItemsDepth = isSubSubEnabled ? 2 : 1;

  return withValidation<
    IMenuItemsPropsSDKProps,
    IMenuItemsPropsSDK,
    IMenuItemsPropsSDKData
  >(_menuItemsPropsSDKFactory, getMenuItemsSchema(menuItemsDepth), {
    menuItems: [
      validateMenuItemsDepth(menuItemsDepth),
      validateMenuItemsTarget,
    ],
  })(api);
}
