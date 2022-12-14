import { __rest } from "tslib";
import { getClipParams, getClipFallbackParams, getAdjustedDirection, getTransformTweenParams, } from '../../../utils/animationsUtils';
const name = 'Conceal';
const properties = {
    groups: ['mask', 'exit', 'animation'],
    schema: {
        duration: {
            type: 'number',
            min: 0,
            default: 0,
        },
        delay: {
            type: 'number',
            min: 0,
            default: 0,
        },
        direction: {
            type: 'string',
            enum: ['top', 'right', 'center', 'bottom', 'left'],
            default: 'left',
        },
    },
};
const paramsMap = {
    top: { dx: 0, dy: -1, idx: 0 },
    right: { dx: 1, dy: 0, idx: 1 },
    bottom: { dx: 0, dy: 1, idx: 2 },
    left: { dx: -1, dy: 0, idx: 3 },
};
function register({ engine, factory }) {
    /**
     * Reveal (Clip) animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration * 0.75, delay + duration * 0.25, { from: { opacity: 1 }, to: { autoAlpha: 0 }, ease: 'Cubic.easeInOut' })); // eslint-disable-line no-mixed-operators
        elements.forEach((element) => {
            const compRect = engine.getBoundingRect(element);
            const contentRect = engine.getBoundingContentRect(element);
            const elementAngleInDeg = Number(element.getAttribute('data-angle')) || 0;
            const elementAngleInRad = (elementAngleInDeg * Math.PI) / 180;
            const adjDirection = (direction !== 'center'
                ? getAdjustedDirection(paramsMap, direction, elementAngleInDeg)
                : direction);
            /**
             * Dec 30 2018: Fallback for IE / Edge which does not support clipPath. One day we could delete this
             * Reveal, Conceal, SlideIn and SlideOut do the same in fallback state
             */
            if (typeof element.style.clipPath === 'undefined') {
                const scale = getClipFallbackParams(adjDirection);
                const directionFix = paramsMap[adjDirection] || { dx: 0, dy: 0 }; // We have "center" only here
                const directionOverride = {
                    dx: directionFix.dx / 2,
                    dy: directionFix.dy / 2,
                };
                const position = getTransformTweenParams(contentRect, directionOverride, elementAngleInRad);
                sequence.add([
                    factory.animate('BaseScale', element, duration, delay, {
                        to: scale,
                        ease: 'Cubic.easeInOut',
                    }),
                    factory.animate('BasePosition', element, duration, delay, {
                        to: position,
                        ease: 'Cubic.easeInOut',
                    }),
                ], 0);
            }
            else {
                const to = getClipParams(compRect, contentRect, adjDirection);
                sequence.add(factory.animate('BaseClipPath', element, duration, delay, {
                    to,
                    ease: 'Cubic.easeInOut',
                }), 0);
            }
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=conceal.js.map