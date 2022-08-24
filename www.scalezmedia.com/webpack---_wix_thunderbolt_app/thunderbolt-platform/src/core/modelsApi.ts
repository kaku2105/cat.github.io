import _ from 'lodash'
import type { Connection, FeatureName, PlatformModel, IModelsAPI } from '@wix/thunderbolt-symbols'
import { getDisplayedId, getFullId, getItemId, isDisplayedOnly, REPEATER_DELIMITER } from '@wix/thunderbolt-commons'
import type { BootstrapData } from '../types'
import type { RawModel } from './types'
import RenderedAPI from './renderedService'
import { MasterPageId } from './constants'

export const getAPIsOverModel = (model: RawModel, bootstrapData: BootstrapData): IModelsAPI => {
	const getPageIdByCompId = (compId: string) => (model.rawMasterPageStructure[compId] ? MasterPageId : bootstrapData.currentPageId)
	const getCompIdByWixCodeNickname = (nickname: string) => _.get(getConnectionsByCompId('wixCode', nickname), [0, 'compId'])
	const getParentId = (compId: string) => {
		const fullCompId = getFullId(compId)
		return _.findKey(getStructureModel(), ({ components }) => components && components.includes(fullCompId))
	}
	const getCompType = (compId: string): string => {
		const { componentType } = getStructureModelComp(compId)
		return componentType
	}
	const getControllerTypeByCompId = (controllerCompId: string) => {
		const compId = getFullId(controllerCompId)
		const appControllers = _.find(getApplications(), (controllers) => !!controllers[compId])
		return _.get(appControllers, [compId, 'controllerType'], '')
	}
	const getRepeaterIdByCompId = (compId: string) => model.platformModel.compIdToRepeaterId[compId]
	const renderedServiceApi = RenderedAPI({ model, getCompType, getParentId })
	const getRoleForCompId = (compId: string, controllerCompId: string) => {
		const templateId = getFullId(compId)
		return _.findKey(getControllerConnections(controllerCompId), (connections: Array<Connection>) => connections.some((connection: Connection) => connection.compId === templateId))
	}
	const isRepeaterTemplate = (compId: string) => !!getRepeaterIdByCompId(compId)
	const { pagesToShowSosp, controllersInSosp } = model.platformModel.sosp
	const isSospShownOnPage = pagesToShowSosp[bootstrapData.currentPageId]

	const applications = _(model.platformModel.applications)
		.mapValues((controllers) => {
			return isSospShownOnPage ? controllers : _.pickBy(controllers, ({ compId }) => !controllersInSosp[compId])
		})
		.pickBy((controllers, appDefinitionId) => !bootstrapData.disabledPlatformApps[appDefinitionId] && !_.isEmpty(controllers))
		.value() as PlatformModel['applications']

	function getDisplayedIdsOfRepeaterTemplate(templateId: string) {
		const repeaterCompId = getRepeaterIdByCompId(templateId)
		if (!repeaterCompId) {
			return []
		}
		const repeaterItems = getCompProps(repeaterCompId).items
		return repeaterItems.map((itemId: string) => getDisplayedId(templateId, itemId))
	}

	function getOnLoadProperties(compId: string): { hiddenOnLoad: boolean; collapseOnLoad: boolean } {
		if (isDisplayedOnly(compId)) {
			return getOnLoadProperties(getFullId(compId))
		}
		const { hiddenOnLoad, collapseOnLoad } = model.platformModel.onLoadProperties[compId] || {}
		return {
			hiddenOnLoad: Boolean(hiddenOnLoad),
			collapseOnLoad: Boolean(collapseOnLoad),
		}
	}

	function getCompProps(compId: string) {
		return model.propsModel[compId]
	}

	function updateDisplayedIdPropsFromTemplate(compId: string) {
		if (isDisplayedOnly(compId) && !model.propsModel[compId]) {
			model.propsModel[compId] = _.cloneDeep(model.propsModel[getFullId(compId)])
		}
	}

	function clearProps(compId: string) {
		delete model.propsModel[compId]
	}

	function updateProps(compId: string, props: unknown) {
		updateDisplayedIdPropsFromTemplate(compId)
		if (!model.propsModel[compId]) {
			model.propsModel[compId] = {}
		}
		_.assign(model.propsModel[compId], props)
	}

	function getApplications() {
		return applications
	}

	function getApplicationIds() {
		return Object.keys(applications)
	}

	function getApplicationIdOfController(controllerCompId: string) {
		const controllerId = getFullId(controllerCompId)
		return _.findKey(applications, (controllers) => controllers[controllerId])
	}

	function getControllerConnections(controllerId: string) {
		return _.get(model.platformModel.connections, [controllerId], {})
	}

	function getConnectionsByCompId(controllerId: string, compId: string) {
		return _.get(model.platformModel.connections, [controllerId, compId], [])
	}

	function getStructureModel() {
		return model.structureModel
	}

	function getStructureModelComp(compId: string) {
		return model.structureModel[getFullId(compId)]
	}

	function getCompSdkData(compId: string) {
		if (isDisplayedOnly(compId)) {
			return model.platformModel.sdkData[compId] || model.platformModel.sdkData[getFullId(compId)]
		}
		return model.platformModel.sdkData[compId]
	}

	function getContainerChildrenIds(compId: string) {
		if (isDisplayedOnly(compId)) {
			const childrenIds = model.platformModel.containersChildrenIds[getFullId(compId)] || []
			return childrenIds.map((id) => getDisplayedId(id, getItemId(compId)))
		}
		return model.platformModel.containersChildrenIds[compId] || []
	}

	function getSlotByName(compId: string, slotName: string) {
		if (isDisplayedOnly(compId)) {
			const fullId = getFullId(compId)
			const itemId = getItemId(compId)
			return getDisplayedId(model.platformModel.slots[fullId]?.[slotName], itemId)
		}
		return model.platformModel.slots[compId]?.[slotName]
	}

	function isDatabindingController(controllerCompId: string) {
		return !!model.platformModel.applications.dataBinding?.[controllerCompId]
	}

	function findClosestParentIdWithRole(compId: string, controllerCompId: string) {
		let parentId = getParentId(compId) as string
		while (parentId) {
			// dbsm needs a way to get parent even if the controller does not have connection to the parent. see TB-2546 for more info
			// https://github.com/wix-private/js-wixcode-sdk/blob/a6a20a4e5075b9837692e933a007100127955476/js/modules/ui/Node.es6#L109 for bolt implementation
			const parentRole = getRoleForCompId(parentId, controllerCompId) || (isDatabindingController(controllerCompId) && getRoleForCompId(parentId, 'wixCode'))
			if (!parentRole) {
				parentId = getParentId(parentId) as string
			} else {
				break // found the parent role
			}
		}
		return parentId
	}

	const getWixCodeConnectionByCompId = (compId: string) => getConnectionsByCompId('wixCode', compId)[0] // there is always one wixCode connection per compId

	const getRepeatedControllers = (repeaterId: string) => {
		return _.reduce(
			getApplications(),
			(apps, appControllers, appDefinitionId) => {
				const appControllersInRepeater = _.filter(appControllers, (controller) => getRepeaterIdByCompId(controller.compId) === repeaterId)
				if (!_.isEmpty(appControllersInRepeater)) {
					apps[appDefinitionId] = _.keyBy(appControllersInRepeater, (controller) => controller.compId)
				}
				return apps
			},
			{} as PlatformModel['applications']
		)
	}

	const hasResponsiveLayout = (compId: string): boolean => {
		return model.platformModel.responsiveCompsInClassic[compId]
	}

	const allControllersOnPageAreGhosts = () => model.platformModel.allControllersOnPageAreGhosts

	const getEffectsByCompId = (compId: string): Array<string> => {
		return model.pageConfig.triggersAndReactions?.compsToEffects[compId] || []
	}

	const isFeatureEnabledOnPage = (featureName: FeatureName) => model.pageFeatures.includes(featureName)
	const isFeatureEnabledOnMasterPage = (featureName: FeatureName) => model.masterPageFeatures.includes(featureName)

	return {
		getEffectsByCompId,
		isFeatureEnabledOnPage,
		isFeatureEnabledOnMasterPage,
		getAllConnections: () => model.platformModel.connections,
		getApplications,
		getApplicationIds,
		getApplicationIdOfController,
		getCompIdByWixCodeNickname,
		getCompIdConnections: () => model.platformModel.compIdConnections,
		getCompProps,
		getCompSdkData,
		getCompType,
		getConnectionsByCompId,
		getContainerChildrenIds,
		getControllerConnections,
		getControllerConfigs: () => model.platformModel.controllerConfigs,
		getRepeatedControllersConfigs: (appDefinitionId, templateControllerCompId) => {
			const repeatedControllerPrefix = `${templateControllerCompId}${REPEATER_DELIMITER}`
			return _.pickBy(model.platformModel.controllerConfigs[appDefinitionId], (__, controllerCompId) => controllerCompId.startsWith(repeatedControllerPrefix))
		},
		getControllerTypeByCompId,
		getControllers: () => model.platformModel.orderedControllers,
		getDisplayedIdsOfRepeaterTemplate,
		getFeaturePageConfig: (feature: FeatureName) => model.pageConfig[feature] || {},
		getOnLoadProperties,
		getPageIdByCompId,
		getParentId,
		getSlotByName,
		getRepeaterIdByCompId,
		getRoleForCompId,
		getStaticEvents: () => model.platformModel.staticEvents,
		getStructureModel,
		getStructureModelComp,
		isRepeaterTemplate,
		isController: (compId) => model.platformModel.orderedControllers.includes(compId),
		isRendered: (compId) => renderedServiceApi.isRendered(compId),
		updateProps,
		findClosestParentIdWithRole,
		getWixCodeConnectionByCompId,
		updateDisplayedIdPropsFromTemplate,
		hasTPAComponentOnPage: () => model.platformModel.hasTPAComponentOnPage,
		hasResponsiveLayout,
		getRepeatedControllers,
		clearProps,
		allControllersOnPageAreGhosts,
	}
}
