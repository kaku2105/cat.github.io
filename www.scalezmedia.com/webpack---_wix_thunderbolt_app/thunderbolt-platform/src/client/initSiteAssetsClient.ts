import { PlatformEnvData, IPlatformLogger } from '@wix/thunderbolt-symbols'
import { clientModuleFetcher, createClientSAC, toClientSACFactoryParamsFrom } from 'thunderbolt-site-assets-client'
import { platformFedopsMetricsReporter } from '@wix/thunderbolt-commons'

export const siteAssetsClientWorkerAdapter = (platformEnvData: PlatformEnvData, logger: IPlatformLogger) => {
	const fetchFn = self.fetch
	const {
		location: { rawUrl },
		site: {
			mode: { qa, enableTestApi, debug },
		},
		siteAssets: {
			clientTopology,
			manifests,
			clientInitParams: {
				siteAssetsClientConfig: { isStagingRequest },
				deviceInfo,
			},
		},
	} = platformEnvData

	return createClientSAC(
		toClientSACFactoryParamsFrom({
			siteAssets: platformEnvData.siteAssets,
			deviceInfo,
			qa,
			enableTestApi,
			debug,
			requestUrl: rawUrl,
			fetchFn,
			isStagingRequest,
			moduleFetcher: clientModuleFetcher(
				fetchFn,
				clientTopology,
				{
					thunderbolt: manifests,
				},
				'webWorker'
			),
			siteAssetsMetricsReporter: platformFedopsMetricsReporter(logger),
			experiments: platformEnvData.site.experiments,
		})
	)
}
