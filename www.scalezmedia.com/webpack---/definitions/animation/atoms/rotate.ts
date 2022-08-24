import { __rest } from "tslib";
const name = 'Rotate';
const properties = {
    groups: ['animation'],
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
        from: {
            type: 'object',
            properties: {
                rotation: {
                    type: 'number',
                },
            },
        },
        to: {
            type: 'object',
            properties: {
                rotation: {
                    type: 'numberLike',
                    default: 360,
                },
                direction: {
                    type: 'string',
                    enum: ['cw', 'ccw', 'short'],
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Rotate animation object
     * Defaults to rotate 360 deg with Cubic.easeIn
     */
    function animation(elements, duration, delay, _a = {}) {
        var { from = {}, to = {}, ease = 'Sine.easeIn' } = _a, params = __rest(_a, ["from", "to", "ease"]);
        const sequence = factory.sequence(params);
        to.rotation =
            to.rotation || properties.schema.to.properties.rotation.default;
        sequence.add(factory.animate('BaseRotate', elements, duration, delay, {
            from,
            to,
            ease,
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=rotate.js.map