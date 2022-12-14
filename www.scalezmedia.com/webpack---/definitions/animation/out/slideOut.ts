import { __rest } from "tslib";
import { getClipParams, getClipFallbackParams, getAdjustedDirection, getTransformTweenParams, } from '../../../utils/animationsUtils';
const name = 'SlideOut';
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
            enum: ['top', 'right', 'bottom', 'left'],
            default: 'left',
        },
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'hard',
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
     * SlideOut (Clip mask) animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default, power = properties.schema.power.default } = _a, params = __rest(_a, ["direction", "power"]);
        const fadeOutDelayInterval = 0.75;
        const fadeOutDelay = (delay || 0) + duration * fadeOutDelayInterval; // eslint-disable-line no-mixed-operators
        const fadeOutDuration = duration * (1 - fadeOutDelayInterval);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, fadeOutDuration, fadeOutDelay, {
            from: { opacity: 1 },
            to: { autoAlpha: 0 },
            ease: 'Cubic.easeInOut',
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
                const clip = getClipParams(compRect, contentRect, paramsMap[adjDirection].clip, { minimum: scaleMap[power] });
                const position = getTransformTweenParams(contentRect, paramsMap[adjDirection], angleInRad, (100 - scaleMap[power]) / 100);
                // the tween
                sequence.add([
                    factory.animate('BaseClipPath', element, duration, delay, {
                        to: clip,
                        ease: 'Cubic.easeInOut',
                    }),
                    factory.animate('BasePosition', element, duration, delay, {
                        to: position,
                        ease: 'Cubic.easeInOut',
                    }),
                ], 0);
            }
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=slideOut.js.map