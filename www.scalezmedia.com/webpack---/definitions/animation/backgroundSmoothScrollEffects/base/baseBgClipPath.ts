import { __rest } from "tslib";
import { isNumber } from '../../../../utils/validationUtils';
import { getClipParams } from '../../../../utils/animationsUtils';
const name = 'BaseBgClipPath';
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
        clipParent: {
            type: 'element',
        },
        baseDirection: {
            type: 'string',
            enum: ['top', 'right', 'center', 'bottom', 'left', 'initial'],
            default: 'initial',
        },
        baseMinimum: {
            type: 'number',
            min: 0,
            max: 1,
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
                direction: {
                    type: 'string',
                    enum: ['top', 'right', 'center', 'bottom', 'left', 'initial'],
                },
                minimum: {
                    type: 'number',
                    min: 0,
                    max: 1,
                    default: 0,
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
                direction: {
                    type: 'string',
                    enum: ['top', 'right', 'center', 'bottom', 'left', 'initial'],
                },
                minimum: {
                    type: 'number',
                    min: 0,
                    max: 1,
                    default: 0,
                },
            },
        },
    },
};
function register({ factory, engine }, frame) {
    /**
     * Scale balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { baseDirection = properties.schema.baseDirection.default, baseMinimum = properties.schema.baseMinimum.default, clipParent, in: { start: in_start = undefined, end: in_end = undefined, ease: in_ease = undefined, direction: in_direction = undefined, minimum: in_minimum = properties.schema.in.properties.minimum.default, } = {}, out: { start: out_start = undefined, end: out_end = undefined, ease: out_ease = undefined, direction: out_direction = undefined, minimum: out_minimum = properties.schema.out.properties.minimum.default, } = {} } = _a, params = __rest(_a, ["baseDirection", "baseMinimum", "clipParent", "in", "out"]);
        if (!clipParent) {
            console.warn(`animations-kit: ${name}: "clipParent: element" is a mandatory parameter for this animation`);
        }
        const useClipRect = !!frame.chrome; // is Chromium based browser
        const sequence = factory.sequence(params);
        const hasInAnimation = isNumber(in_start) && isNumber(in_end);
        const hasOutAnimation = isNumber(out_start) && isNumber(out_end);
        const compRect = engine.getBoundingRect(clipParent);
        const baseClip = getClipParams(compRect, compRect, baseDirection, {
            minimum: baseMinimum,
            useClipRect,
        });
        // set sequence length to full duration
        sequence.add(factory.animate('BaseNone', elements, duration, delay), 0);
        // Place in animation on timeline
        if (hasInAnimation) {
            if (in_end < in_start) {
                console.warn(`animations-kit: ${name}: "in" end value ${in_end} must be larger than "in" start value ${in_start}`);
            }
            const _duration = duration * Math.max(in_end - in_start, 0);
            const _delay = delay + duration * in_start;
            const inClip = getClipParams(compRect, compRect, in_direction, {
                minimum: in_minimum,
                useClipRect,
            });
            sequence.add(factory.animate('BaseClipPath', elements, _duration, _delay, {
                from: inClip,
                to: baseClip,
                ease: in_ease,
                force3D: true,
                immediateRender: !hasOutAnimation || in_start < out_start,
                useClipRect,
            }), 0);
        }
        // place out animation on timeline
        if (hasOutAnimation) {
            if (out_end < out_start) {
                console.warn(`animations-kit: ${name}: "out" end value ${out_end} must be larger than "out" start value ${out_start}`);
            }
            const _duration = duration * Math.max(out_end - out_start, 0);
            const _delay = delay + duration * out_start;
            const outClip = getClipParams(compRect, compRect, out_direction, {
                minimum: out_minimum,
                useClipRect,
            });
            sequence.add(factory.animate('BaseClipPath', elements, _duration, _delay, {
                from: baseClip,
                to: outClip,
                ease: out_ease,
                force3D: true,
                immediateRender: !hasInAnimation || out_start < in_start,
                useClipRect,
            }), 0);
        }
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseBgClipPath.js.map