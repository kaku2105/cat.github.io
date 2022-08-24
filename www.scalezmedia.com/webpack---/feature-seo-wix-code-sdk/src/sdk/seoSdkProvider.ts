import { SeoWixCodeSdkHandlers } from '../types'
import { SeoSiteSymbol, ISeoSiteApi } from 'feature-seo'
import { withDependencies } from '@wix/thunderbolt-ioc'
import { SdkHandlersProvider } from '@wix/thunderbolt-symbols'

export const seoWixCodeSdkHandlersProvider = withDependencies(
	[SeoSiteSymbol],
	(seoApi: ISeoSiteApi): SdkHandlersProvider<SeoWixCodeSdkHandlers> => ({
		getSdkHandlers: () => ({
			seo: {
				async setTitle(title) {
					await seoApi.setVeloTitle(title)
					seoApi.renderSEO()
				},
				async setLinks(links) {
					await seoApi.setVeloLinks(links)
					seoApi.renderSEO()
				},
				async setMetaTags(metaTags) {
					await seoApi.setVeloMetaTags(metaTags)
					seoApi.renderSEO()
				},
				async setStructuredData(structuredData) {
					await seoApi.setVeloStructuredData(structuredData)
					seoApi.renderSEO()
				},
				async setSeoStatusCode(seoStatusCode) {
					await seoApi.setVeloSeoStatusCode(seoStatusCode)
				},
				async renderSEOTags(payload) {
					await seoApi.setVeloSeoTags(payload)
					seoApi.renderSEO()
				},
				async resetSEOTags() {
					await seoApi.resetVeloSeoTags()
					seoApi.renderSEO()
				},
				async onTPAOverrideChanged(cb) {
					return seoApi.onTPAOverridesChanged(cb)
				},
			},
		}),
	})
)
