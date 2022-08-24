import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { FeatureStateSymbol, MasterPageFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { name } from './symbols'
import type { IPopupsLinkUtilsAPI, PopupFeatureState, PopupsMasterPageConfig } from './types'
import { IFeatureState } from 'thunderbolt-feature-state'

const PopupsLinkUtilsAPIFactory = (
	masterPageConfig: PopupsMasterPageConfig,
	featureState: IFeatureState<PopupFeatureState>
): IPopupsLinkUtilsAPI => {
	return {
		getPopupPages() {
			return masterPageConfig.popupPages
		},
		getCurrentOrPendingPopupId() {
			return featureState.get()?.pendingPopupId || featureState.get()?.currentPopupId
		},
	}
}
export const PopupsLinkUtilsAPI = withDependencies(
	[named(MasterPageFeatureConfigSymbol, name), named(FeatureStateSymbol, name)],
	PopupsLinkUtilsAPIFactory
)
