import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { CurrentRouteInfoSymbol, FeatureStateSymbol } from '@wix/thunderbolt-symbols'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'
import type { ICurrentRouteInfo } from 'feature-router'
import type { IFeatureState } from 'thunderbolt-feature-state'
import type { IPopupsPageNavigationHandler, PopupFeatureState } from './types'

export const PopupsPageNavigationHandler = withDependencies(
	[named(FeatureStateSymbol, 'popups'), NavigationManagerSymbol, CurrentRouteInfoSymbol],
	(
		featureState: IFeatureState<PopupFeatureState>,
		navigationManager: INavigationManager,
		currentRouteInfo: ICurrentRouteInfo
	): IPopupsPageNavigationHandler => {
		return {
			name: 'popupsPageNavigationHandler',
			appWillLoadPage: () => {
				if (navigationManager.isFirstNavigation() && !currentRouteInfo.isLandingOnProtectedPage()) {
					featureState.update((state) => ({
						...state,
						pendingPopupPromise: navigationManager.waitForNavigationEnd(),
					}))
				}

				featureState.get()?.pageWillLoadHandler?.()
			},
		}
	}
)
