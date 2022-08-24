import { __rest } from "tslib";
const name = 'CollapseOut';
const properties = {
    groups: ['exit', 'animation'],
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
    soft: 0.85,
    medium: 0.4,
    hard: 0,
};
function register({ factory }) {
    /**
     * Collapse Out
     */
    function animation(elements, duration, delay, _a = {}) {
        var { power = properties.schema.power.default } = _a, params = __rest(_a, ["power"]);
        const sequence = factory.sequence(params);
        const scale = scaleMap[power];
        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {
                from: { opacity: 1 },
                to: { autoAlpha: 0 },
                ease: 'Cubic.easeOut',
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                to: { scale },
                ease: 'Sine.easeOut',
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=collapseOut.js.map