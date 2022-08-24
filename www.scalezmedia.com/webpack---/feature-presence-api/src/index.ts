import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { PresenceApi } from './presenceApi'
import { PresencePageDidMountHandler } from './presencePageDidMountHandler'
import { PresenceApiSymbol } from './symbols'
import { IPresenceApi } from './types'
import { IPageDidMountHandler, LifeCycle } from '@wix/thunderbolt-symbols'

export const site: ContainerModuleLoader = (bind) => {
	bind<IPresenceApi>(PresenceApiSymbol).to(PresenceApi)
}

export const page: ContainerModuleLoader = (bind) => {
	bind<IPageDidMountHandler>(LifeCycle.PageDidMountHandler).to(PresencePageDidMountHandler)
}

export * from './symbols'
export * from './types'
