import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	IPlatformPropsSyncManager,
	IPropsStore,
	IRendererPropsExtender,
	IStructureStore,
	PlatformPropsSyncManagerSymbol,
	Props,
	Structure,
} from '@wix/thunderbolt-symbols'
import { getFullId } from '@wix/thunderbolt-commons'
import { GetCompBoundedUpdateProps, CompControllerUtilsFactory } from './types'

export const compControllerUtilsFactory = withDependencies(
	[Props, Structure, PlatformPropsSyncManagerSymbol],
	(
		propsStore: IPropsStore,
		structureStore: IStructureStore,
		platformPropsSyncManager: IPlatformPropsSyncManager
	): IRendererPropsExtender & CompControllerUtilsFactory => {
		const getCompBoundedUpdateProps: GetCompBoundedUpdateProps = (displayedId: string) => {
			const initialContextId = structureStore.getContextIdOfCompId(getFullId(displayedId))
			return (overrideProps) => {
				// Ignore invocations from handlers that were created on other pages
				const currentContextId = structureStore.getContextIdOfCompId(getFullId(displayedId))

				if (!structureStore.get(getFullId(displayedId)) || initialContextId !== currentContextId) {
					return
				}

				propsStore.update({ [displayedId]: overrideProps })
				platformPropsSyncManager.triggerPlatformPropsSync(displayedId, overrideProps)
			}
		}
		return {
			async extendRendererProps() {
				return {
					getCompBoundedUpdateProps,
				}
			},
			getCompBoundedUpdateProps,
		}
	}
)
