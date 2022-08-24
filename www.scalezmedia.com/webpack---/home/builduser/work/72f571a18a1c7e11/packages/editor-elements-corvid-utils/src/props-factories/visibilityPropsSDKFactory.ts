import type {
  CorvidSDKApi,
  CorvidSDKPropsFactory,
} from '@wix/editor-elements-types/corvid';
import { composeSDKFactories } from '../composeSDKFactories';
import { createHiddenCollapsedSDKFactory } from './hiddenCollapsedSDKFactory';
import {
  createViewportPropsSDKFactory,
  IViewportState,
  RegisterCallbackFn,
} from './viewportPropsSDKFactory';

const visibilityPropsSDKFactory: CorvidSDKPropsFactory<{}, {}> = (
  api,
  hasPortal = false,
) => {
  const [state, setState] = api.createSdkState<IViewportState>(
    {
      onViewportEnter: [],
      onViewportLeave: [],
    },
    'viewport',
  );

  const registerCallback: RegisterCallbackFn = (type, callback) => {
    setState({ [type]: [...state[type], callback] });
  };

  const hiddenCollapsedSDKFactory = createHiddenCollapsedSDKFactory({
    viewportState: state,
    hasPortal,
  });

  const viewportPropsSDKFactory =
    createViewportPropsSDKFactory(registerCallback);

  return composeSDKFactories(
    hiddenCollapsedSDKFactory,
    viewportPropsSDKFactory,
  )(api);
};

export const createVisibilityPropsSDKFactory = (hasPortal?: boolean) => {
  return (api: CorvidSDKApi<{}, any, any, any>) =>
    visibilityPropsSDKFactory(api, hasPortal);
};
