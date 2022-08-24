import { ServerPerformanceEvent } from '../types'

export const SSRPerformanceStore = (initialData: Array<ServerPerformanceEvent> = []) => {
	const eventData: Array<ServerPerformanceEvent> = initialData

	const addSSRPerformanceEvent = (name: string) => {
		eventData.push({ name: `${name} (server)`, startTime: Date.now() })
	}
	const getAllSSRPerformanceEvents = () => eventData

	return { addSSRPerformanceEvent, getAllSSRPerformanceEvents }
}

export type SSRPerformanceStoreType = {
	getAllSSRPerformanceEvents: () => Array<ServerPerformanceEvent>
	addSSRPerformanceEvent: (name: string) => void
}
