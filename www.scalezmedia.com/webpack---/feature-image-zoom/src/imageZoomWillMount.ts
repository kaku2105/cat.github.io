import { withDependencies } from '@wix/thunderbolt-ioc'
import type { ImageZoomAPI } from './types'
import { ImageZoomAPISymbol, NATIVE_GALLERIES_TYPES } from './symbols'
import { ComponentWillMount, ViewerComponent } from 'feature-components'

export const WPhotoWillMount = withDependencies(
	[ImageZoomAPISymbol],
	(zoomAPI: ImageZoomAPI): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: ['WPhoto'],
			componentWillMount(wPhotoComp) {
				zoomAPI.addWPhotoOnClick(wPhotoComp.id)
			},
		}
	}
)

export const NativeGalleriesWillMount = withDependencies(
	[ImageZoomAPISymbol],
	(zoomAPI: ImageZoomAPI): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: NATIVE_GALLERIES_TYPES,
			componentWillMount(gallery) {
				zoomAPI.addNativeGalleryOnClick(gallery.id)
			},
		}
	}
)
