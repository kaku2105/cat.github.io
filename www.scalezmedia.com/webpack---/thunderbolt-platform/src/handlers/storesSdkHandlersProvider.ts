import { PlatformInitializerSym } from '../symbols'
import { PlatformInitializer, PlatformResetComps } from '../types'
import { withDependencies } from '@wix/thunderbolt-ioc'
import { ComponentsStylesOverridesSymbol, IComponentsStylesOverrides, PlatformResetCompsSymbol, PropsMap, SdkHandlersProvider, Props, IPropsStore, StoresSdkHandlers } from '@wix/thunderbolt-symbols'
import _ from 'lodash'

const getStyles = (overrideStyles: { [compId: string]: object }, componentsStylesOverrides: IComponentsStylesOverrides) =>
	_(overrideStyles)
		.mapValues((compStyles, compId) => ({ ...componentsStylesOverrides.getCompStyle(compId), ...compStyles }))
		.value()

export const storesSdkHandlersProvider = withDependencies(
	[PlatformInitializerSym, ComponentsStylesOverridesSymbol],
	(platformRunnerContext: PlatformInitializer, componentsStylesOverrides: IComponentsStylesOverrides): SdkHandlersProvider<StoresSdkHandlers> & StoresSdkHandlers => {
		const stores = {
			updateProps: (partialProps: PropsMap) => {
				platformRunnerContext.updateProps(partialProps)
			},
			updateStyles: (overrideStyles: { [compId: string]: object }) => {
				const styles = getStyles(overrideStyles, componentsStylesOverrides)
				platformRunnerContext.updateStyles(styles)
			},
		}
		return {
			stores,
			getSdkHandlers: () => ({
				stores,
			}),
		}
	}
)

export const dsStoresSdkHandlersProvider = withDependencies(
	[ComponentsStylesOverridesSymbol, PlatformResetCompsSymbol, Props],
	(componentsStylesOverrides: IComponentsStylesOverrides, resetCompsManager: PlatformResetComps, propsStore: IPropsStore): SdkHandlersProvider<StoresSdkHandlers> & StoresSdkHandlers => {
		const stores = {
			updateProps: (partialProps: PropsMap) => {
				resetCompsManager.setPropsToOverride(partialProps)
				propsStore.update(partialProps)
			},
			updateStyles: (overrideStyles: PropsMap) => {
				resetCompsManager.setStylesToOverride(overrideStyles)
				const styleData = getStyles(overrideStyles, componentsStylesOverrides)
				componentsStylesOverrides.set(styleData)
			},
		}
		return {
			stores,
			getSdkHandlers: () => ({
				stores,
			}),
		}
	}
)
