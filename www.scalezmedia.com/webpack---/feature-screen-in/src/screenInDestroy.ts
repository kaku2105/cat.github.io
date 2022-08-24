import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	CompsLifeCycleSym,
	FeatureStateSymbol,
	ICompsLifeCycle,
	IPageWillUnmountHandler,
	PageFeatureConfigSymbol,
	ReducedMotionSymbol,
} from '@wix/thunderbolt-symbols'
import type { Actions, ScreenInFeatureState } from './types'
import { name, SCREEN_IN_CALLBACK } from './symbols'
import { IFeatureState } from 'thunderbolt-feature-state'

const screenInDestroyFactory = (
	featureConfig: { compIdToActions: Actions },
	featureState: IFeatureState<ScreenInFeatureState>,
	compsLifeCycle: ICompsLifeCycle,
	reducedMotion: boolean
): IPageWillUnmountHandler => {
	return {
		pageWillUnmount() {
			if (!reducedMotion) {
				const compIds = Object.keys(featureConfig.compIdToActions || {})

				compsLifeCycle.unregisterToCompLifeCycle(compIds, SCREEN_IN_CALLBACK)
			}
		},
	}
}

export const ScreenInDestroy = withDependencies(
	[named(PageFeatureConfigSymbol, name), named(FeatureStateSymbol, name), CompsLifeCycleSym, ReducedMotionSymbol],
	screenInDestroyFactory
)
