import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
const name = 'BaseBgRotate';
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
        baseRotation: {
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
                rotation: {
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
                },
                end: {
                    type: 'number',
                    min: 0,
                },
                ease: {
                    type: 'string',
                },
                rotation: {
                    type: 'number',
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Rotate balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { baseRotation = properties.schema.baseRotation.default, in: { start: in_start = undefined, end: in_end = undefined, ease: in_ease = undefined, rotation: in_rotation = undefined, } = {}, out: { start: out_start = undefined, end: out_end = undefined, ease: out_ease = undefined, rotation: out_rotation = undefined, } = {} } = _a, params = __rest(_a, ["baseRotation", "in", "out"]);
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
            sequence.add(factory.animate('BaseRotate', elements, _duration, _delay, {
                from: { rotation: in_rotation },
                to: { rotation: baseRotation },
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
            sequence.add(factory.animate('BaseRotate', elements, _duration, _delay, {
                from: { rotation: baseRotation },
                to: { rotation: out_rotation },
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
//# sourceMappingURL=baseBgRotate.js.map