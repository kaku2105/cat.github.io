import { __rest } from "tslib";
const name = 'TimelineAnimation';
const properties = {
    groups: ['animation', 'timeline'],
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
        ease: {
            type: 'string',
            default: 'Sine.easeIn',
        },
        to: {
            type: 'object',
            properties: {
                x: {
                    type: 'numberLike',
                },
                y: {
                    type: 'numberLike',
                },
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
                rotation: {
                    type: 'numberLike',
                },
                direction: {
                    type: 'string',
                    enum: ['cw', 'ccw', 'short'],
                },
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
    },
};
/**
 * Like lodash pick.


 */
const pick = (obj, keys) => Object.fromEntries(keys
    .map((key) => [key, obj[key]])
    .filter(([, value]) => typeof value !== 'undefined'));
const definitions = {
    BasePosition: ['x', 'y'],
    BaseScale: ['scale', 'scaleX', 'scaleY'],
    BaseRotate: ['rotation', 'direction'],
    BaseFade: ['opacity', 'autoAlpha'],
};
function getFilteredParams(params) {
    return Object.entries(definitions)
        .map(([animationName, keys]) => {
        const animationParams = pick(params, keys);
        if (Object.keys(animationParams).length) {
            return [animationName, animationParams];
        }
        return null;
    })
        .filter((value) => value);
}
function register({ factory }) {
    /**
     * Timeline animation object
     * supports position, rotate, fade and scale params
     */
    function animation(elements, duration, delay, _a = {}) {
        var { to = {}, ease = properties.schema.ease.default } = _a, params = __rest(_a, ["to", "ease"]);
        const sequence = factory.sequence(params);
        const animations = getFilteredParams(to).map(([animationName, animationParams]) => factory.animate(animationName, elements, duration, delay, {
            to: animationParams,
            ease,
        }));
        sequence.add(animations);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=timelineAnimation.js.map