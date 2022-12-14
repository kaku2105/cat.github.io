import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
const name = 'BaseBgFade';
const properties = {
    hideOnStart: false,
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
        baseOpacity: {
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
                opacity: {
                    type: 'number',
                    min: 0,
                    max: 1,
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
                opacity: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Fade balata media element on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { baseOpacity = properties.schema.baseOpacity.default, in: { start: in_start = undefined, end: in_end = undefined, ease: in_ease = undefined, opacity: in_opacity = undefined, } = {}, out: { start: out_start = undefined, end: out_end = undefined, ease: out_ease = undefined, opacity: out_opacity = undefined, } = {} } = _a, params = __rest(_a, ["baseOpacity", "in", "out"]);
        const sequence = factory.sequence(params);
        const hasInAnimation = isNumber(in_start) && isNumber(in_end);
        const hasOutAnimation = isNumber(out_start) && isNumber(out_end);
        // set sequence length to full duration
        sequence.add(factory.animate('BaseNone', elements, duration, delay), 0);
        // Place in animation on timeline
        if (hasInAnimation) {
            if (in_end < in_start) {
                console.warn(`animations-kit: ${name}: "in" end value ${in_end} must be larger than "in" start value ${in_start}`);
            }
            const _duration = duration * Math.max(in_end - in_start, 0);
            const _delay = delay + duration * in_start;
            sequence.add(factory.animate('BaseFade', elements, _duration, _delay, {
                from: { opacity: in_opacity },
                to: { opacity: baseOpacity },
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
            sequence.add(factory.animate('BaseFade', elements, _duration, _delay, {
                from: { opacity: baseOpacity },
                to: { opacity: out_opacity },
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
//# sourceMappingURL=baseBgFade.js.map