import _ from 'lodash'
import type { Initializable, IModelsAPI } from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../../types'
import type { IViewerHandlers } from '../types'
import { FEDOPS_WEB_VITALS, BOOTSTRAP_DATA, MODELS_API, VIEWER_HANDLERS } from './moduleNames'

const FedopsWebVitals = ({ platformEnvData }: BootstrapData, modelsApi: IModelsAPI, { viewerHandlers }: IViewerHandlers): Initializable => ({
	init: () => {
		if (process.env.browser && platformEnvData.bi.pageData.pageNumber === 1 && !platformEnvData.bi.isPreview && !_.isEmpty(modelsApi.getApplications())) {
			const widgetAppNames = _(modelsApi.getApplications())
				.entries()
				.flatMap(([app, widgets]) => {
					return _(widgets)
						.values()
						.map((widget) => `${app}_${widget.controllerType}`)
						.value()
				})
				.value()

			viewerHandlers.fedopsWixCodeSdk.registerWidgets(widgetAppNames)
		}
	},
})

export default {
	factory: FedopsWebVitals,
	deps: [BOOTSTRAP_DATA, MODELS_API, VIEWER_HANDLERS],
	name: FEDOPS_WEB_VITALS,
}
