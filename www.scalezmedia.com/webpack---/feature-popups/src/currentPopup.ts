import { withDependencies } from '@wix/thunderbolt-ioc'
import type { ICurrentPopup } from './types'

export const CurrentPopup = withDependencies(
	[],
	(): ICurrentPopup => ({
		isDuringReopen: () => false,
	})
)
