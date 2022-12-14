import { __rest } from "tslib";
const name = 'SpinIn';
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
        cycles: {
            type: 'number',
            step: 0.25,
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
        const transformRotate = (fromParams.direction > 0 ? '+=' : '-=') + 360 * cycles;
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, 0, 0, { to: { opacity: 0.01 } }));
        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {
                to: {
                    opacity: 1,
                },
                ease: 'Sine.easeIn',
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                from: { scale },
                ease: 'Sine.easeOut',
                immediateRender: false,
            }),
            factory.animate('BaseRotate', elements, duration, delay, {
                from: { rotation: transformRotate },
                ease: 'Sine.easeIn',
                immediateRender: false,
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=spinIn.js.map