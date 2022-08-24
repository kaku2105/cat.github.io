import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	CompsLifeCycleSym,
	ICompsLifeCycle,
	IPageWillMountHandler,
	PageFeatureConfigSymbol,
} from '@wix/thunderbolt-symbols'
import type { Actions, GetScreenInInitCallback } from './types'
import { name, ScreenInInitCallbackSymbol, SCREEN_IN_CALLBACK } from './symbols'

const screenInInitFactory = (
	featureConfig: { compIdToActions: Actions },
	getScreenInInitCallback: GetScreenInInitCallback,
	compsLifeCycle: ICompsLifeCycle
): IPageWillMountHandler => {
	return {
		name: 'screenInInit',
		pageWillMount() {
			const initCallback = getScreenInInitCallback()

			if (!initCallback) {
				return
			}

			const compIds = Object.keys(featureConfig.compIdToActions || {})

			compsLifeCycle.registerToCompLifeCycle(compIds, SCREEN_IN_CALLBACK, initCallback)
		},
	}
}

export const ScreenInInit = withDependencies(
	[named(PageFeatureConfigSymbol, name), ScreenInInitCallbackSymbol, CompsLifeCycleSym],
	screenInInitFactory
)
