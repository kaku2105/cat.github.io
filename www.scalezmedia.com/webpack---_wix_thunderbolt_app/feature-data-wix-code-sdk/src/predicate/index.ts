import type { ClientSpecMapAPI, IModelsAPI, PlatformEnvData } from '@wix/thunderbolt-symbols'

export const isWixDataRequired = ({
	modelsApi,
	clientSpecMapApi,
	platformEnvData,
}: {
	modelsApi: IModelsAPI
	clientSpecMapApi: ClientSpecMapAPI
	platformEnvData: PlatformEnvData
}) => {
	const applications = modelsApi.getApplications()
	const isAppRunning = (appDefId?: string) => Boolean(appDefId && applications[appDefId])

	const isWixCodeRunning = isAppRunning(clientSpecMapApi.getWixCodeAppDefinitionId())
	const isDatabindingRunning = isAppRunning(clientSpecMapApi.getDataBindingAppDefinitionId())
	const isBlocksRunning = clientSpecMapApi.getBlocksAppsAppDefinitionIds().some(isAppRunning)
	const isBlocksEditorRunning = isAppRunning(clientSpecMapApi.getBlocksPreviewAppDefinitionId())
	const isExperimentEnabled = Boolean(platformEnvData.site.experiments['specs.thunderbolt.WixDataNamespace'])

	return (isWixCodeRunning || isDatabindingRunning || isBlocksRunning || isBlocksEditorRunning) && isExperimentEnabled
}
