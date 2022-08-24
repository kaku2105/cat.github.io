import { SeoElement } from '../types'

export function setTagToDOM(element: SeoElement) {
	const { type, name, content } = element
	const existingElement = window.document.querySelector(`${type}[${name.key}="${name.value}"]`)
	existingElement?.setAttribute(content.key, content.value)
	if (!existingElement) {
		const canonicalElement = window.document.createElement(type)
		canonicalElement.setAttribute(name.key, name.value)
		canonicalElement.setAttribute(content.key, content.value)
		const head = window.document.querySelector('head')
		head?.appendChild(canonicalElement)
	}
}
