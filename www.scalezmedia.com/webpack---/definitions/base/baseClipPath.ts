import { __rest } from "tslib";
import { getClipParams } from '../../utils/animationsUtils';
import { toArray } from '../../utils/generalUtils';
const name = 'BaseClipPath';
const properties = {};
function register({ engine, factory }) {
    /**
     * ClipPath Polygon base animation object, expect all passed elements to be of the same size
     * If no 'to' or 'from' defined each will default to a rectangle the size of the element content
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { to = {}, from = {}, useClipRect = false } = _a, params = __rest(_a, ["to", "from", "useClipRect"]);
        const sequence = factory.sequence();
        elements = toArray(elements);
        elements.forEach((element) => {
            const compRect = engine.getBoundingRect(element);
            const contentRect = engine.getBoundingContentRect(element);
            const initialClipPath = getClipParams(compRect, contentRect, 'initial', {
                useClipRect,
            });
            sequence.add(engine.tween(element, Object.assign({ duration,
                delay, to: Object.assign(Object.assign({}, initialClipPath), to), from: Object.assign(Object.assign({}, initialClipPath), from) }, params), ['clipPath', 'webkitClipPath', 'clip']), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseClipPath.js.map