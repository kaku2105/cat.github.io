import { platformWorkerPromise } from 'thunderbolt-platform/src/client/create-worker'

type SSREvent = { name: string; startTime: number }

const { fleetConfig } = window.viewerModel

const searchParams = new URLSearchParams(window.location.search)

const LOCAL_PERFORMANCE_TOOL = searchParams.has('localPerformanceTool')
const LOCAL_PERFORMANCE_TOOL_PORT = searchParams.get('localPerformanceTool')
const TB_PERFORMANCE_TOOL_URL = LOCAL_PERFORMANCE_TOOL
	? `http://localhost:${LOCAL_PERFORMANCE_TOOL_PORT === '' ? '3000' : LOCAL_PERFORMANCE_TOOL_PORT}/`
	: 'https://apps.wix.com/tb-performance-tool'

const addOpenedMessageListenerToWindow = (
	openPerformanceToolWindow: Window | null,
	performanceEntries: Array<PerformanceEntry>
) => {
	window.addEventListener('message', (msg) => {
		if (msg.data === 'opened') {
			// @ts-ignore
			openPerformanceToolWindow!.postMessage(
				{
					type: 'performanceData',
					data: JSON.parse(JSON.stringify(performanceEntries)),
				},
				'*'
			)
		}
	})
}

if (fleetConfig.type === 'Canary' || window.location.search.includes('performanceTool=true')) {
	const longTasks: any = []
	const observer = new PerformanceObserver(function (list) {
		const perfEntries = list.getEntries()
		longTasks.push(...perfEntries)
	})
	observer.observe({ entryTypes: ['longtask'] })

	// @ts-ignore
	window.openPerformanceTool = async () => {
		const { ssrEvents: ssrEventsBody } = JSON.parse(document.getElementById('wix-warmup-data')?.textContent || '{}')
		const ssrEventsHead = JSON.parse(document.getElementById('wix-head-performance-data')?.textContent || '[]')
		const workerThread = await platformWorkerPromise
		const openPerformanceToolWindow = window.open(TB_PERFORMANCE_TOOL_URL, '_blank')
		const performanceEntries = window.performance.getEntries()
		const longTasksEntries = longTasks.map((task: any) => ({
			duration: task.duration,
			startTime: task.startTime,
			entryType: task.entryType,
			name: `long task: ${task.attribution[0].containerId}, ${task.attribution[0].containerName}, ${task.attribution[0].containerSrc}`,
		}))
		performanceEntries.push(...longTasksEntries)
		if (ssrEventsBody || ssrEventsHead) {
			const ssrEvents: Array<SSREvent> = [...ssrEventsHead, ...ssrEventsBody]
			const performanceTimeOrigin = window.performance.timeOrigin
			const getRealTime = (entryTime: number): number => {
				return entryTime - performanceTimeOrigin
			}
			performanceEntries.push(
				...ssrEvents.map((entry: SSREvent) =>
					JSON.parse(
						JSON.stringify({
							name: entry.name,
							entryType: 'SSR',
							startTime: getRealTime(entry.startTime),
							duration: 0,
						})
					)
				)
			)
		}
		if (workerThread) {
			workerThread.addEventListener('message', (event) => {
				if (event.data?.type === 'workerPerformanceData') {
					const workerPerf = event.data.data.performanceEntries
					const workerStartTime = event.data.data.workerStartTime
					const workerZeroBuffer = workerStartTime - window.performance.timeOrigin
					workerPerf.forEach((entry: any) => {
						entry.startTime = entry.startTime + workerZeroBuffer
						entry.worker = 'WORKER'
					})
					performanceEntries.push(...workerPerf)
					addOpenedMessageListenerToWindow(openPerformanceToolWindow, performanceEntries)
				}
			})
			workerThread.postMessage({ type: 'PerformanceTool' })
		} else {
			addOpenedMessageListenerToWindow(openPerformanceToolWindow, performanceEntries)
		}
	}
}
