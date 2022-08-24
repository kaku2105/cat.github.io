import { __rest } from "tslib";
const name = 'Scale';
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
                scale: {
                    type: 'number',
                    min: 0,
                },
                scaleX: {
                    type: 'number',
                    min: 0,
                },
                scaleY: {
                    type: 'number',
                    min: 0,
                },
            },
        },
        to: {
            type: 'object',
            properties: {
                scale: {
                    type: 'number',
                    min: 0,
                },
                scaleX: {
                    type: 'number',
                    min: 0,
                },
                scaleY: {
                    type: 'number',
                    min: 0,
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Scale animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { from = {}, to = {}, ease = 'Sine.easeIn' } = _a, params = __rest(_a, ["from", "to", "ease"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseScale', elements, duration, delay, {
            from,
            to,
            ease,
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=scale.js.map