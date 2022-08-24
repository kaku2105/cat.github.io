import { __rest } from "tslib";
const name = 'Fade';
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
                opacity: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                autoAlpha: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
            },
        },
        to: {
            type: 'object',
            properties: {
                opacity: {
                    type: 'number',
                    min: 0,
                    max: 1,
                },
                autoAlpha: {
                    type: 'number',
                    min: 0,
                    max: 1,
                    default: 1,
                },
            },
        },
    },
};
function register({ factory }) {
    /**
     * Fade animation object
     * Defaults to fade in to opacity 1 with Sine.easeIn
     */
    function animation(elements, duration, delay, _a = {}) {
        var { from = {}, to = {}, ease = 'Sine.easeIn' } = _a, params = __rest(_a, ["from", "to", "ease"]);
        const sequence = factory.sequence(params);
        if (typeof to.opacity === 'undefined' &&
            typeof to.autoAlpha === 'undefined') {
            to.autoAlpha = properties.schema.to.properties.autoAlpha.default;
        }
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from,
            to,
            ease,
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=fade.js.map