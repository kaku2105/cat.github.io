import { __rest } from "tslib";
import { toArray } from '../../utils/generalUtils';
const name = 'BaseClip';
const properties = {};
function getClipRect(compRect, contentRect) {
    const top = contentRect.top - compRect.top;
    const left = contentRect.left - compRect.left;
    const right = contentRect.width + left;
    const bottom = contentRect.height + top;
    return `rect(${[top, right, bottom, left].join('px,')}px)`;
}
function register({ engine, factory }) {
    /**
     * Clip base animation object, expect all passed elements to be of the same size
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { to = {}, from = {} } = _a, params = __rest(_a, ["to", "from"]);
        elements = toArray(elements);
        const compRect = engine.getBoundingRect(elements[0]);
        const contentRect = engine.getBoundingContentRect(elements[0]);
        const initialRect = getClipRect(compRect, contentRect);
        if (!to.clip) {
            to.clip = initialRect;
        }
        if (!from.clip) {
            from.clip = initialRect;
        }
        return engine.tween(elements, Object.assign({ duration, delay, from, to }, params), [
            'clip',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseClip.js.map