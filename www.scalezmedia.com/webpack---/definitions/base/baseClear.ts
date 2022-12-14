import { __rest } from "tslib";
import { toArray } from '../../utils/generalUtils';
const name = 'BaseClear';
const properties = {};
const cssToRestore = [
    {
        domAttr: 'data-angle',
        gsapAttr: 'rotation',
        conditionAttr: 'data-angle-style-location',
        conditionValue: 'inline',
    },
    {
        domAttr: 'data-scale',
        gsapAttr: 'scale',
    },
];
function restoreCss(elements, sequence, engine) {
    Array.isArray(elements) &&
        elements.forEach((element) => {
            const restoreParams = {};
            const defaultParams = {
                duration: 0,
                delay: 0,
                immediateRender: false,
            };
            cssToRestore.forEach((item) => {
                const value = element.getAttribute(item.domAttr);
                const restoreCondition = item.conditionAttr && element.getAttribute(item.conditionAttr);
                const shouldRestore = !restoreCondition || restoreCondition === item.conditionValue;
                if (value && shouldRestore) {
                    restoreParams[item.gsapAttr] = value;
                }
            });
            if (Object.keys(restoreParams).length) {
                sequence.add(engine.tween(element, Object.assign(Object.assign({}, restoreParams), defaultParams), Object.keys(restoreParams)));
            }
        });
}
function clearGsTranforms(elements) {
    elements.forEach((element) => delete element._gsTransform);
}
function register({ engine, factory }) {
    /**
     * Clearing animation object
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { props = '', parentProps = '', to = {} } = _a, params = __rest(_a, ["props", "parentProps", "to"]);
        elements = toArray(elements);
        const parentsSet = new Set(elements.map((element) => element.parentNode));
        const parents = Array.from(parentsSet);
        const elementParams = Object.assign({ duration, delay, to, clearProps: props }, params);
        const parentParams = parentProps
            ? Object.assign(Object.assign({}, elementParams), { clearProps: parentProps }) : null;
        const sequence = factory.sequence({
            callbacks: {
                onComplete: () => clearGsTranforms(elements),
            },
        });
        sequence.add(engine.tween(elements, elementParams, []));
        if (parentParams) {
            sequence.add(engine.tween(parents, parentParams, []), 0);
        }
        restoreCss(elements, sequence, engine);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseClear.js.map