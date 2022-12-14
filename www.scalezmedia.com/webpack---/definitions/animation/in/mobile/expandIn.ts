import { __rest } from "tslib";
const name = 'ExpandIn';
const properties = {
    hideOnStart: true,
    mobile: true,
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
            default: 'soft',
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
     * Expand in from
     */
    function animation(elements, duration, delay, _a = {}) {
        var { power = properties.schema.power.default } = _a, params = __rest(_a, ["power"]);
        const sequence = factory.sequence(params);
        const scale = scaleMap[power];
        sequence.add(factory.animate('BaseFade', elements, 0, 0, { to: { opacity: 0.01 } }));
        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {
                to: {
                    opacity: 1,
                },
                ease: 'Circ.easeOut',
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                from: { scale },
                ease: 'Quad.easeOut',
                immediateRender: false,
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=expandIn.js.map