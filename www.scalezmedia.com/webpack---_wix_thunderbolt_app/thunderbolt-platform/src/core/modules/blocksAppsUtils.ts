import _ from 'lodash'
import { ViewerAppSpecData } from '@wix/thunderbolt-symbols'
import { BootstrapData } from '../../types'
import { BLOCKS_APPS_UTILS, BOOTSTRAP_DATA } from './moduleNames'

export interface IBlocksPreviewAppData {
	blocksPreviewData: {
		widgetsCodeMap: {
			[pageId: string]: {
				url: string
			}
		}
		widgetDescriptorsMap: { [widgetType: string]: object }
	}
}

interface IBlocksConsumerAppData {
	blocksConsumerData: {
		codeExperimentsQueryString: string
	}
}

export interface IBlocksAppsUtils {
	createBlocksPreviewAppData(appData: ViewerAppSpecData): IBlocksPreviewAppData

	createBlocksConsumerAppData(appData: ViewerAppSpecData): IBlocksConsumerAppData

	isBlocksApp(appData: Pick<ViewerAppSpecData, 'appDefinitionId'>): boolean
}

export const BlocksAppsUtils = (bootstrapData: BootstrapData): IBlocksAppsUtils => {
	const {
		wixCodeBootstrapData: { wixCodePageIds },
		platformEnvData,
		blocksBootstrapData,
	} = bootstrapData

	return {
		createBlocksPreviewAppData() {
			return {
				blocksPreviewData: {
					widgetsCodeMap: _.mapValues(wixCodePageIds, (url) => ({ url })),
					widgetDescriptorsMap: platformEnvData.blocks?.blocksPreviewData?.widgetDescriptorsMap ?? {},
				},
			}
		},
		createBlocksConsumerAppData() {
			return {
				blocksConsumerData: {
					codeExperimentsQueryString: blocksBootstrapData.experimentsQueryParams,
				},
			}
		},
		isBlocksApp({ appDefinitionId }) {
			return Boolean(blocksBootstrapData.blocksAppsData[appDefinitionId])
		},
	}
}

export default {
	factory: BlocksAppsUtils,
	deps: [BOOTSTRAP_DATA],
	name: BLOCKS_APPS_UTILS,
}
