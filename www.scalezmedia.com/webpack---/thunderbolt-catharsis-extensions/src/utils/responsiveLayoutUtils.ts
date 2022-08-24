import type {
	BreakpointsData,
	Component,
	ClassVariant,
	HoverVariant,
	Structure,
	PresetVariant,
	SingleLayoutData,
	BreakpointRange,
	BaseDataItem,
} from '@wix/thunderbolt-becky-types'
import type { CompVariantsViewItem, MegaStore } from '@wix/thunderbolt-catharsis'
import type { MediaQueryToSelectorObj, ComponentCss, SelectorObj, CompIdTo } from '../types'
import { constants } from '@wix/thunderbolt-becky-root'

const { PINNED_LAYER_SUFFIX } = constants

export const isSingleLayoutData = (item: BaseDataItem): item is SingleLayoutData => item.type === 'SingleLayoutData'

const EMPTY_ARRAY = [] as const
export const getChildrenAndSlots = (comp: Component): Array<string> => [
	...(comp.components || EMPTY_ARRAY),
	...(comp.slots ? Object.values(comp.slots) : EMPTY_ARRAY),
]

const VARIANT_SELECTOR: Record<string, (variant: any) => string> = {
	Hover: (variant: HoverVariant) => `#${variant.componentId}:hover`,
	Class: (variant: ClassVariant) => `#${variant.componentId}.${variant.id}`,
	Preset: (variant: PresetVariant) => `.${variant.id}`,
	Mobile: () => '.device-mobile-optimized',
}

const getRegularIdSelector = (compId: string) => `#${compId}`
const getTemplateRepeaterIdSelector = (compId: string) => `[id^="${compId}__"]`
const addLayoutSelectorType = (
	compId: string,
	selector: string,
	layoutSelectorType: string = '',
	shouldOmitWrapperLayers: boolean = false
): string => {
	switch (layoutSelectorType) {
		case 'component-one-cell-grid':
			return `${selector}:not(.${compId}-container)`
		case 'component':
		case 'item':
			return selector
		default:
			if (shouldOmitWrapperLayers) {
				if (selector === getRegularIdSelector(compId)) {
					return `.${compId}-${layoutSelectorType}`
				}
			} else {
				return `${selector} .${compId}-${layoutSelectorType}`
			}
			return selector
	}
}

const getVariantSelector = (variantId: string, variants: CompVariantsViewItem) => {
	if (!variantId) {
		return ''
	}
	const variant = variants[variantId]
	return VARIANT_SELECTOR[variant.type](variant)
}

const responsiveLayoutDomSelector = (
	compId: string,
	idSelector: string,
	variantSelector: string,
	selector: string,
	shouldOmitWrapperLayers: boolean
) => {
	const hasVariant = variantSelector
	const sameComponentVariant = variantSelector && variantSelector.startsWith(idSelector)
	const compSelector = addLayoutSelectorType(
		compId,
		sameComponentVariant ? variantSelector : idSelector,
		selector,
		shouldOmitWrapperLayers
	)
	const domSelector = hasVariant && !sameComponentVariant ? `${variantSelector} ${compSelector}` : compSelector
	return domSelector
}

const pinnedLayerDomSelector = (idSelector: string) => `${idSelector}${PINNED_LAYER_SUFFIX}`

const variablesDomSelector = (idSelector: string, variantSelector: string) => {
	if (!variantSelector) {
		return idSelector
	}

	return variantSelector.startsWith(idSelector) ? variantSelector : `${variantSelector} ${idSelector}`
}

export const toMediaQuery = (item: BreakpointRange) => {
	const min = item.min ? ` and (min-width: ${item.min}px)` : ''
	const max = item.max ? ` and (max-width: ${item.max}px)` : ''
	return `@media screen${min}${max}`
}

const selectorObjToCss = (selectorObj: SelectorObj) =>
	Object.entries(selectorObj)
		.flatMap(
			([selector, css]) =>
				`${selector}{${Object.entries(css)
					.map(([key, value]) => `${key}:${value};`)
					.join('')}}`
		)
		.join('')

