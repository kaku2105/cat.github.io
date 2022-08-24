import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	BIReporter,
	BISymbol,
	CommonConfig,
	BrowserWindowSymbol,
	BrowserWindow,
	ViewerModelSym,
	ViewerModel,
	PlatformEnvDataProvider,
	SdkHandlersProvider,
} from '@wix/thunderbolt-symbols'
import { isSSR } from '@wix/thunderbolt-commons'
import type { ICommonConfig, ICommonConfigState, ICommonConfigWixCodeSdkHandlers } from './types'

export const CommonConfigImpl = withDependencies(
	[ViewerModelSym, BISymbol, BrowserWindowSymbol],
	(
		viewerModel: ViewerModel,
		biReporter: BIReporter,
		window: BrowserWindow
	): ICommonConfig & PlatformEnvDataProvider & SdkHandlersProvider<ICommonConfigWixCodeSdkHandlers> => {
		const state: ICommonConfigState = {
			commonConfig: viewerModel.commonConfig,
			subscribers: new Set(),
		}

		const getCommonConfig = () => state.commonConfig
		const registerToCommonConfigChange: ICommonConfig['registerToCommonConfigChange'] = (subscriber) => {
			state.subscribers.add(subscriber)
			return () => state.subscribers.delete(subscriber)
		}

		return {
			getCommonConfig,
			getCommonConfigForUrl: () => {
				const commonConfigQueryParam: any = { ...state.commonConfig }
				// Needed since the Aspect in the server expects BSI according to it's proto: https://github.com/wix-private/fed-infra/blob/master/fed-infra-protos/src/main/proto/common-config.proto#L26
				commonConfigQueryParam.BSI = commonConfigQueryParam.bsi
				// using deny list instead so we don't need to manually add every new property
				delete commonConfigQueryParam.consentPolicyHeader
				delete commonConfigQueryParam.consentPolicy
				return commonConfigQueryParam
			},
			updateCommonConfig: (config: Partial<CommonConfig>) => {
				if (config.hasOwnProperty('bsi')) {
					biReporter.setDynamicSessionData({ bsi: config.bsi })
				}
				state.commonConfig = { ...state.commonConfig, ...config }
				state.subscribers.forEach((subscriber) => subscriber(state.commonConfig))

				if (!isSSR(window)) {
					window!.commonConfig = state.commonConfig
				}
			},
			registerToCommonConfigChange,
			get platformEnvData() {
				return { commonConfig: getCommonConfig() }
			},
			getSdkHandlers: () => ({ registerToCommonConfigChange }),
		}
	}
)
