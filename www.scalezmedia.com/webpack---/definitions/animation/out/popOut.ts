import { __rest } from "tslib";
const name = 'PopOut';
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
    soft: 0.8,
    medium: 2.4,
    hard: 4,
};
function register({ factory }) {
    /**
     * Pop Out to
     */
    function animation(elements, duration, delay, _a = {}) {
        var { power = properties.schema.power.default } = _a, params = __rest(_a, ["power"]);
        const sequence = factory.sequence(params);
        const scale = scaleMap[power];
        sequence.add([
            factory.animate('BaseFade', elements, duration * 0.75, delay + duration * 0.25, { from: { opacity: 1 }, to: { autoAlpha: 0 }, ease: 'Sine.easeOut' }),
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
//# sourceMappingURL=popOut.js.map