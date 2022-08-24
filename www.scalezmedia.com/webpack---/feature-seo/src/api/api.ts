import {
	getDefaultItemPayload,
	getTitle,
	getMetaTags,
	getCanonical,
	renderToStaticMarkup,
	setDescription,
	setLinks,
	setMetaTags,
	setSchemas,
	setTitle,
	isComponentItemType,
} from '@wix/advanced-seo-utils/renderer'
import { SeoSchema } from '@wix/advanced-seo-utils'
import { convertDynamicPageModel, setExternalRouter } from '@wix/advanced-seo-utils/renderer-api'
import { getTags } from '@wix/advanced-seo-utils/async'
import { DynamicRouteData } from '@wix/thunderbolt-symbols'
import { resolveMetaTags } from './resolve-meta-tags'
import { OgTags, TwitterTags, MetaTag, MethodOptions, AttributeDescriptor } from '../types'
import { setTagToDOM } from './utils'

export {
	getTags,
	getDefaultItemPayload,
	getTitle,
	setTitle,
	setLinks,
	setSchemas,
	setMetaTags,
	setDescription,
	isComponentItemType,
}

export const setWindowTitle = (title: string) => {
	if (process.env.browser) {
		window.document.title = title
	}
}

export const setSocialTagsToDOM = (tags: SeoSchema) => {
	if (process.env.browser) {
		setMetaTagsToDom(Object.values(OgTags), 'property')
		setMetaTagsToDom(Object.values(TwitterTags), 'name')
		setCanonicalToDOM()
	}

	function setMetaTagsToDom(tagDescriptors: Array<string>, attribute: AttributeDescriptor): void {
		tagDescriptors.forEach((tagDescriptor) => {
			const [ogTag]: Array<MetaTag> = getMetaTags(tags, { [attribute]: tagDescriptor })
			if (ogTag) {
				setTagToDOM({
					type: 'meta',
					name: { key: attribute, value: tagDescriptor },
					content: { key: 'content', value: ogTag.content },
				})
			}
		})
	}

	function setCanonicalToDOM() {
		const canonicalUrl = getCanonical(tags)
		if (canonicalUrl) {
			setTagToDOM({
				type: 'link',
				name: { key: 'rel', value: 'canonical' },
				content: { key: 'href', value: canonicalUrl },
			})
		}
	}
}

export const getStaticMarkup = (tags: any, options: MethodOptions) => renderToStaticMarkup(tags, options).join('\n  ') // indenting every tag for final render

export const convertTPAEndpointModel = async (tpaEnapointData: any) => {
	const converters = await import('@wix/advanced-seo-utils/converters' /* webpackChunkName: "seo-api-converters" */)
	return converters.convertTpaModel(tpaEnapointData)
}

export const extractDynamicRouteData = (
	payload: DynamicRouteData,
	mediaItemUtils: any,
	currentVeloOverrides: Array<MetaTag> = []
) => {
	if (payload) {
		const { pageHeadData = {} } = payload
		const resolvedPageHeadData = {
			...pageHeadData,
			metaTags: resolveMetaTags(pageHeadData.metaTags || {}, mediaItemUtils),
		}
		const veloOverrides = setExternalRouter(currentVeloOverrides, resolvedPageHeadData)
		const dynamicPageData = convertDynamicPageModel(resolvedPageHeadData)
		return {
			veloOverrides,
			dynamicPageData,
		}
	}
}
