import { createSiteAssetsClientAdapter } from '../siteAssetsClientAdapter'
import { Experiments, FetchFn, SiteAssetsClientTopology, ViewerModel } from '@wix/thunderbolt-symbols'
import {
	SiteAssetsClientConfig,
	SiteAssetsMetricsReporter,
	SiteAssetsModuleFetcher,
	SiteAssetsTopology,
} from '@wix/site-assets-client'

import type {
	ClientSACFactoryParams,
	SiteAssetsClientAdapter,
	ToRequestLevelSACFactoryParamsFromSpreadedViewerModel,
} from '../types'
import { shouldRouteStagingRequest } from '../adapters/configResolvers'

const toSiteAssetsTopology = (clientTopology: SiteAssetsClientTopology): SiteAssetsTopology => {
	const { mediaRootUrl, staticMediaUrl, siteAssetsUrl, moduleRepoUrl, fileRepoUrl } = clientTopology

	return {
		mediaRootUrl,
		staticMediaUrl,
		siteAssetsServerUrl: siteAssetsUrl,
		moduleRepoUrl,
		fileRepoUrl,
	}
}

export const toClientSACFactoryParams = ({
	viewerModel,
	fetchFn,
	siteAssetsMetricsReporter,
	moduleFetcher,
}: {
	viewerModel: ViewerModel
	fetchFn: FetchFn
	siteAssetsMetricsReporter: SiteAssetsMetricsReporter
	moduleFetcher: SiteAssetsModuleFetcher
	experiments: Experiments
}) => {
	const {
		requestUrl,
		siteAssets,
		fleetConfig,
		deviceInfo,
		mode: { qa: qaMode, debug: debugMode, enableTestApi: testMode },
		experiments,
	} = viewerModel

	return toClientSACFactoryParamsFrom({
		siteAssets,
		deviceInfo,
		qa: qaMode,
		enableTestApi: testMode,
		debug: debugMode,
		requestUrl,
		isStagingRequest: shouldRouteStagingRequest(fleetConfig),
		fetchFn,
		siteAssetsMetricsReporter,
		moduleFetcher,
		experiments,
	})
}

export const toClientSACFactoryParamsFrom = ({
	siteAssets,
	requestUrl,
	qa,
	enableTestApi,
	debug,
	deviceInfo,
	fetchFn,
	siteAssetsMetricsReporter,
	moduleFetcher,
	isStagingRequest,
	experiments,
}: ToRequestLevelSACFactoryParamsFromSpreadedViewerModel & {
	isStagingRequest?: boolean
	moduleFetcher: SiteAssetsModuleFetcher
	siteAssetsMetricsReporter: SiteAssetsMetricsReporter
	fetchFn: FetchFn
}) => {
	const {
		clientTopology,
		manifests,
		dataFixersParams,
		siteScopeParams,
		beckyExperiments,
		staticHTMLComponentUrl,
		remoteWidgetStructureBuilderVersion,
	} = siteAssets

	return {
		fetchFn,
		clientTopology,
		siteAssetsMetricsReporter,
		manifests,
		timeout: 4000,
		dataFixersParams,
		requestUrl,
		siteScopeParams,
		moduleFetcher,
		isStagingRequest,
		beckyExperiments,
		staticHTMLComponentUrl,
		remoteWidgetStructureBuilderVersion,
		deviceInfo,
		qaMode: qa,
		testMode: enableTestApi,
		debugMode: debug,
		experiments,
	}
}

export const createClientSAC = ({
	fetchFn,
	clientTopology,
	siteAssetsMetricsReporter,
	manifests,
	timeout,
	dataFixersParams,
	requestUrl,
	siteScopeParams,
	moduleFetcher,
	isStagingRequest,
	beckyExperiments,
	staticHTMLComponentUrl,
	remoteWidgetStructureBuilderVersion,
	deviceInfo,
	qaMode,
	testMode,
	debugMode,
	experiments,
}: ClientSACFactoryParams): SiteAssetsClientAdapter => {
	const topology = toSiteAssetsTopology(clientTopology)
	const config: SiteAssetsClientConfig = {
		moduleTopology: {
			publicEnvironment: topology,
			environment: topology,
		},
		staticsTopology: {
			timeout,
			baseURLs: clientTopology.pageJsonServerUrls,
		},
		isStagingRequest,
		artifactId: 'wix-thunderbolt-client',
	}

	return createSiteAssetsClientAdapter({
		fetchFn,
		config,
		siteAssetsMetricsReporter,
		manifests,
		moduleFetcher,
		timeout: 4000,
	})({
		dataFixersParams,
		requestUrl,
		siteScopeParams,
		beckyExperiments,
		staticHTMLComponentUrl,
		remoteWidgetStructureBuilderVersion,
		deviceInfo,
		qaMode,
		testMode,
		debugMode,
		experiments,
	})
}
