import { BrowserWindow } from '@wix/thunderbolt-symbols'

// we need to import from thunderbolt-commons src because of tree shaking issue that makes lodash to be undefined
// eslint-disable-next-line
import { isWindows } from '@wix/thunderbolt-commons/src/deprecatedBrowserUtils'

export const prefersReducedMotion = (
	browserWindow: BrowserWindow,
	requestUrl = '',
	isExperimentOpen: (experiment: string) => boolean
) => {
	const shouldDisableWindows =
		isWindows(browserWindow!) && !isExperimentOpen('specs.thunderbolt.allow_windows_reduced_motion')
	const shouldForce = requestUrl.toLowerCase().includes('forcereducedmotion')
	return (
		shouldForce ||
		(browserWindow && !shouldDisableWindows
			? browserWindow.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false)
	)
}
