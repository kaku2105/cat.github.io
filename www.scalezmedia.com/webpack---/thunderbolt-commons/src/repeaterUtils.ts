export const REPEATER_DELIMITER = '__'

export const getDisplayedId = (originalId: string, itemId: string): string =>
	`${originalId}${REPEATER_DELIMITER}${itemId}`

export const getFullId = (id: string): string => id.split(REPEATER_DELIMITER)[0]

export const getItemId = (id: string): string => id.split(REPEATER_DELIMITER)[1]

export const getFullItemId = (id: string): string => {
	const [_compId, ...itemIds] = id.split(REPEATER_DELIMITER) // eslint-disable-line @typescript-eslint/no-unused-vars
	return itemIds.join(REPEATER_DELIMITER)
}

export const getOuterItemId = (id: string): string => {
	const [_compId, _innerItemId, ...outerItemIds] = id.split(REPEATER_DELIMITER) // eslint-disable-line @typescript-eslint/no-unused-vars
	return outerItemIds.join(REPEATER_DELIMITER)
}

export const isDisplayedOnly = (id: string): boolean => getFullId(id) !== id

export const isRepeater = (compType: string): boolean => compType.split('.').pop() === 'Repeater'
