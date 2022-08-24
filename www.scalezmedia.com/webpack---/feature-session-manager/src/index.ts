import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { SessionManagerSymbol, name } from './symbols'
import { SessionManager as ClientSessionManager } from './clientSessionManager'
import { SessionManager as ServerSessionManager } from './serverSessionManager'
import { PlatformEvnDataProviderSymbol, WixCodeSdkHandlersProviderSym } from '@wix/thunderbolt-symbols'
import { sessionEnvDataProvider } from './sessionEnvDataProvider'

export const site: ContainerModuleLoader = (bind) => {
	if (process.env.browser) {
		bind(SessionManagerSymbol, WixCodeSdkHandlersProviderSym).to(ClientSessionManager)
	} else {
		bind(SessionManagerSymbol).to(ServerSessionManager)
	}
	bind(PlatformEvnDataProviderSymbol).to(sessionEnvDataProvider)
}

export type { ISessionManager, SessionHandlers, Instance } from './types'

export { SessionManagerSymbol, sessionEnvDataProvider, name }
