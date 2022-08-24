import { Queue } from './Queue'
import { toposort } from './toposort'
import {
	DataFragment,
	MaterializerFactory,
	Visitor,
	Node,
	Ref,
	RefProvider,
	InferSchema,
	Update,
	Schema,
	InvalidationList,
} from './types'
import {
	getByArray,
	setByArray,
	isObjectLike,
	get3d,
	set3d,
	DEPTH,
	fromStringPath,
	toStringPath,
	pathToStringPath,
	has3d,
} from './utils'

export * from './types'

const BIG_FACTOR = 32
const SMALL_FACTOR = 16

const traverse = (obj: any, visit: Visitor, queueFactor: number) => {
	const queue = new Queue<Node>(queueFactor)
	queue.enqueue({ path: [], val: obj })

	while (!queue.isEmpty()) {
		const next = queue.dequeue()
		if (!visit(next.val, next.path)) {
			const type = typeof next.val
			if (
				!next.val ||
				type === 'string' ||
				type === 'number' ||
				type === 'boolean' ||
				type === 'symbol' ||
				type === 'function'
			) {
				continue
			}
			if (Array.isArray(next.val)) {
				for (let i = 0; i < next.val.length; i++) {
					queue.enqueue({
						path: [...next.path, i],
						val: next.val[i],
					})
				}
			} else {
				const keys = Object.keys(next.val)
				for (const key of keys) {
					queue.enqueue({
						path: [...next.path, key],
						val: next.val[key],
					})
				}
			}
		}
	}
}

const isRef = (x: any): x is Ref<any> =>
	typeof x === 'object' && x !== null && x.hasOwnProperty('$type') && x.$type === 'ref'

const EMPTY_ARRAY: Array<Array<string>> = []
const EMPTY_SCHEMA = { schema: undefined, removed: EMPTY_ARRAY }

export const inferSchema: InferSchema = (dataFragment) => {
	if (isRef(dataFragment)) {
		return { schema: dataFragment, removed: EMPTY_ARRAY }
	}

	if (!isObjectLike(dataFragment)) {
		return EMPTY_SCHEMA
	}

	let schema: Schema | undefined
	const removed: Array<Array<string | number>> = []
	traverse(
		dataFragment,
		(value, path) => {
			if (typeof value === 'undefined') {
				removed.push(path)
				return true
			}
			if (isRef(value)) {
				schema = schema || {}
				setByArray(schema, path, value)
				return true
			}
		},
		SMALL_FACTOR
	)
	return { schema, removed }
}