export const getComponentResponsiveLayoutCss = (
	compId: string,
	isInRepeater: boolean,
	compBreakpointsOrder: BreakpointsData | undefined,
	{ responsiveLayout, pinnedLayer, layoutVariants }: ComponentCss['responsiveLayout'],
	{ variables, variablesVariants }: ComponentCss['variables']
): MediaQueryToSelectorObj => {
	const idSelector = isInRepeater ? getTemplateRepeaterIdSelector(compId) : getRegularIdSelector(compId)

	return ['default' as const, ...(compBreakpointsOrder?.values || EMPTY_ARRAY)].reduce<MediaQueryToSelectorObj>(
		(acc, breakpointRangeItem) => {
			const breakpointId = breakpointRangeItem === 'default' ? 'default' : breakpointRangeItem.id
			const mediaQuery = breakpointRangeItem === 'default' ? 'default' : toMediaQuery(breakpointRangeItem)
			acc[mediaQuery] = acc[mediaQuery] || {}

			const responsiveLayoutInBreakpoint = responsiveLayout?.css[breakpointId]
			const pinnedLayerInBreakpoint = pinnedLayer?.[breakpointId]
			const variablesInBreakpoint = variables?.[breakpointId]

			for (const variantKey in responsiveLayoutInBreakpoint) {
				const variantSelector = layoutVariants ? getVariantSelector(variantKey, layoutVariants) : ''
				const selectorObj = responsiveLayoutInBreakpoint[variantKey]
				for (const selector in selectorObj) {
					const domSelector = responsiveLayoutDomSelector(
						compId,
						idSelector,
						variantSelector,
						selector,
						!!responsiveLayout?.shouldOmitWrapperLayers
					)
					acc[mediaQuery][domSelector] = acc[mediaQuery][domSelector] || {}
					Object.assign(acc[mediaQuery][domSelector], selectorObj[selector])
				}
			}

			for (const variantKey in pinnedLayerInBreakpoint) {
				const selectorObj = pinnedLayerInBreakpoint[variantKey]
				const domSelector = pinnedLayerDomSelector(idSelector)
				for (const selector in selectorObj) {
					acc[mediaQuery][domSelector] = selectorObj[selector]
				}
			}

			for (const variantKey in variablesInBreakpoint) {
				const variantSelector = variablesVariants ? getVariantSelector(variantKey, variablesVariants) : ''
				const cssObj = variablesInBreakpoint[variantKey]
				const domSelector = variablesDomSelector(idSelector, variantSelector)
				acc[mediaQuery][domSelector] = acc[domSelector] || {}
				Object.assign(acc[mediaQuery][domSelector], cssObj)
			}

			return acc
		},
		{}
	)
}

export const getComponentsResponsiveLayoutCss = (
	megaStore: MegaStore,
	structure: Structure,
	pageCompId: string
): CompIdTo<MediaQueryToSelectorObj> => {
	const cssStore = megaStore.getChildStore('componentCss')

	const traverseComponents = (
		comp: Component,
		isInRepeater: boolean,
		ancestorComponentBreakpointsOrder: BreakpointsData | undefined,
		acc: CompIdTo<MediaQueryToSelectorObj>
	) => {
		const compId = comp.id
		const {
			breakpointsOrder = ancestorComponentBreakpointsOrder,
			responsiveLayout,
			variables,
		} = cssStore.getById<ComponentCss>(compId)

		acc[compId] = getComponentResponsiveLayoutCss(
			compId,
			isInRepeater,
			breakpointsOrder,
			responsiveLayout,
			variables
		)

		getChildrenAndSlots(comp).forEach((childId) =>
			traverseComponents(
				structure[childId],
				isInRepeater || comp.type === 'RepeaterContainer',
				breakpointsOrder,
				acc
			)
		)
		return acc
	}

	return traverseComponents(structure[pageCompId], false, undefined, {})
}

export const stringifyMediaQueryToSelectorObj = (mediaQueryToSelectorObj: MediaQueryToSelectorObj) => {
	let css = ''
	for (const mediaQuery in mediaQueryToSelectorObj) {
		const selectorObj = mediaQueryToSelectorObj[mediaQuery]
		const cssString = selectorObjToCss(selectorObj)
		css += mediaQuery === 'default' ? cssString : `${mediaQuery}{${cssString}}`
	}
	return css
}
export const serializeToString = (mediaQueriesToSelectorObj: CompIdTo<MediaQueryToSelectorObj>) => {
	let css = ''
	for (const compId in mediaQueriesToSelectorObj) {
		const mediaQueriesToSelectorObjForComp = mediaQueriesToSelectorObj[compId]
		css += stringifyMediaQueryToSelectorObj(mediaQueriesToSelectorObjForComp)
	}
	return css
}
