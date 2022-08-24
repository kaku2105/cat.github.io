import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { BrowserWindow, BrowserWindowSymbol, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import type { GroupV2 } from '@wix/presence-client'
import { ISessionManager, SessionManagerSymbol } from 'feature-session-manager'
import { ConsentPolicySymbol, IConsentPolicy } from 'feature-consent-policy'
import type { PresenceApiSiteConfig, IPresenceApi, PresencePayload } from './types'
import { name } from './symbols'
import { LAZY_PRESENCE_TIMEOUT } from './constants'

interface PresenceState {
	group?: GroupV2
}

const presenceApiFactory = (
	siteFeatureConfig: PresenceApiSiteConfig,
	sessionManager: ISessionManager,
	browserWindow: NonNullable<BrowserWindow>,
	consentPolicy: IConsentPolicy
): IPresenceApi => {
	const state: PresenceState = {}
	let initPromise: Promise<void>

	return {
		setData: async (data: Partial<PresencePayload>) => {
			if (!state.group) {
				if (!initPromise) {
					initPromise = new Promise<void>((resolve) =>
						setTimeout(async () => {
							const lazyPresence = await import('./lazyPresence' /* webpackChunkName: "presence-lazy" */)
							const { group } = await lazyPresence.initPresence(
								siteFeatureConfig,
								sessionManager,
								browserWindow,
								consentPolicy
							)
							state.group = group
							resolve()
						}, LAZY_PRESENCE_TIMEOUT)
					)
				}
				await initPromise
			} else {
				await state.group.updatePresence(data)
			}
		},
	}
}

export const PresenceApi = withDependencies(
	[named(SiteFeatureConfigSymbol, name), SessionManagerSymbol, BrowserWindowSymbol, ConsentPolicySymbol],
	presenceApiFactory
)
