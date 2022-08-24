import _ from 'lodash'
import type { Connections, PartialFeaturesResponse, IPlatformLogger, PlatformModel } from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../types'
import type { ModelsProviderFactoryFunc } from './types'
import { getAPIsOverModel } from './modelsApi'
import { addGhostsInPlace } from './mergeGhosts'

export function ModelsApiProvider(bootstrapData: BootstrapData, modelsProviderFactory: ModelsProviderFactoryFunc, platformLogger: IPlatformLogger) {
	const fetchModels = modelsProviderFactory(platformLogger)

	function mergeConnections(masterPageConnections: Connections, pageConnections: Connections) {
		// merge connection arrays
		return _.mergeWith(pageConnections, masterPageConnections, (objValue, srcValue) => (_.isArray(objValue) ? objValue.concat(srcValue) : undefined))
	}

	const getModelFromSiteAssetsResponses = (isMasterPage: boolean, [platformModel, featuresModel]: [PlatformModel, PartialFeaturesResponse]) => {
		const {
			props: pageConfig,
			structure: { components, features },
		} = featuresModel
		const { connections, applications, orderedControllers, onLoadProperties, sosp, hasTPAComponentOnPage, responsiveCompsInClassic, slots, allControllersOnPageAreGhosts } = platformModel

		const { propsModel, structureModel } = addGhostsInPlace(platformModel, components, pageConfig.render.compProps)

		return {
			pageConfig,
			masterPageFeatures: isMasterPage ? features : [],
			pageFeatures: !isMasterPage ? features : [],
			propsModel,
			structureModel,
			rawMasterPageStructure: isMasterPage ? components : {},
			platformModel: {
				allControllersOnPageAreGhosts,
				connections,
				applications,
				orderedControllers,
				sdkData: platformModel.sdkData,
				staticEvents: platformModel.staticEvents,
				controllerConfigs: platformModel.controllerConfigs,
				compIdConnections: platformModel.compIdConnections,
				containersChildrenIds: platformModel.containersChildrenIds,
				compIdToRepeaterId: platformModel.compIdToRepeaterId,
				onLoadProperties,
				sosp,
				hasTPAComponentOnPage,
				responsiveCompsInClassic,
				slots,
			},
		}
	}

	const fetchPageModel = (pageType: 'masterPage' | 'page') => {
		const isMasterPage = pageType === 'masterPage'
		return Promise.all([fetchModels('platform', isMasterPage), fetchModels('features', isMasterPage)]).then((result) =>
			getModelFromSiteAssetsResponses(isMasterPage, result as [PlatformModel, PartialFeaturesResponse])
		)
	}

	const getModels = async () => {
		const pageModelPromise = fetchPageModel('page')
		if (bootstrapData.platformEnvData.site.isResponsive || bootstrapData.platformEnvData.bi.pageData.isLightbox) {
			return pageModelPromise
		}

		const masterPageModelPromise = fetchPageModel('masterPage')
		const [pageModel, masterPageModel] = await Promise.all([pageModelPromise, masterPageModelPromise])

		const applications = _.merge({}, masterPageModel.platformModel.applications, pageModel.platformModel.applications)
		const pageConfig = _.merge({}, masterPageModel.pageConfig, pageModel.pageConfig)
		const connections = mergeConnections(masterPageModel.platformModel.connections, pageModel.platformModel.connections)
		const onLoadProperties = _.merge({}, masterPageModel.platformModel.onLoadProperties, pageModel.platformModel.onLoadProperties)
		const structureModel = _.assign({}, masterPageModel.structureModel, pageModel.structureModel)
		const pageFeatures = pageModel.pageFeatures
		const masterPageFeatures = masterPageModel.masterPageFeatures
		const sdkData = _.assign({}, masterPageModel.platformModel.sdkData, pageModel.platformModel.sdkData)
		const staticEvents = _.concat(masterPageModel.platformModel.staticEvents, pageModel.platformModel.staticEvents)
		const controllerConfigs = _.merge({}, masterPageModel.platformModel.controllerConfigs, pageModel.platformModel.controllerConfigs)
		const compIdConnections = _.assign({}, masterPageModel.platformModel.compIdConnections, pageModel.platformModel.compIdConnections)
		const containersChildrenIds = _.assign({}, masterPageModel.platformModel.containersChildrenIds, pageModel.platformModel.containersChildrenIds)
		const compIdToRepeaterId = _.assign({}, masterPageModel.platformModel.compIdToRepeaterId, pageModel.platformModel.compIdToRepeaterId)
		const orderedControllers = masterPageModel.platformModel.orderedControllers.concat(pageModel.platformModel.orderedControllers)
		const hasTPAComponentOnPage = masterPageModel.platformModel.hasTPAComponentOnPage || pageModel.platformModel.hasTPAComponentOnPage
		const responsiveCompsInClassic = _.assign({}, masterPageModel.platformModel.responsiveCompsInClassic, pageModel.platformModel.responsiveCompsInClassic)
		const slots = _.assign({}, masterPageModel.platformModel.slots, pageModel.platformModel.slots)
		const allControllersOnPageAreGhosts = masterPageModel.platformModel.allControllersOnPageAreGhosts && pageModel.platformModel.allControllersOnPageAreGhosts

		const propsModel = pageConfig.render.compProps

		return {
			pageConfig,
			pageFeatures,
			masterPageFeatures,
			propsModel,
			structureModel,
			rawMasterPageStructure: masterPageModel.rawMasterPageStructure,
			platformModel: {
				allControllersOnPageAreGhosts,
				connections,
				applications,
				orderedControllers,
				sdkData,
				staticEvents,
				controllerConfigs,
				compIdConnections,
				containersChildrenIds,
				onLoadProperties,
				compIdToRepeaterId,
				sosp: masterPageModel.platformModel.sosp,
				hasTPAComponentOnPage,
				responsiveCompsInClassic,
				slots,
			},
		}
	}

	return {
		async getModelApi() {
			const models = await getModels()
			models.platformModel.orderedControllers = ['wixCode', ...models.platformModel.orderedControllers]
			return getAPIsOverModel(models, bootstrapData)
		},
	}
}
