import _ from 'lodash'
import type { AppEssentials } from '@wix/fe-essentials-viewer-platform'
import type { IPlatformUtils, WixCodeApi, FeatureName, IPlatformLogger, ClientSpecMapAPI, IModelsAPI, IWixCodeNamespacesRegistry, ModuleLoader, OnPageWillUnmount } from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../../types'
import { wixCodeSdkFactories } from '../../wixCodeSdks'
import type { IWixCodeViewerAppUtils } from './wixCodeViewerAppUtils'
import {
	MODELS_API,
	WIX_CODE_API_FACTORY,
	MODULE_LOADER,
	BOOTSTRAP_DATA,
	PLATFORM_UTILS,
	PLATFORM_LOGGER,
	VIEWER_HANDLERS,
	CLIENT_SPEC_MAP_API,
	ON_PAGE_WILL_UNMOUNT,
	WIX_CODE_VIEWER_APP_UTILS,
	WIX_CODE_NAMESPACES_REGISTRY,
} from './moduleNames'
import { IViewerHandlers } from '../types'

export type IWixCodeApiFactory = {
	initWixCodeApiForApplication: (appDefinitionId: string, appEssentials: AppEssentials) => Promise<WixCodeApi>
}

type SdkFactory = (appEssentials: AppEssentials, appDefinitionId: string) => { [namespace: string]: any }

const WixCodeApiFactory = (
	bootstrapData: BootstrapData,
	wixCodeViewerAppUtils: IWixCodeViewerAppUtils,
	modelsApi: IModelsAPI,
	clientSpecMapApi: ClientSpecMapAPI,
	platformUtils: IPlatformUtils,
	{ viewerHandlers }: IViewerHandlers,
	logger: IPlatformLogger,
	wixCodeNamespacesRegistry: IWixCodeNamespacesRegistry,
	moduleLoader: ModuleLoader,
	onPageWillUnmount: OnPageWillUnmount
): IWixCodeApiFactory => {
	const { platformEnvData } = bootstrapData
	const internalNamespaces = {
		// TODO: move this somewhere else
		events: {
			setStaticEventHandlers: wixCodeViewerAppUtils.setStaticEventHandlers,
		},
	}

	const createWixCodeApiFactories = () =>
		Promise.all(
			_.map(wixCodeSdkFactories, async (loader, name: FeatureName) => {
				const featurePageConfig = modelsApi.getFeaturePageConfig(name)
				const featureSiteConfig = bootstrapData.sdkFactoriesSiteFeatureConfigs[name] || {}
				const sdkFactory = await loader({ modelsApi, clientSpecMapApi, platformEnvData })

				return (appEssentials: AppEssentials, appDefinitionId: string) =>
					sdkFactory({
						featureConfig: { ...featureSiteConfig, ...featurePageConfig },
						handlers: viewerHandlers,
						appEssentials,
						platformUtils,
						platformEnvData,
						appDefinitionId,
						moduleLoader,
						onPageWillUnmount,
						wixCodeNamespacesRegistry: {
							get: (namespace: keyof WixCodeApi) => wixCodeNamespacesRegistry.get(namespace, appDefinitionId),
						},
					})
			})
		)

	// @ts-ignore
	const wixCodeSdksPromise: Promise<Array<SdkFactory>> = logger.runAsyncAndReport('createWixCodeApi', createWixCodeApiFactories)

	return {
		initWixCodeApiForApplication: async (appDefinitionId: string, appEssentials: AppEssentials) => {
			const factories = await wixCodeSdksPromise
			const wixCodeSdkArray = await Promise.all(_.map(factories, (factory) => factory(appEssentials, appDefinitionId))) // members API (users) returns a promise.
			const wixCodeApi = Object.assign({}, internalNamespaces, ...wixCodeSdkArray)
			wixCodeNamespacesRegistry.registerWixCodeNamespaces(wixCodeApi, appDefinitionId)
			return wixCodeApi
		},
	}
}

export default {
	factory: WixCodeApiFactory,
	deps: [
		BOOTSTRAP_DATA,
		WIX_CODE_VIEWER_APP_UTILS,
		MODELS_API,
		CLIENT_SPEC_MAP_API,
		PLATFORM_UTILS,
		VIEWER_HANDLERS,
		PLATFORM_LOGGER,
		WIX_CODE_NAMESPACES_REGISTRY,
		MODULE_LOADER,
		ON_PAGE_WILL_UNMOUNT,
	],
	name: WIX_CODE_API_FACTORY,
}
