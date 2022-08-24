import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { FeatureStateSymbol, MasterPageFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import type { IPopupUtils, PopupFeatureState, PopupsMasterPageConfig } from './types'
import { name } from './symbols'
import { IFeatureState } from 'thunderbolt-feature-state'

type PopupUtilsFactory = (
	masterPageConfig: PopupsMasterPageConfig,
	featureState: IFeatureState<PopupFeatureState>
) => IPopupUtils

const popupUtilsFactory: PopupUtilsFactory = (masterPageConfig, featureState) => {
	return {
		isPopupPage(pageId) {
			return masterPageConfig.popupPages[pageId]
		},
		getCurrentPopupId() {
			return featureState.get()?.pendingPopupId || featureState.get()?.currentPopupId
		},
	}
}

export const PopupUtils = withDependencies(
	[named(MasterPageFeatureConfigSymbol, name), named(FeatureStateSymbol, name)],
	popupUtilsFactory
)
