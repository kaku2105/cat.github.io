import { __rest } from "tslib";
const name = 'BaseBgPositionY';
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
        from: {
            type: 'number',
        },
        to: {
            type: 'number',
        },
        ease: {
            type: 'string',
        },
    },
};
function register({ factory }) {
    /**
     * Pan balata on the X axis media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { start, end, from, to, ease } = _a, params = __rest(_a, ["start", "end", "from", "to", "ease"]);
        const sequence = factory.sequence(params);
        // set sequence length to full duration
        sequence.add(factory.animate('BaseNone', elements, duration, delay), 0);
        // Place in animation on timeline
        if (end < start) {
            console.warn(`animations-kit: ${name}: end value ${end} should be larger than start value ${start}`);
        }
        const _duration = duration * Math.max(end - start, 0);
        const _delay = delay + duration * start;
        sequence.add(factory.animate('BasePosition', elements, _duration, _delay, {
            from: { y: from },
            to: { y: to },
            ease,
            force3D: true,
            immediateRender: true,
        }), 0);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseBgPositionY.js.map