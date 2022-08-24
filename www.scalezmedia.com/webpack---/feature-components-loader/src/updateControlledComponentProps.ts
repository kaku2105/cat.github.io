import {
	IPropsStore,
	Props,
	BusinessLogger,
	BusinessLoggerSymbol,
	ReporterSymbol,
	IReporterApi,
	IPlatformPropsSyncManager,
	PlatformPropsSyncManagerSymbol,
	Structure,
	IStructureStore,
	StateRefsValues,
} from '@wix/thunderbolt-symbols'
import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import type { CreateCompControllerArgs, CompControllerUtilsFactory } from './types'
import _ from 'lodash'
import { CompControllerUtilsFactorySymbol } from './symbols'

export const controlledComponentFactory = withDependencies(
	[
		Props,
		Structure,
		PlatformPropsSyncManagerSymbol,
		CompControllerUtilsFactorySymbol,
		optional(BusinessLoggerSymbol),
		optional(ReporterSymbol),
	],
	(
		propsStore: IPropsStore,
		structureStore: IStructureStore,
		platformPropsSyncManager: IPlatformPropsSyncManager,
		compControllerUtilsFactory: CompControllerUtilsFactory,
		businessLogger: BusinessLogger,
		reporter?: IReporterApi
	) => {
		const createCompControllerArgs: CreateCompControllerArgs = (
			displayedId: string,
			stateRefs: StateRefsValues = {}
		) => {
			const stateRefsFunctions = _.pickBy(stateRefs, _.isFunction)
			const updateProps = compControllerUtilsFactory.getCompBoundedUpdateProps(displayedId)

			return {
				...(reporter && { trackEvent: reporter.trackEvent }),
				...stateRefsFunctions,
				// @ts-ignore
				reportBi: (params, ctx) => {
					// @ts-ignore
					return businessLogger.logger.log(params, ctx)
				},
				updateProps,
			}
		}

		return {
			extendRendererProps() {
				return {
					createCompControllerArgs,
				}
			},
		}
	}
)
