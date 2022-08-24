const PATH_SEPARATOR = '🐒🧿🐌🍕🍅'

export const DEPTH = 3

export const isObjectLike = (item: unknown) => Array.isArray(item) || typeof item === 'object'

export const getByArray = (obj: any, path: Array<string | number>) => {
	let val = obj
	for (const pathPart of path) {
		val = val[pathPart]
		if (typeof val === 'undefined') {
			return undefined
		}
	}

	return val
}

export const getByString = (obj: any, path: string) => getByArray(obj, path.split(PATH_SEPARATOR))

export const setByArray = (obj: any, path: Array<string | number>, value: unknown) => {
	let val = obj
	let i = 0
	for (; i < path.length - 1; i++) {
		val[path[i]] = val[path[i]] || {}
		val = val[path[i]]
	}
	val[path[i]] = value
}

export const setByString = (obj: any, path: string, value: unknown) =>
	setByArray(obj, path.split(PATH_SEPARATOR), value)

export const hasByArray = (obj: any, pathArray: Array<string>) => {
	let val = obj
	for (const pathPart of pathArray) {
		if (val.hasOwnProperty(pathPart)) {
			val = val[pathPart]
		} else {
			return false
		}
	}

	return true
}

export const has3d = (object: Record<string, any>, key1: string, key2: string, key3: string) =>
	get3d(object, key1, key2, key3) !== undefined

export const get3d = (object: Record<string, any>, key1: string, key2: string, key3: string) =>
	object[key1]?.[key2]?.[key3]

export const set3d = (object: Record<string, any>, key1: string, key2: string, key3: string, value: any) => {
	object[key1] = object[key1] || {}
	object[key1][key2] = object[key1][key2] || {}
	object[key1][key2][key3] = value
}

export const pathToStringPath = ([key1, key2, key3]: Array<string>) => toStringPath(key1, key2, key3)

export const toStringPath = (key1: string, key2: string, key3: string) =>
	`${key1}${PATH_SEPARATOR}${key2}${PATH_SEPARATOR}${key3}`

export const fromStringPath = (path: string) => path.split(PATH_SEPARATOR)
