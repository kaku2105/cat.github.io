import { __rest } from "tslib";
const name = 'HeaderFadeOutCustom';
const properties = {
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
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a) {
        var { ease = 'Quart.easeIn' } = _a, params = __rest(_a, ["ease"]);
        const sequence = factory.sequence(params);
        const animationParams = {
            ease,
            to: { autoAlpha: 0 },
        };
        sequence.add(factory.animate('BaseFade', elements, duration, delay, animationParams));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=HeaderFadeOutCustom.js.map