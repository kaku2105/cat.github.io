import type { IComponentSDKModel } from '@wix/editor-elements-types/corvid';

export function createComponentSDKModel(
  factory: IComponentSDKModel['factory'],
): IComponentSDKModel {
  return {
    factory,
  };
}
