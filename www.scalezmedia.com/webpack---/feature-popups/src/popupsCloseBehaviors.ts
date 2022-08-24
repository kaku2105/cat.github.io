import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { PageFeatureConfigSymbol, ICompEventsRegistrar, CompEventsRegistrarSym } from '@wix/thunderbolt-symbols'
import { name, PopupsSymbol } from './symbols'
import { IPopups } from '.'
import { ComponentWillMount, ViewerComponent } from 'feature-components'

export const closeIconButtonWillMount = withDependencies(
	[PopupsSymbol, CompEventsRegistrarSym],
	(popupApi: IPopups, compEventsRegistrar: ICompEventsRegistrar): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: ['PopupCloseIconButton'],
			componentWillMount(closeButton) {
				compEventsRegistrar.register(closeButton.id, 'onClick', popupApi.closePopupPage)
			},
		}
	}
)

export const closeButtonWillMount = withDependencies(
	[named(PageFeatureConfigSymbol, name), PopupsSymbol, CompEventsRegistrarSym],
	(
		{ closeSiteButtons },
		popupApi: IPopups,
		compEventsRegistrar: ICompEventsRegistrar
	): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: ['SiteButton'],
			componentWillMount(closeButton) {
				if (closeSiteButtons[closeButton.id]) {
					compEventsRegistrar.register(closeButton.id, 'onClick', popupApi.closePopupPage)
				}
			},
		}
	}
)

export const pageWillMount = withDependencies(
	[named(PageFeatureConfigSymbol, name), PopupsSymbol, CompEventsRegistrarSym],
	(
		{ popupsWithCloseOnOverlayClick },
		popupApi: IPopups,
		compEventsRegistrar: ICompEventsRegistrar
	): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: ['PopupPage', 'ResponsivePopupPage'],
			componentWillMount(page) {
				if (popupsWithCloseOnOverlayClick[page.id]) {
					compEventsRegistrar.register(page.id, 'onClick', popupApi.closePopupPage)
				}
			},
		}
	}
)
