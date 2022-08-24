import { withDependencies } from '@wix/thunderbolt-ioc'
import { PlatformEnvDataProvider } from '@wix/thunderbolt-symbols'
import type { IPopupsLinkUtilsAPI } from './types'
import { PopupsLinkUtilsAPISymbol } from './symbols'

export const PopupsEnvDataProvider = withDependencies(
	[PopupsLinkUtilsAPISymbol],
	(popupsLinkUtilsAPI: IPopupsLinkUtilsAPI): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				return {
					popups: { popupPages: popupsLinkUtilsAPI.getPopupPages() },
				}
			},
		}
	}
)
