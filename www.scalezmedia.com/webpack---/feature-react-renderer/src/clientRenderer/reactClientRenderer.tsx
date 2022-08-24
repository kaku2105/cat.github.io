import React from 'react'
import ReactDOM from 'react-dom'
import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import {
	IRenderer,
	BatchingStrategy,
	BatchingStrategySymbol,
	LayoutDoneServiceSymbol,
	ILayoutDoneService,
	ExperimentsSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { createPromise } from '@wix/thunderbolt-commons'
import { IRendererPropsProvider, RendererProps } from '../types'
import { RendererPropsProviderSym } from '../symbols'
import { MegaStoreWithSubscriptions, CatharsisMegaStoreSymbol } from '@wix/thunderbolt-catharsis'

const { resolver: appDidMountResolver, promise: waitForAppDidMount } = createPromise()
export const appDidMountPromise = waitForAppDidMount

export const ReactClientRenderer = withDependencies(
	[
		RendererPropsProviderSym,
		BatchingStrategySymbol,
		ExperimentsSymbol,
		optional(LayoutDoneServiceSymbol),
		optional(CatharsisMegaStoreSymbol),
	],
	(
		rendererProps: IRendererPropsProvider,
		batchingStrategy: BatchingStrategy,
		experiments: Experiments,
		layoutDoneService: ILayoutDoneService,
		catharsisMegaStore: MegaStoreWithSubscriptions
	): IRenderer<RendererProps, Promise<void>> => ({
		getRendererProps: rendererProps.getRendererProps,
		init: async () => {
			await rendererProps.resolveRendererProps()
		},
		render: async (target = document.getElementById('SITE_CONTAINER') as HTMLElement, rootCompId = 'main_MF') => {
			await window.reactAndReactDOMLoaded
			const App = require('../components/App').default // App creates a React Context on module state, so it has to be evaluated once React is defined.
			const { ComponentsCss } = require('../components/ComponentsCss') // ComponentsCss creates a React Context on module state, so it has to be evaluated once React is defined.
			const rendereProps = rendererProps.getRendererProps()
			const app = (
				<React.StrictMode>
					<React.Fragment>
						{experiments['specs.thunderbolt.new_responsive_layout_loggedIn'] ? (
							<ComponentsCss
								rootCompId={rootCompId}
								structureStore={rendereProps.structure}
								megaStore={catharsisMegaStore}
								batchingStrategy={batchingStrategy}
							/>
						) : null}
						<App
							{...rendereProps}
							batchingStrategy={batchingStrategy}
							onDidMount={appDidMountResolver}
							{...(layoutDoneService ? { layoutDoneService } : {})}
							rootCompId={rootCompId}
						/>
					</React.Fragment>
				</React.StrictMode>
			)
			if (target.firstChild) {
				experiments['specs.thunderbolt.react_experimental']
					? // @ts-ignore
					  ReactDOM.createRoot(target, { hydrate: true }).render(app)
					: ReactDOM.hydrate(app, target)
			} else {
				ReactDOM.render(app, target)
			}
			await waitForAppDidMount
		},
	})
)
