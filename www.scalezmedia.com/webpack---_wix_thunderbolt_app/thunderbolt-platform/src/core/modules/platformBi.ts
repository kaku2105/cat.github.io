import _ from 'lodash'
import type { BiUtils, Initializable, IModelsAPI } from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../../types'
import { PLATFORM_BI, PLATFORM_BI_LOGGER, BOOTSTRAP_DATA, MODELS_API } from './moduleNames'

const PlatformBi = (biUtils: BiUtils, { platformEnvData }: BootstrapData, modelsApi: IModelsAPI): Initializable => ({
	init: () => {
		if (process.env.browser && platformEnvData.bi.pageData.pageNumber === 1 && !platformEnvData.bi.isPreview) {
			const widgetsList = _.map(modelsApi.getApplications(), (controllers, appDefinitionId) => ({
				app_id: appDefinitionId,
				widgets: _(controllers)
					.countBy('controllerType')
					.map((count, controllerType) => ({ widget_id: controllerType, widget_instance_count: count }))
					.value(),
			}))
			biUtils.createBaseBiLoggerFactory().logger().report({
				src: 72,
				evid: 520,
				endpoint: 'bpm',
				params: { widgetsList },
			})
		}
	},
})

export default {
	factory: PlatformBi,
	deps: [PLATFORM_BI_LOGGER, BOOTSTRAP_DATA, MODELS_API],
	name: PLATFORM_BI,
}
