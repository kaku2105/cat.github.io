import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import {
	LifeCycle,
	HeadContentSymbol,
	RendererSymbol,
	BatchingStrategySymbol,
	ComponentsStylesOverridesSymbol,
	AppDidMountPromiseSymbol,
} from '@wix/thunderbolt-symbols'
import type { RendererProps, AppProps, ClientRenderResponse, IRendererPropsProvider } from './types'
import { HeadContent } from './HeadContent'
import { RendererPropsProvider } from './RendererPropsProvider'
import { ReactClientRenderer, appDidMountPromise } from './clientRenderer/reactClientRenderer'
import { PageMountUnmountSubscriber } from './clientRenderer/pageMountUnmountSubscriber'
import { ClientBatchingStrategy } from './components/batchingStrategy'
import { ComponentsStylesOverrides } from './ComponentsStylesOverrides'
import { PageTransitionsHandlerSymbol, RendererPropsProviderSym } from './symbols'
import { PageTransitionsHandler } from './pageTransitionsHandler'

export const site: ContainerModuleLoader = (bind) => {
	bind(AppDidMountPromiseSymbol).toConstantValue(appDidMountPromise)
	bind(RendererSymbol).to(ReactClientRenderer)
	bind(RendererPropsProviderSym).to(RendererPropsProvider)
	bind(BatchingStrategySymbol, LifeCycle.AppDidMountHandler).to(ClientBatchingStrategy)
	bind(HeadContentSymbol).to(HeadContent)
	bind(LifeCycle.AppWillLoadPageHandler).to(PageMountUnmountSubscriber)
	bind(ComponentsStylesOverridesSymbol).to(ComponentsStylesOverrides)
	bind(PageTransitionsHandlerSymbol, LifeCycle.AppWillLoadPageHandler).to(PageTransitionsHandler)
}

export { RendererProps, AppProps, ClientRenderResponse, RendererPropsProviderSym, IRendererPropsProvider }
