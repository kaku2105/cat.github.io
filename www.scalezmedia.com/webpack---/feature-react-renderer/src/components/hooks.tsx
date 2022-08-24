import Context from './AppContext'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CompEventSymbol, CompProps, PropsMap, StateRefsValuesMap, Store, ActionProps } from '@wix/thunderbolt-symbols'
import { CompController } from '@wix/thunderbolt-components-loader'
import { MaybeActionProps } from '../types'

const extractControllerLogic = (compController: CompController) => {
	// TODO: remove backward compatibility once https://jira.wixpress.com/browse/TB-4863 is resolved
	if (!compController) {
		return {}
	}

	// deprecated controller function
	if (typeof compController === 'function') {
		return {
			mapActionsToProps: compController,
		}
		// new controller hook
	} else if ('useComponentProps' in compController) {
		return {
			useComponentProps: compController.useComponentProps,
		}
	}

	// deprecated controller mappers
	return {
		mapActionsToProps: compController.mapActionsToProps,
		mapStateToProps: compController.mapStateToProps,
	}
}

const isVisibilityHidden = (compId: string): boolean => {
	const elem = document.getElementById(compId)
	return elem ? window.getComputedStyle(elem).visibility === 'hidden' : false
}

const getFunctionWithEventProps = (
	fnName: string,
	fn: Function & { [CompEventSymbol]?: boolean },
	displayedId: string
) => (...args: Array<any>) => {
	// overcome react bug where onMouseLeave is emitted if element becomes hidden while hovered
	// https://github.com/facebook/react/issues/22883
	if (fnName === 'onMouseLeave' && isVisibilityHidden(displayedId)) {
		return
	}

	return fn[CompEventSymbol] ? fn({ args, compId: displayedId }) : fn(...args)
}

const useFunctionProps = (displayedId: string, compProps: CompProps, stateProps: CompProps) => {
	const { current: functionPropsWeakMap } = useRef<WeakMap<Function, Function>>(new WeakMap<Function, Function>())

	const updateFunctionPropsWeakMap = useCallback(
		(
			propName: string,
			prop: Function,
			_stateProps: CompProps,
			_functionPropsWeakMap: WeakMap<Function, Function>
		) => {
			const functionWithEventProps = getFunctionWithEventProps(propName, prop, displayedId)
			const propFunctionIsOverridden = _stateProps?.[propName] && _stateProps?.[propName] !== prop
			const functionProp = propFunctionIsOverridden
				? (...args: Array<any>) => {
						_stateProps?.[propName]?.(...args)
						return functionWithEventProps(...args)
				  }
				: functionWithEventProps
			_functionPropsWeakMap.set(prop, functionProp)
		},
		[displayedId]
	)

	// update function props weak map on component props change (e.g. onClick)
	return Object.entries(compProps)
		.filter(([, prop]) => typeof prop === 'function')
		.reduce((acc, [propName, prop]) => {
			if (!functionPropsWeakMap.has(prop)) {
				updateFunctionPropsWeakMap(propName, prop, stateProps, functionPropsWeakMap)
			}
			acc[propName] = functionPropsWeakMap.get(prop) as Function
			return acc
		}, {} as ActionProps)
}

const useControllerHook = (displayedId: string, compType: string, compProps: CompProps, stateValues: CompProps) => {
	const { createCompControllerArgs, getCompBoundedUpdateProps, compControllers } = useContext(Context)
	const compController = compControllers[compType]
	// todo: remove mapActionsToProps, mapStateToProp when useComponentProps is used by all comps
	const { mapActionsToProps, mapStateToProps, useComponentProps } = extractControllerLogic(compController)

	const controllerActionsRef = useRef<MaybeActionProps>(undefined)

	if (!controllerActionsRef.current && mapActionsToProps) {
		controllerActionsRef.current = mapActionsToProps(createCompControllerArgs(displayedId, stateValues))
	} else if (!mapActionsToProps) {
		controllerActionsRef.current = undefined
	}

	const stateProps = useComponentProps?.(stateValues, compProps, {
		updateProps: getCompBoundedUpdateProps(displayedId),
	}) ?? {
		...compProps,
		...mapStateToProps?.(stateValues, compProps),
		...controllerActionsRef.current,
	}

	const functionProps = useFunctionProps(displayedId, compProps, stateProps)

	return { ...stateProps, ...controllerActionsRef.current, ...functionProps }
}

const getProps = (
	store: Store<PropsMap> | Store<StateRefsValuesMap>,
	isRepeatedComp: boolean,
	compId: string,
	displayedId: string
) => (isRepeatedComp ? { ...store.get(compId), ...store.get(displayedId) } : store.get(compId) ?? {})

export const useProps = (displayedId: string, compId: string, compType: string): CompProps => {
	const { props: propsStore, stateRefs: stateRefsStore } = useContext(Context)
	const isRepeatedComp = displayedId !== compId
	const compProps = getProps(propsStore, isRepeatedComp, compId, displayedId)
	const compStateRefValues = getProps(stateRefsStore, isRepeatedComp, compId, displayedId)

	return useControllerHook(displayedId, compType, compProps, compStateRefValues)
}

export const useStoresObserver = (id: string, displayedId: string): void => {
	const { structure: structureStore, props: propsStore, compsLifeCycle, stateRefs: stateRefsStore } = useContext(
		Context
	)

	const [, setTick] = useState(0)
	const forceUpdate = useCallback(() => setTick((tick) => tick + 1), [])

	const subscribeToStores = () => {
		compsLifeCycle.notifyCompDidMount(id, displayedId) // we call it when the id\displayed id changes although it's not mount
		const stores = [propsStore, structureStore, stateRefsStore]
		const unSubscribers: Array<() => void> = []
		stores.forEach((store) => {
			const unsubscribe = store.subscribeById(displayedId, forceUpdate)
			unSubscribers.push(unsubscribe)
			if (displayedId !== id) {
				forceUpdate() // sync repeated component props with stores props in case stores props were updated during first render
				unSubscribers.push(store.subscribeById(id, forceUpdate))
			}
		})

		return () => {
			unSubscribers.forEach((cb) => cb())
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(subscribeToStores, [id, displayedId])
}
