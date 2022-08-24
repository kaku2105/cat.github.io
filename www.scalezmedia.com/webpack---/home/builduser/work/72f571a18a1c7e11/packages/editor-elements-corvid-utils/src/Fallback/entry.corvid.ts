import { IFallbackCorvidModel } from './Fallback.types';

export const FallbackCorvidModel: IFallbackCorvidModel = {
  componentType: 'Fallback',
  loadSDK: () =>
    import('./Fallback.corvid' /* webpackChunkName: "Fallback.corvid" */),
};

export default FallbackCorvidModel;
