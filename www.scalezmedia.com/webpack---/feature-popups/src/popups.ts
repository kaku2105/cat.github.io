import { withDependencies, named } from '@wix/thunderbolt-ioc'
import {
	LifeCycle,
	BrowserWindow,
	BrowserWindowSymbol,
	FeatureStateSymbol,
	StructureAPI,
	IStructureAPI,
	MasterPageFeatureConfigSymbol,
	IPageWillUnmountHandler,
	CurrentRouteInfoSymbol,
} from '@wix/thunderbolt-symbols'
import type { IFeatureState } from 'thunderbolt-feature-state'
import { isSSR, enableCyclicTabbing, disableCyclicTabbing } from '@wix/thunderbolt-commons'
import { IPageInitializer, IPageProvider, PageInitializerSymbol, PageProviderSymbol } from 'feature-pages'
import type {
	IPopups,
	PopupFeatureState,
	PopupsMasterPageConfig,
	PopupEvent,
	PopupEventListener,
	ICurrentPopup,
} from './types'
import { name, CurrentPopupSymbol } from './symbols'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'
import { ICurrentRouteInfo } from 'feature-router'

const popupsFactory = (
	{ initPage }: IPageInitializer,
	window: BrowserWindow,
	featureState: IFeatureState<PopupFeatureState>,
	structureAPI: IStructureAPI,
	masterPageConfig: PopupsMasterPageConfig,
	pageProvider: IPageProvider,
	navigationManager: INavigationManager,
	currentRouteInfo: ICurrentRouteInfo,
	currentPopup: ICurrentPopup
): IPopups => {
	const popupOpenEventListeners: Array<PopupEventListener> = []
	const popupCloseEventListeners: Array<PopupEventListener> = []
	let popupCloseHandler: PopupEventListener = null
	let propagatePageScroll: PopupEventListener

	const onKeyDown = (e: Event) => {
		const keyboardEvent = e as KeyboardEvent
		if (keyboardEvent.key === 'Escape') {
			closePopupPage()
		}
	}

	const closePopupPage = async () => {
		const popupPageId = getCurrentPopupId() as string
		if (!popupPageId) {
			return
		}

		const { pendingPopupId } = featureState.get() || {}
		const isOpeningPopupFromWithinAnotherPopup = pendingPopupId && pendingPopupId !== popupPageId
		const currentPopupCloseHandler = popupCloseHandler

		const pageReflector = await pageProvider(popupPageId, popupPageId)
		const handlers = pageReflector.getAllImplementersOf<IPageWillUnmountHandler>(LifeCycle.PageWillUnmountHandler)
		await Promise.all(
			handlers.map((handler) => handler.pageWillUnmount({ pageId: popupPageId, contextId: popupPageId }))
		)

		removePopupFromDynamicStructure(popupPageId)
		currentPopupCloseHandler?.()
		popupCloseEventListeners.forEach((eventHandler) => eventHandler?.())

		if (isOpeningPopupFromWithinAnotherPopup) {
			return
			// prevent popup close handler from tempering site level state if we're still rendering a popup
		}

		disableCyclicTabbing()

		if (!isSSR(window)) {
			window.removeEventListener('keydown', onKeyDown)
		}
		const currentPopupId = currentPopup.isDuringReopen() ? getCurrentPopupId() : undefined

		featureState.update((state) => ({
			...state,
			pageWillLoadHandler: null,
			currentPopupId,
			pendingPopupId: undefined,
		}))
	}

	const getCurrentPopupId = () => {
		return featureState.get() ? featureState.get().currentPopupId : undefined
	}

	const isPopupOpened = () => !!getCurrentPopupId()

	const isPopupAlreadyOpen = (popupId: string): boolean => {
		if (currentPopup.isDuringReopen()) {
			return false
		}
		const state = featureState.get()
		return state?.currentPopupId === popupId || state?.pendingPopupId === popupId
	}

	const addPopupToDynamicStructure = (popupPageId: string) => {
		const wrapperId = structureAPI.getPageWrapperComponentId(popupPageId, popupPageId)
		return structureAPI.addComponentToDynamicStructure(
			'POPUPS_ROOT',
			{
				componentType: 'PopupRoot',
				components: [wrapperId],
				uiType: masterPageConfig.isResponsive ? 'Responsive' : 'Classic',
			},
			{
				[wrapperId]: {
					componentType: 'PageMountUnmount',
					components: [popupPageId],
				},
			}
		)
	}
	const removePopupFromDynamicStructure = (popupPageId: string) => {
		const wrapperId = structureAPI.getPageWrapperComponentId(popupPageId, popupPageId)
		structureAPI.removeComponentFromDynamicStructure(wrapperId)
		structureAPI.removeComponentFromDynamicStructure('POPUPS_ROOT')
	}

	const openPopup: IPopups['openPopupPage'] = async (popupPageId, closeHandler) => {
		if (isPopupAlreadyOpen(popupPageId)) {
			popupCloseHandler = popupCloseHandler || closeHandler
			return
		}
		featureState.update((state) => ({
			...state,
			pendingPopupId: popupPageId,
		}))
		enableCyclicTabbing()
		/*
		 custom signup popup is the only use-case where popup is opened before the underlying page navigation has ended.
		 Triggering start navigation from custom signup popup before the landing page was navigated to, messes with other flows that depend
		 on isFirstNavigation.
		 */
		const notLandingOnProtectedPage = !currentRouteInfo.isLandingOnProtectedPage()
		if (notLandingOnProtectedPage) {
			navigationManager.startNavigation()
			navigationManager.setShouldBlockRender(true)
		}
		await initPage({ pageId: popupPageId, contextId: popupPageId })
		popupCloseHandler = closeHandler
		if (popupOpenEventListeners.length > 0) {
			popupOpenEventListeners.forEach((eventHandler) => {
				if (eventHandler) {
					eventHandler(popupPageId)
				}
			})
		}
		if (!isSSR(window)) {
			window.addEventListener('keydown', onKeyDown)
		}
		notLandingOnProtectedPage && navigationManager.setShouldBlockRender(false)
		await addPopupToDynamicStructure(popupPageId)
		featureState.update((state) => ({
			...state,
			pageWillLoadHandler: closePopupPage,
			currentPopupId: popupPageId,
		}))
		notLandingOnProtectedPage && navigationManager.endNavigation()
	}

	return {
		isPopupPage(pageId) {
			return masterPageConfig.popupPages[pageId]
		},
		openPopupPage(popupPageId, closeHandler = null) {
			const pendingPopupPromise = featureState.get()?.pendingPopupPromise || Promise.resolve()
			const openPopupPromise = pendingPopupPromise.then(() => openPopup(popupPageId, closeHandler))
			featureState.update((state) => ({ ...state, pendingPopupPromise: openPopupPromise }))
			return openPopupPromise
		},
		closePopupPage,
		registerToPopupEvent(eventType: PopupEvent, eventHandler: PopupEventListener) {
			switch (eventType) {
				case 'popupScroll':
					propagatePageScroll = eventHandler
					const popupsRoot = window!.document.getElementById('POPUPS_ROOT')
					popupsRoot && popupsRoot.addEventListener('scroll', propagatePageScroll as EventListener)
					break
				case 'popupOpen':
					popupOpenEventListeners.push(eventHandler)
					break
				case 'popupClose':
					popupCloseEventListeners.push(eventHandler)
					break
				default:
					break
			}
		},
		getCurrentPopupId,
		isPopupOpened,
	}
}

export const Popups = withDependencies(
	[
		PageInitializerSymbol,
		BrowserWindowSymbol,
		named(FeatureStateSymbol, 'popups'),
		StructureAPI,
		named(MasterPageFeatureConfigSymbol, name),
		PageProviderSymbol,
		NavigationManagerSymbol,
		CurrentRouteInfoSymbol,
		CurrentPopupSymbol,
	],
	popupsFactory
)
