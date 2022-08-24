import type { CorvidSDKFactory } from '@wix/editor-elements-types/corvid';

export function composeSDKFactories<
  TProps extends object,
  TSDK extends object,
  TData extends object = object,
>(
  ...sources: Array<CorvidSDKFactory<any, any, any>>
): CorvidSDKFactory<TProps, TSDK, TData> {
  return api => {
    const target = {};
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let sourceIdx = 0; sourceIdx < sources.length; sourceIdx++) {
      const source = sources[sourceIdx](api);
      const sourceKeys = Object.keys(source);

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (
        let sourceKeyIdx = 0;
        sourceKeyIdx < sourceKeys.length;
        sourceKeyIdx++
      ) {
        const sourceKey = sourceKeys[sourceKeyIdx];
        const sourceProp = Object.getOwnPropertyDescriptor(
          source,
          sourceKey,
        ) as PropertyDescriptor;

        Object.defineProperty(target, sourceKey, sourceProp);
      }
    }

    return target as TSDK;
  };
}
