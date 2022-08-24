import { __rest } from "tslib";
const name = 'Position';
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
                left: {
                    type: 'numberLike',
                },
                top: {
                    type: 'numberLike',
                },
                x: {
                    type: 'numberLike',
                },
                y: {
                    type: 'numberLike',
                },
                z: {
                    type: 'numberLike',
                },
                bezier: {
                    type: 'numberLike',
                },
            },
        },
        to: {
            type: 'object',
            properties: {
                left: {
                    type: 'numberLike',
                },
                top: {
                    type: 'numberLike',
                },
                x: {
                    type: 'numberLike',
                },
                y: {
                    type: 'numberLike',
                },
                z: {
                    type: 'numberLike',
                },
                bezier: {
                    type: 'string',
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Position animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { from = {}, to = {}, ease = 'Sine.easeIn' } = _a, params = __rest(_a, ["from", "to", "ease"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BasePosition', elements, duration, delay, {
            from,
            to,
            ease,
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=position.js.map