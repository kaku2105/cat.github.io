const name = 'BackgroundFadeIn';
const properties = {
    hideOnStart: false,
    getMaxTravel(elementMeasure, viewportHeight, siteHeight) {
        return Math.min(siteHeight - elementMeasure.top, (viewportHeight + elementMeasure.height) / 2, viewportHeight * 0.9);
    },
    groups: ['animation', 'background'],
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
     * Move balata media elements vertically (from y:0)
     */
    function animation(elements, duration, delay, params = {}) {
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Circ.easeIn',
            force3D: true,
            immediateRender: true,
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundFadeIn.js.map