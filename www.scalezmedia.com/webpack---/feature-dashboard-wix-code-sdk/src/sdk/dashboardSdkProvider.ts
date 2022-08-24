import { optional, withDependencies } from '@wix/thunderbolt-ioc'
import {
	SdkHandlersProvider,
	BrowserWindow,
	BrowserWindowSymbol,
	IAppWillMountHandler,
	IAppWillLoadPageHandler,
	ExperimentsSymbol,
	Experiments,
	LoggerSymbol,
	ILogger,
} from '@wix/thunderbolt-symbols'
import { IPopupUtils, PopupUtilsSymbol } from 'feature-popups'
import { DashboardWixCodeSdkHandlers, ProxifiedDashboardApi } from '../types'
import { wrap, transfer, windowEndpoint, createEndpoint, Remote } from 'comlink/dist/esm/comlink.js' // eslint-disable-line no-restricted-syntax
import { callDashboardApiFactory } from './services/callDashboardApiFactory'
import { PopupProviderSymbol } from '../index'
import { IPopupApi } from './popupApiProvider'
import { name } from '../symbols'
import { init as initSDK, registerHeightReporter } from '@wix/dashboard-sdk/configurable'
import shouldExposeNewSdk from './services/shouldExposeNewSdk'
import getDashboardOrigin from './services/getDashboardOrigin'

const getDashboardApiFactory = (window: BrowserWindow) => {
	let dashboardApi: Remote<ProxifiedDashboardApi> | null = null

	return () => {
		if (!dashboardApi) {
			dashboardApi = wrap<ProxifiedDashboardApi>(windowEndpoint(window!.parent))
		}
		return dashboardApi
	}
}

export const dashboardWixCodeSdkHandlers = withDependencies(
	[BrowserWindowSymbol, PopupProviderSymbol, ExperimentsSymbol, LoggerSymbol, optional(PopupUtilsSymbol)],
	(
		window: BrowserWindow,
		popupApiProvider: () => Promise<IPopupApi>,
		experiments: Experiments,
		logger: ILogger,
		popupUtils?: IPopupUtils
	): SdkHandlersProvider<DashboardWixCodeSdkHandlers> & IAppWillMountHandler & IAppWillLoadPageHandler => {
		const getDashboardApi = getDashboardApiFactory(window)
		const isHostedInAnotherSite = window && window !== window.parent
		let isSDKInitialized = false
		let unregisterHeightReporter: (() => void) | null = null
		return {
			name,
			getSdkHandlers: () => ({
				[name]: {
					getDashboardApi: async () => {
						/// "Lazy" loading so the sled test has an opportunity to highjack window.parent...
						const dashboardApi = getDashboardApi()
						const port = await dashboardApi[createEndpoint]()
						return transfer(port, [port])
					},
					postMessageParent: (message, targetOrigin, transferables) => {
						if (isHostedInAnotherSite) {
							window.parent.postMessage(message, targetOrigin, transferables)
						}
					},
					captureError: (e: Error) => {
						logger.captureError(e, {
							tags: { feature: 'feature-dashboard-wix-code-sdk' },
							extra: { origin: 'factory' },
						})
					},
				},
			}),
			appWillLoadPage({ pageId }) {
				try {
					if (popupUtils?.isPopupPage(pageId)) {
						return
					}
					unregisterHeightReporter && unregisterHeightReporter()
					if (
						isHostedInAnotherSite &&
						shouldExposeNewSdk({ experiments, locationHref: window.location.href })
					) {
						if (!isSDKInitialized) {
							initSDK({
								origin: getDashboardOrigin(window.location.href) || '',
								postMessage: window.parent.postMessage.bind(window.parent),
							})
							isSDKInitialized = true
						}

						unregisterHeightReporter = registerHeightReporter(
							window.document.querySelector<HTMLElement>('#SITE_CONTAINER')!
						)
					}
				} catch (e) {
					logger.captureError(e, {
						tags: { feature: 'feature-dashboard-wix-code-sdk' },
					})
				}
			},
			async appWillMount() {
				const popupsApi = (await popupApiProvider()).getPopupsApi()
				if (popupsApi) {
					const dashboardApi = getDashboardApi()
					const callDashboardApi = callDashboardApiFactory(() => dashboardApi[createEndpoint]())
					popupsApi.registerToPopupEvent('popupOpen', () => {
						callDashboardApi('openLightbox')
					})
					popupsApi.registerToPopupEvent('popupClose', () => {
						callDashboardApi('closeLightbox')
					})
				}
			},
		}
	}
)
