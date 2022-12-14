import { __rest } from "tslib";
import { getClipParams, getClipFallbackParams, getAdjustedDirection, getTransformTweenParams, } from '../../../../utils/animationsUtils';
const name = 'SlideIn';
const properties = {
    hideOnStart: true,
    mobile: true,
    viewportThreshold: 0.15,
    groups: ['mask', 'entrance', 'animation'],
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
            enum: ['top', 'right', 'bottom', 'left'],
            default: 'bottom',
        },
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'soft',
        },
    },
};
const paramsMap = {
    top: { dx: 0, dy: -1, idx: 0, clip: 'bottom' },
    right: { dx: 1, dy: 0, idx: 1, clip: 'left' },
    bottom: { dx: 0, dy: 1, idx: 2, clip: 'top' },
    left: { dx: -1, dy: 0, idx: 3, clip: 'right' },
};
const scaleMap = {
    soft: 70,
    medium: 35,
    hard: 0,
};
function register({ engine, factory }) {
    /**
     * SlideIn (Clip mask) animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default, power = properties.schema.power.default } = _a, params = __rest(_a, ["direction", "power"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration * 0.35, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Cubic.easeOut',
        }));
        elements.forEach((element) => {
            const compRect = engine.getBoundingRect(element);
            const contentRect = engine.getBoundingContentRect(element);
            const angle = Number(element.getAttribute('data-angle')) || 0;
            const angleInRad = (angle * Math.PI) / 180;
            const adjDirection = getAdjustedDirection(paramsMap, direction, angle);
            /**
             * Dec 30 2018: Fallback for IE / Edge which does not support clipPath. One day we could delete this
             * Reveal, Conceal, SlideIn and SlideOut do the same in fallback state
             */
            if (typeof element.style.clipPath === 'undefined') {
                const scale = getClipFallbackParams(adjDirection);
                const directionOverride = {
                    dx: paramsMap[adjDirection].dx / 2,
                    dy: paramsMap[adjDirection].dy / 2,
                };
                const position = getTransformTweenParams(contentRect, directionOverride, angleInRad);
                sequence.add([
                    factory.animate('BaseScale', element, duration, delay, {
                        from: scale,
                        ease: 'Cubic.easeInOut',
                    }),
                    factory.animate('BasePosition', element, duration, delay, {
                        from: position,
                        ease: 'Cubic.easeInOut',
                    }),
                ], 0);
            }
            else {
                const clip = getClipParams(compRect, contentRect, paramsMap[adjDirection].clip, { minimum: scaleMap[power] });
                const position = getTransformTweenParams(contentRect, paramsMap[adjDirection], angleInRad, (100 - scaleMap[power]) / 100);
                sequence.add([
                    factory.animate('BaseClipPath', element, duration, delay, {
                        from: clip,
                        ease: 'Cubic.easeOut',
                    }),
                    factory.animate('BasePosition', element, duration, delay, {
                        from: position,
                        ease: 'Cubic.easeOut',
                    }),
                ], 0);
            }
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=slideIn.js.map