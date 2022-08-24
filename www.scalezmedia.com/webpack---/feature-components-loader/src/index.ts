import {
	RendererPropsExtenderSym,
	WixCodeSdkHandlersProviderSym,
	PlatformPropsSyncManagerSymbol,
} from '@wix/thunderbolt-symbols'
import type {
	ComponentLibraries,
	ComponentsLoaderRegistry,
	ComponentLoaderFunction,
	ThunderboltHostAPI,
	CompController,
	CreateCompControllerArgs,
	CompControllersRegistry,
	ComponentsRegistry,
	UpdateCompProps,
	IComponentsRegistrar,
	IWrapComponent,
	CompControllerFn,
	CompControllerObjectWithCompProps,
	GetCompBoundedUpdateProps,
} from './types'
import {
	ComponentsLoaderSymbol,
	ComponentsRegistrarSymbol,
	ComponentWrapperSymbol,
	CompControllerUtilsFactorySymbol,
} from './symbols'
import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ComponentsLoaderInit } from './componentsLoaderInit'
import { ComponentsLoader } from './componentsLoader'
import type { IComponentsLoader } from './IComponentLoader'
import { controlledComponentFactory } from './updateControlledComponentProps'
import platformPropsSyncManager from './platformPropsSyncManager'
import { compControllerUtilsFactory } from './compControllerUtilsFactory'

// Public loader
export const site: ContainerModuleLoader = (bind) => {
	bind(RendererPropsExtenderSym).to(ComponentsLoaderInit)
	bind(ComponentsLoaderSymbol).to(ComponentsLoader)
	bind(RendererPropsExtenderSym).to(controlledComponentFactory)
	bind(WixCodeSdkHandlersProviderSym, PlatformPropsSyncManagerSymbol).to(platformPropsSyncManager)
	bind(RendererPropsExtenderSym, CompControllerUtilsFactorySymbol).to(compControllerUtilsFactory)
}

export const editor = site

// Public Symbols
export { ComponentsLoaderSymbol, ComponentsRegistrarSymbol, ComponentWrapperSymbol }

// Public Types
export type {
	IWrapComponent,
	IComponentsLoader,
	ComponentLibraries,
	IComponentsRegistrar,
	ComponentsLoaderRegistry,
	ComponentLoaderFunction,
	ThunderboltHostAPI,
	CompController,
	CreateCompControllerArgs,
	CompControllersRegistry,
	ComponentsRegistry,
	UpdateCompProps,
	CompControllerFn,
	CompControllerObjectWithCompProps,
	GetCompBoundedUpdateProps,
}
