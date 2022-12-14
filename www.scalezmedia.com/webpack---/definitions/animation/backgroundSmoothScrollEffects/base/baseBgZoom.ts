import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
/**
 * Calc Z by perspective an scale
 * Normalized to minimum of -999999px
 * https://stackoverflow.com/a/13505718


 */
const getZ = (scale, perspective) => (perspective * (scale - 1)) / (scale || 0.0001);
const name = 'BaseBgZoom';
const properties = {
    hideOnStart: false,
    getMaxTravel(elementMeasure, viewPortHeight) {
        return viewPortHeight + elementMeasure.height;
    },
    groups: ['animation', 'background'],
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
        perspectiveParent: {
            type: 'element',
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
        },
        componentHeight: {
            type: 'number',
            min: 0,
        },
        speedFactor: {
            type: 'number',
            default: 0,
        },
        baseScale: {
            type: 'number',
            min: 0,
            default: 1,
        },
        in: {
            type: 'object',
            properties: {
                start: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                end: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                ease: {
                    type: 'string',
                },
                scale: {
                    type: 'number',
                    min: 0,
                },
            },
        },
        out: {
            type: 'object',
            properties: {
                start: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                end: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                ease: {
                    type: 'string',
                },
                scale: {
                    type: 'number',
                    min: 0,
                },
            },
        },
    },
};
function register({ factory }) {
    const perspective = 100;
    /**
     * Rotate balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { speedFactor = properties.schema.speedFactor.default, baseScale = properties.schema.baseScale.default, perspectiveParent, componentHeight, viewPortHeight, in: { start: in_start = 0, end: in_end = 0, ease: in_ease = undefined, scale: in_scale = undefined, } = {}, out: { start: out_start = 0, end: out_end = 0, ease: out_ease = undefined, scale: out_scale = undefined, } = {} } = _a, params = __rest(_a, ["speedFactor", "baseScale", "perspectiveParent", "componentHeight", "viewPortHeight", "in", "out"]);
        if (!perspectiveParent) {
            console.warn(`animations-kit: ${name}: "perspectiveParent: element" is a mandatory parameter for this animation`);
        }
        const sequence = factory.sequence(params);
        const hasInAnimation = isNumber(in_start) && isNumber(in_end);
        const hasOutAnimation = isNumber(out_start) && isNumber(out_end);
        // set sequence length to full duration and adjust perspective origin to movement
        sequence.add(factory.animate('BasePosition', perspectiveParent, duration, delay, {
            from: {
                perspective,
                perspectiveOrigin: `50% ${componentHeight / 2 - viewPortHeight * speedFactor}px`,
            },
            to: {
                perspective,
                perspectiveOrigin: `50% ${componentHeight / 2 + componentHeight * speedFactor}px`,
            },
            ease: 'none',
            immediateRender: true,
        }), 0);
        // Place in animation on timeline
        if (hasInAnimation) {
            if (in_end < in_start) {
                console.warn(`animations-kit: ${name}: "in" end value ${in_end} must be larger than "in" start value ${in_start}`);
            }
            const _duration = duration * Math.max(in_end - in_start, 0);
            const _delay = delay + duration * in_start;
            sequence.add(factory.animate('BasePosition', elements, _duration, _delay, {
                from: { z: getZ(baseScale, perspective) },
                to: { z: getZ(in_scale, perspective) },
                ease: in_ease,
                force3D: true,
                immediateRender: !hasOutAnimation || in_start < out_start,
            }), 0);
        }
        // place out animation on timeline
        if (hasOutAnimation) {
            if (out_end < out_start) {
                console.warn(`animations-kit: ${name}: "out" end value ${out_end} must be larger than "out" start value ${out_start}`);
            }
            const _duration = duration * Math.max(out_end - out_start, 0);
            const _delay = delay + duration * out_start;
            sequence.add(factory.animate('BasePosition', elements, _duration, _delay, {
                from: { z: getZ(out_scale, perspective) },
                to: { z: getZ(baseScale, perspective) },
                ease: out_ease,
                force3D: true,
                immediateRender: !hasInAnimation || out_start < in_start,
            }), 0);
        }
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseBgZoom.js.map