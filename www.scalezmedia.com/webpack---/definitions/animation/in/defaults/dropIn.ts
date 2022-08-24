import { __rest } from "tslib";
const name = 'DropIn';
const properties = {
    hideOnStart: true,
    viewportThreshold: 0.15,
    groups: ['entrance', 'animation'],
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
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'hard',
        },
    },
};
const scaleMap = {
    soft: 1.2,
    medium: 3.6,
    hard: 6,
};
function register({ factory }) {
    /**
     * Drop in from
     */
    function animation(elements, duration, delay, _a = {}) {
        var { power = properties.schema.power.default } = _a, params = __rest(_a, ["power"]);
        const sequence = factory.sequence(params);
        const scale = scaleMap[power];
        sequence.add([
            factory.animate('BaseFade', elements, duration * 0.25, delay, {
                from: { opacity: 0 },
                to: { opacity: 1 },
                ease: 'Sine.easeIn',
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                from: { scale },
                ease: 'Sine.easeIn',
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=dropIn.js.map