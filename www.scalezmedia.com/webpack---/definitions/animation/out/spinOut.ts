import { __rest } from "tslib";
const name = 'SpinOut';
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
        cycles: {
            type: 'number',
            min: 0,
            default: 5,
        },
        direction: {
            type: 'string',
            enum: ['cw', 'ccw'],
            default: 'cw',
        },
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'hard',
        },
    },
};
const paramsMap = {
    cw: { direction: -1 },
    ccw: { direction: 1 },
};
const scaleMap = {
    soft: 0.8,
    medium: 0.5,
    hard: 0,
};
function register({ factory }) {
    /**
     * SpinIn animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default, cycles = properties.schema.cycles.default, power = properties.schema.power.default } = _a, params = __rest(_a, ["direction", "cycles", "power"]);
        const scale = scaleMap[power];
        const fromParams = paramsMap[direction];
        const transformRotate = (fromParams.direction > 0 ? '+=' : '-=') + 360 * cycles; // eslint-disable-line no-mixed-operators
        const sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {
                from: { opacity: 1 },
                to: { autoAlpha: 0 },
                ease: 'Sine.easeIn',
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                to: { scale },
                ease: 'Sine.easeIn',
            }),
            factory.animate('BaseRotate', elements, duration, delay, {
                to: { rotation: transformRotate },
                ease: 'Sine.easeOut',
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=spinOut.js.map