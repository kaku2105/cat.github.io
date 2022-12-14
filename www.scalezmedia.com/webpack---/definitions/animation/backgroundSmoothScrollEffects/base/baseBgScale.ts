import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
const name = 'BaseBgScale';
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
        baseScaleX: {
            type: 'number',
            default: 1,
        },
        baseScaleY: {
            type: 'number',
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
                scaleX: {
                    type: 'number',
                },
                scaleY: {
                    type: 'number',
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
                scaleX: {
                    type: 'number',
                },
                scaleY: {
                    type: 'number',
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Scale balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { baseScaleX = properties.schema.baseScaleX.default, baseScaleY = properties.schema.baseScaleY.default, in: { start: in_start = 0, end: in_end = 0, ease: in_ease = undefined, scaleX: in_scaleX = undefined, scaleY: in_scaleY = undefined, } = {}, out: { start: out_start = 0, end: out_end = 0, ease: out_ease = undefined, scaleX: out_scaleX = undefined, scaleY: out_scaleY = undefined, } = {} } = _a, params = __rest(_a, ["baseScaleX", "baseScaleY", "in", "out"]);
        const sequence = factory.sequence(params);
        const hasInAnimation = isNumber(in_start) && isNumber(in_end);
        const hasOutAnimation = isNumber(out_start) && isNumber(out_end);
        // set sequence length to full duration
        sequence.add(factory.animate('BaseNone', elements, duration, delay), 0);
        // Place in animation on timeline
        if (hasInAnimation) {
            const from = {};
            const to = {};
            if (in_end < in_start) {
                console.warn(`animations-kit: ${name}: "in" end value ${in_end} must be larger than "in" start value ${in_start}`);
            }
            if (typeof in_scaleX !== 'undefined') {
                from.scaleX = in_scaleX;
                to.scaleX = baseScaleX;
            }
            if (typeof in_scaleY !== 'undefined') {
                from.scaleY = in_scaleY;
                to.scaleY = baseScaleY;
            }
            const _duration = duration * Math.max(in_end - in_start, 0);
            const _delay = delay + duration * in_start;
            sequence.add(factory.animate('BaseScale', elements, _duration, _delay, {
                from,
                to,
                ease: in_ease,
                force3D: true,
                immediateRender: !hasOutAnimation || in_start < out_start,
            }), 0);
        }
        // place out animation on timeline
        if (hasOutAnimation) {
            const from = {};
            const to = {};
            if (out_end < out_start) {
                console.warn(`animations-kit: ${name}: "out" end value ${out_end} must be larger than "out" start value ${out_start}`);
            }
            if (typeof out_scaleX !== 'undefined') {
                from.scaleX = baseScaleX;
                to.scaleX = out_scaleX;
            }
            if (typeof out_scaleY !== 'undefined') {
                from.scaleY = baseScaleY;
                to.scaleY = out_scaleY;
            }
            const _duration = duration * Math.max(out_end - out_start, 0);
            const _delay = delay + duration * out_start;
            sequence.add(factory.animate('BaseScale', elements, _duration, _delay, {
                from,
                to,
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
//# sourceMappingURL=baseBgScale.js.map