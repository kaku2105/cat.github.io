const name = 'FadeOut';
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
    },
};
function register({ factory }) {
    /**
     * FadeOut to opacity 0 animation object
     */
    function animation(elements, duration, delay, params) {
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            to: { autoAlpha: 0 },
            ease: 'Cubic.easeIn',
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=fadeOut.js.map