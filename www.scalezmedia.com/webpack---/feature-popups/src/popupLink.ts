import { withDependencies } from '@wix/thunderbolt-ioc'
import { IPopups, PopupsSymbol } from './index'
import { ILinkClickHandler } from '@wix/thunderbolt-symbols'
import { IUrlHistoryManager, UrlHistoryManagerSymbol, removeQueryParams, removeProtocol } from 'feature-router'

const TOP_AND_BOTTOM_ANCHORS = ['SCROLL_TO_TOP', 'SCROLL_TO_BOTTOM']

const popupLinkFactory = (popupApi: IPopups, urlHistoryManager: IUrlHistoryManager): ILinkClickHandler => ({
	handleClick: (anchor) => {
		const popupId = anchor.getAttribute('data-popupid')
		if (popupId) {
			popupApi.openPopupPage(popupId)
			return true
		}
		const fullUrlWithoutQueryParams = urlHistoryManager.getFullUrlWithoutQueryParams()
		const isLightboxOpen = !!popupApi.getCurrentPopupId()
		const href = anchor.getAttribute('href')
		const hrefWithoutQueryParams = href && removeQueryParams(href)
		const fullUrlNoProtocol = removeProtocol(fullUrlWithoutQueryParams)
		const hrefNoProtocol = removeProtocol(hrefWithoutQueryParams || '')

		const isLinkToCurrentPage = fullUrlNoProtocol === hrefNoProtocol

		const anchorDataId = anchor.getAttribute('data-anchor') || ''
		const isTopBottomAnchor = TOP_AND_BOTTOM_ANCHORS.includes(anchorDataId)
		const isLinkToNewTab = anchor.getAttribute('target') === '_blank'

		if (isLightboxOpen && (isLinkToCurrentPage || isTopBottomAnchor) && !isLinkToNewTab) {
			popupApi.closePopupPage()
			return true
		}

		return false
	},
})

export const PopupLink = withDependencies([PopupsSymbol, UrlHistoryManagerSymbol], popupLinkFactory)
