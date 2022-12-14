import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
const name = 'BaseBgSkew';
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
        baseSkewX: {
            type: 'number',
            default: 0,
        },
        baseSkewY: {
            type: 'number',
            default: 0,
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
                skewX: {
                    type: 'number',
                },
                skewY: {
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
                skewX: {
                    type: 'number',
                },
                skewY: {
                    type: 'number',
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Skew balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { baseSkewX = properties.schema.baseSkewX.default, baseSkewY = properties.schema.baseSkewY.default, in: { start: in_start = 0, end: in_end = 0, ease: in_ease = undefined, skewX: in_skewX = undefined, skewY: in_skewY = undefined, } = {}, out: { start: out_start = 0, end: out_end = 0, ease: out_ease = undefined, skewX: out_skewX = undefined, skewY: out_skewY = undefined, } = {} } = _a, params = __rest(_a, ["baseSkewX", "baseSkewY", "in", "out"]);
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
            if (typeof in_skewX !== 'undefined') {
                from.skewX = in_skewX;
                to.skewX = baseSkewX;
            }
            if (typeof in_skewY !== 'undefined') {
                from.skewY = in_skewY;
                to.skewY = baseSkewY;
            }
            const _duration = duration * Math.max(in_end - in_start, 0);
            const _delay = delay + duration * in_start;
            sequence.add(factory.animate('BaseSkew', elements, _duration, _delay, {
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
            if (typeof out_skewX !== 'undefined') {
                from.skewX = baseSkewX;
                to.skewX = out_skewX;
            }
            if (typeof out_skewY !== 'undefined') {
                from.skewY = baseSkewY;
                to.skewY = out_skewY;
            }
            const _duration = duration * Math.max(out_end - out_start, 0);
            const _delay = delay + duration * out_start;
            sequence.add(factory.animate('BaseSkew', elements, _duration, _delay, {
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
//# sourceMappingURL=baseBgSkew.js.map