import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
	getComponentResponsiveLayoutCss,
	ComponentCss,
	getChildrenAndSlots,
	stringifyMediaQueryToSelectorObj,
} from '@wix/thunderbolt-catharsis-extensions'
import { Component } from '@wix/thunderbolt-becky-types'
import _ from 'lodash'
import { ComponentCssContextValue, StructureComponentCssProps, ComponentsCssProps } from './ComponentsCss.types'
import { debounce } from './debounce'

const ComponentCssContext = React.createContext<ComponentCssContextValue>({} as ComponentCssContextValue)

const StructureComponentCss = React.memo(
	({ id, isInRepeater, ancestorComponentBreakpointsOrder }: StructureComponentCssProps) => {
		const { getByCompId, subscribeByCompId } = useContext<ComponentCssContextValue>(ComponentCssContext)

		const data = getByCompId(id)
		const { structure, breakpointsOrder = ancestorComponentBreakpointsOrder, responsiveLayout, variables } = data

		const [, setTick] = useState(0)
		const forceUpdate = useCallback(() => setTick((tick) => tick + 1), [])

		// eslint-disable-next-line react-hooks/exhaustive-deps
		useEffect(() => subscribeByCompId(id, forceUpdate), [])

		if (!structure) {
			return null
		}

		const currentComp = responsiveLayout ? (
			<style data-comp-id={id}>
				{stringifyMediaQueryToSelectorObj(
					getComponentResponsiveLayoutCss(id, isInRepeater, breakpointsOrder, responsiveLayout, variables)
				)}
			</style>
		) : null

		const children = getChildrenAndSlots(structure).map((childId) => (
			<StructureComponentCss
				key={childId}
				id={childId}
				isInRepeater={isInRepeater || structure.componentType === 'Repeater'}
				ancestorComponentBreakpointsOrder={breakpointsOrder}
			/>
		))
		return (
			<React.Fragment>
				{currentComp}
				{children}
			</React.Fragment>
		)
	},
	(prevProps, nextProps) => _.isEqual(prevProps, nextProps)
)

export const ComponentsCss = (props: ComponentsCssProps) => {
	const structureStore = props.megaStore.getChildStore('structure')
	const cssStore = props.megaStore.getChildStore('componentCss')

	const updateStore = (partialStore: any) => {
		for (const compId in partialStore) {
			structureStore.updateById(compId, partialStore[compId])
		}
	}
	updateStore(props.structureStore.getEntireStore())
	props.structureStore.subscribeToChanges(updateStore)

	const getByCompId = (compId: string) => ({
		structure: structureStore.getById<Component>(compId),
		...cssStore.getById<ComponentCss>(compId),
	})

	const stores = [structureStore, cssStore]

	const subscribeByCompId = (compId: string, callback: () => void) => {
		const debounced = debounce(() => props.batchingStrategy.batch(callback))
		const unsubscribes = stores.map((store) => store.subscribeById(compId, debounced))
		return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
	}

	const storesContextValue = { getByCompId, subscribeByCompId }

	return (
		<ComponentCssContext.Provider value={storesContextValue}>
			<StructureComponentCss id={props.rootCompId} isInRepeater={false} />
		</ComponentCssContext.Provider>
	)
}
