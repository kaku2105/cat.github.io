import { __rest } from "tslib";
const name = 'BounceOut';
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
        bounce: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'medium',
        },
        direction: {
            type: 'string',
            enum: ['top left', 'top right', 'center', 'bottom right', 'bottom left'],
            default: 'top left',
        },
    },
};
const transformOrigins = {
    'top left': '0 0',
    'top right': '100% 0',
    'bottom left': '0 100%',
    'bottom right': '100% 100%',
    center: '50% 50%',
};
const easeParams = {
    soft: [0.6],
    medium: [1],
    hard: [1.5],
};
function register({ factory }) {
    /**
     * BounceOut animation object, NOTE: doesn't bounce, only slides.
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default, bounce = properties.schema.bounce.default } = _a, params = __rest(_a, ["direction", "bounce"]);
        const transformOrigin = transformOrigins[direction];
        const fadeInDuration = 0.15;
        const sequence = factory.sequence(params);
        sequence
            .add(factory.animate('BaseNone', elements, 0, 0, { transformOrigin }), 0)
            .add(factory.animate('BaseScale', elements, duration, delay, {
            to: { scale: 0 },
            ease: 'Quint.easeIn',
            easeParams: easeParams[bounce],
        }), 0)
            .add(factory.animate('BaseFade', elements, fadeInDuration, delay, {
            to: { autoAlpha: 0 },
            ease: 'Sine.easeOut',
        }), `-=${fadeInDuration}`);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bounceOut.js.map