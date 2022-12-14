const name = 'HeaderFadeOut';
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
    function animation(elements, duration, delay, params) {
        const sequence = factory.sequence(params);
        const animationParams = {
            ease: 'Quart.easeIn',
            to: { autoAlpha: 0 },
        };
        sequence.add(factory.animate('BaseFade', elements, duration, delay, animationParams));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=HeaderFadeOut.js.map