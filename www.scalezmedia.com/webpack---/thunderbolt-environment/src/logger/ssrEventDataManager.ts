import { withDependencies } from '@wix/thunderbolt-ioc'
import { ILogger, LoggerSymbol, ViewerModel, ViewerModelSym } from '@wix/thunderbolt-symbols'

export default withDependencies([LoggerSymbol, ViewerModelSym], (logger: ILogger, viewerModel: ViewerModel) => {
	const eventData = logger.getEventsData()
	const enrichingCondition =
		viewerModel.fleetConfig.type === 'Canary' || viewerModel.requestUrl.includes('performanceTool=true')
	return {
		enrichWarmupData: async () => {
			return enrichingCondition ? { ssrEvents: eventData } : null
		},
	}
})