export const createMaterializer: MaterializerFactory = ({ transform } = {}) => {
	const template: Record<string, Record<string, Record<string, any>>> = {}
	const materialized: Record<string, Record<string, Record<string, any>>> = {}
	const schemas: Record<string, Record<string, Record<string, Schema>>> = {}
	const pendingInvalidations = new Set<string>()
	const index: Map<string, Set<string>> = new Map()
	let firstRun = true

	const addRefToIndex = (ref: Ref<any>, ownRefPath: string) => {
		const refPath = pathToStringPath(ref.refPath)
		if (!index.has(refPath)) {
			index.set(refPath, new Set<string>())
		}
		index.get(refPath)!.add(ownRefPath)
	}

	const removeRefFromIndex = (ref: unknown, ownRefPath: string) => {
		if (isRef(ref)) {
			const refPath = pathToStringPath(ref.refPath)
			index.get(refPath)?.delete(ownRefPath)

			return true
		}
	}

	const addSchemaToIndex = (schema: Schema, ownRefPath: string) => {
		traverse(
			schema,
			(val) => {
				if (isRef(val)) {
					addRefToIndex(val, ownRefPath)
					return true
				}
			},
			SMALL_FACTOR
		)
	}

	const removeSchemaFromIndex = (schema: Schema, ownRefPath: string) => {
		traverse(schema, (val) => removeRefFromIndex(val, ownRefPath), SMALL_FACTOR)
	}

	const updateTemplate = (key1: string, key2: string, key3: string, newTemplate: DataFragment | undefined) => {
		pendingInvalidations.add(toStringPath(key1, key2, key3))

		if (typeof newTemplate === 'undefined') {
			delete template[key1]?.[key2]?.[key3]
			return
		}

		const oldTemplate = get3d(template, key1, key2, key3)

		const templateToSet =
			!isRef(newTemplate) && isObjectLike(oldTemplate) ? { ...oldTemplate, ...newTemplate } : newTemplate

		set3d(template, key1, key2, key3, templateToSet)
	}

	const mergeSchema = (
		key1: string,
		key2: string,
		key3: string,
		newSchema: DataFragment | undefined,
		removed: Array<Array<string | number>> = []
	) => {
		const baseStringPath = toStringPath(key1, key2, key3)

		const currSchema = get3d(schemas, key1, key2, key3)
		if (!newSchema || isRef(newSchema)) {
			set3d(schemas, key1, key2, key3, newSchema || undefined)
			removeSchemaFromIndex(currSchema, baseStringPath)

			if (newSchema) {
				// @ts-ignore TODO Argument of type 'DataFragment' is not assignable to parameter of type 'Ref<any>'.
				addRefToIndex(newSchema, baseStringPath)
			}
			return
		}

		if (!currSchema) {
			set3d(schemas, key1, key2, key3, newSchema)
			addSchemaToIndex(newSchema, baseStringPath)
			return
		}

		removed.forEach((pathToRemove) => {
			const oldSchema = getByArray(currSchema, pathToRemove)
			if (!oldSchema) {
				return
			}

			removeSchemaFromIndex(oldSchema, baseStringPath)
		})

		let schemaToWrite: Schema

		traverse(
			newSchema,
			(newRef, path) => {
				if (!isRef(newRef)) {
					return
				}

				const oldRef = currSchema && getByArray(currSchema, path)
				removeRefFromIndex(oldRef, baseStringPath)

				schemaToWrite = schemaToWrite || currSchema || {}
				setByArray(schemaToWrite, path, newRef)
				addRefToIndex(newRef, baseStringPath)
				return true
			},
			SMALL_FACTOR
		)

		if (schemaToWrite) {
			set3d(schemas, key1, key2, key3, schemaToWrite)
		}
	}

	const getAllInvalidations = (invalidations: Set<string>) => {
		const allInvalidations: Set<string> = new Set<string>()
		const queue = new Queue<Set<string>>(BIG_FACTOR)
		queue.enqueue(invalidations)
		while (!queue.isEmpty()) {
			const paths = queue.dequeue()
			paths.forEach((p) => {
				if (allInvalidations.has(p)) {
					return
				}

				allInvalidations.add(p)
				if (index.has(p)) {
					queue.enqueue(index.get(p)!)
				}
			})
		}
		return allInvalidations
	}

	const populate = (invalidations: Set<string>) => {
		const allInvalidations: Set<string> = firstRun ? new Set(invalidations) : getAllInvalidations(invalidations)
		const paths = toposort(allInvalidations, index).map(fromStringPath) as InvalidationList

		for (const path of paths) {
			const [key1, key2, key3] = path
			if (!template[key1]?.[key2]) {
				continue
			}

			const val = get3d(template, key1, key2, key3)

			if (!has3d(schemas, key1, key2, key3)) {
				set3d(materialized, key1, key2, key3, transform ? transform(val, path) : val)
				continue
			}
			const nodeSchema = get3d(schemas, key1, key2, key3)
			let newVal = {}
			traverse(
				val,
				(objValue, objPath) => {
					const schema = getByArray(nodeSchema, objPath)
					if (!schema) {
						setByArray(newVal, objPath, objValue)
						return true
					}
					if (schema.hasOwnProperty('$type')) {
						const resolved = getByArray(materialized, schema.refPath) ?? schema.defaultValue
						if (objPath.length > 0) {
							setByArray(newVal, objPath, resolved)
						} else {
							newVal = resolved
						}
						return true
					}
					if (Array.isArray(objValue)) {
						setByArray(newVal, objPath, [])
						return
					}
				},
				SMALL_FACTOR
			)
			set3d(materialized, key1, key2, key3, transform ? transform(newVal, path) : newVal)
		}

		firstRun = false
		return paths
	}

	const flush = () => {
		const recursiveInvalidations = populate(pendingInvalidations)

		pendingInvalidations.clear()

		return recursiveInvalidations
	}

	const updateWithoutFlush: Update<void> = (key1, key2, key3, data, { schema, removed } = inferSchema(data)) => {
		if (typeof key3 === 'undefined') {
			if (!template[key1]?.[key2]) {
				return
			}

			for (const existingKey in template[key1][key2]) {
				mergeSchema(key1, key2, existingKey, undefined, removed)
				updateTemplate(key1, key2, existingKey, undefined)
			}

			delete schemas[key1]?.[key2]
			delete template[key1]?.[key2]
			delete materialized[key1]?.[key2]

			return
		}

		mergeSchema(key1, key2, key3, schema, removed)
		updateTemplate(key1, key2, key3, data)
	}

	const visualize = (format: 'path' | 'value') => {
		const nodes = Object.entries(materialized).flatMap(([key1, key2Obj]) =>
			Object.entries(key2Obj).flatMap(([key2, key3Obj]) =>
				Object.entries(key3Obj).map(([key3, value]) => {
					const id: string = [key1, key2, key3].join('/')
					return { id, value }
				})
			)
		)

		type Edge = { to: { id: string; value: any }; label: string }
		const nodesEdges = nodes.reduce<{ [nodeId: string]: Array<Edge> }>((acc, node) => {
			const edges: Array<any> = []
			// @ts-expect-error
			const schema = get3d(schemas, ...node.id.split('/'))
			traverse(
				schema,
				(value, path) => {
					if (!isRef(value)) {
						return
					}
					const id = value.refPath.slice(0, 3).join('/')
					const [key1, key2, key3] = id.split('/')
					const edge = { to: { id, value: get3d(materialized, key1, key2, key3) }, label: path.join('/') }
					edges.push(edge)
				},
				SMALL_FACTOR
			)
			acc[node.id] = edges
			return acc
		}, {})

		// eslint-disable-next-line
			const hasIncomingEdges = Object.values(nodesEdges).flat().reduce<{[nodeId:string]: true}>((acc, edge) => {
				acc[edge.to.id] = true
				return acc
			}, {})

		return `hedietDbgVis.createGraph(${JSON.stringify(nodes)}, (i) => {
	const nodesEdges = ${JSON.stringify(nodesEdges)}
	const format = ${JSON.stringify(format)}
	const hasIncomingEdges = ${JSON.stringify(hasIncomingEdges)}
	return {
		id: i.id,
		label: format === 'path' ? i.id : JSON.stringify(i.value),
		color: hasIncomingEdges[i.id] ? 'lightblue' : 'cornflowerblue',
		edges: nodesEdges[i.id],
	}
})`
	}

	return {
		update(key1, key2, key3, data, schema) {
			updateWithoutFlush(key1, key2, key3, data, schema)
			return flush()
		},
		batch(batchFunction) {
			batchFunction(updateWithoutFlush)
			return flush()
		},
		get: (path: string | Array<string | number>) =>
			Array.isArray(path) ? getByArray(materialized, path) : getByArray(materialized, path.split('.')),
		visualize,
	}
}

export const createRef = <T>(refPath: Array<string>, defaultValue?: any): Ref<T> => {
	if (refPath.length < DEPTH) {
		throw new Error(`Unsupported ref path, must be ${DEPTH} or more levels deep`)
	}
	return { $type: 'ref', refPath, defaultValue }
}

export function getBoundRefProvider(pathToBind: Array<string>): RefProvider {
	return <T>(innerPath: Array<string>, defaultValue?: any): Ref<T> =>
		createRef<T>([...pathToBind, ...innerPath], defaultValue)
}
