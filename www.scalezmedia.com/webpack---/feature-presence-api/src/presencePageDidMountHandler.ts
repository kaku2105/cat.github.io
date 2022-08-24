import { withDependencies } from '@wix/thunderbolt-ioc'
import { BrowserWindow, BrowserWindowSymbol, IPageDidMountHandler } from '@wix/thunderbolt-symbols'
import { SeoSiteSymbol, ISeoSiteApi } from 'feature-seo'
import type { IPresenceApi } from './types'
import { PresenceApiSymbol } from './symbols'
import { IPageNumber, PageNumberSymbol } from 'feature-router'

const presencePageDidMountFactory = (
	presenceApi: IPresenceApi,
	window: NonNullable<BrowserWindow>,
	pageNumberApi: IPageNumber,
	seoApi: ISeoSiteApi
): IPageDidMountHandler => {
	return {
		pageDidMount: async () => {
			const pageNumber = pageNumberApi.getPageNumber()
			presenceApi.setData({
				pageName: pageNumber > 1 ? await seoApi.getPageTitle() : window.document.title,
			})
		},
	}
}

export const PresencePageDidMountHandler = withDependencies(
	[PresenceApiSymbol, BrowserWindowSymbol, PageNumberSymbol, SeoSiteSymbol],
	presencePageDidMountFactory
)
