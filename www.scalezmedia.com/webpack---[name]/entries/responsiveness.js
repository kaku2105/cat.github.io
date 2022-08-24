import sequence from '../utils/sequence';
import {
    doLog
} from '../actions/log';
import {
    onINP
} from 'web-vitals';


const RESPONSIVENESS = 'responsiveness';
const DOM_TREE_LIMIT = 20;

let isInfoCalled = false;
const {
    report,
    result
} = sequence(window, RESPONSIVENESS, RESPONSIVENESS);
window.addEventListener('info-called', () => isInfoCalled = true);


/**
 * @param {boolean} isLoggingEnabled
 */
export const startMeasureResponsiveness = (isLoggingEnabled) => {
    onINP(measureINP(isLoggingEnabled));

    return result;
};

/**
 * @param {boolean} isLogging
 * @returns {(metric: import('web-vitals').Metric) => void}
 */
export const measureINP = (isLogging) => {
    let inpEvents = 0;
    /**
     * @param {import('web-vitals').Metric} metric 
     * @returns {void}
     */
    return (metric) => {
        const {
            reportData,
            logData
        } = extractingResponsivenessEventDetails(metric.entries);

        const currentResponsivenessMeasure = {
            entryType: RESPONSIVENESS,
            worstLatency: metric.value,
            numOfResponsivenessEvents: ++inpEvents,
            ...reportData,
        };

        report(currentResponsivenessMeasure);

        const queryParams = new URLSearchParams(window.location.search);
        const isDebugQueryParamOn = queryParams.get('debug') === 'true';

        if (isLogging || isInfoCalled || isDebugQueryParamOn) {
            doLog({
                currentLatency: metric.value,
                ...currentResponsivenessMeasure,
                ...logData,
            });
        }

    };
};

/**
 * PerformanceObserver callback for responsiveness (type "event")
 * @param {PerformanceEntryList[]} eventEntries
 */
const extractingResponsivenessEventDetails = (eventEntries) => {
    const actions = eventEntries.map(entry => entry.name).join(',');
    const target = eventEntries.map(entry => entry.target).find(target => !!target);
    const elementType = target ? .nodeName.toLowerCase();

    const {
        allLatencies,
        allStartTimes
    } = eventEntries.reduce((res, entry) => {
        res.allLatencies.push(entry.duration);
        res.allStartTimes.push(entry.startTime);

        return res;
    }, {
        allLatencies: [],
        allStartTimes: []
    });

    const worstLatencyByEntry = Math.max(...allLatencies);
    const minStartTime = Math.min(...allStartTimes);

    const elementDetails = getElementDetails(target);

    return {
        reportData: {
            actions,
            elementType,
            worstLatencyByEntry,
            startTime: minStartTime,
            ...elementDetails
        },
        logData: {
            target,
        }
    };
};

/**
 * PerformanceObserver callback for responsiveness (type "event")
 * @param {HTMLElement} target
 * @returns {{compId: string, isAnchor: boolean, href: string, domTreeLimitReach: boolean }}
 */
const getElementDetails = (target) => {
    let href = '';
    let isAnchor = false;
    let compId = '';
    let currentNode = target;
    let domTreeClimbs = 0;

    while (domTreeClimbs < DOM_TREE_LIMIT && currentNode) {
        const elementType = currentNode.nodeName ? .toLowerCase();
        if (elementType === 'a') {
            isAnchor = true;
        }

        const nodeHref = currentNode.getAttribute && currentNode.getAttribute('href');
        if (nodeHref) {
            href = nodeHref;
        }

        const id = currentNode.id;
        if (id ? .startsWith('comp-')) {
            compId = id;
            break;
        }

        currentNode = currentNode.parentNode;
        domTreeClimbs++;
    }

    return {
        compId,
        isAnchor,
        href,
        domTreeLimitReach: domTreeClimbs >= DOM_TREE_LIMIT
    };
};