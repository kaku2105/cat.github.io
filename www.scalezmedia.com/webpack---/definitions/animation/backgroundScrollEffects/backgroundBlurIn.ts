import { __rest } from "tslib";
const name = 'BackgroundBlurIn';
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
        blur: {
            type: 'number',
            min: 0,
            default: 20,
        },
    },
};
function register({ engine, factory }) {
    /**
     * Move balata media elements vertically (from y:0)
     */
    function animation(elements, duration, delay, _a = {}) {
        var { blur = properties.schema.blur.default } = _a, params = __rest(_a, ["blur"]);
        const sequence = factory.sequence(params);
        // TweenMax on Firefox doesn't like the fact we try to tween WebkitFilter which is undefined in FF.
        const useWebkitFilter = typeof elements[0].style.webkitFilter !== 'undefined';
        elements.forEach((element) => {
            element.setAttribute('data-blur', '0');
            factory.animate('BaseNone', element, 0, 0, { force3D: true });
            sequence.add(factory.animate('BaseAttribute', element, duration, delay, {
                from: { attr: { 'data-blur': blur } },
                to: { attr: { 'data-blur': 0 } },
                ease: 'Circ.easeIn',
                immediateRender: true,
                callbacks: {
                    onUpdate() {
                        const animatedBlur = element.getAttribute('data-blur');
                        engine.tween(element, {
                            duration: 0,
                            delay: 0,
                            WebkitFilter: `blur(${animatedBlur}px)`,
                            filter: `blur(${animatedBlur}px)`,
                        }, useWebkitFilter ? ['WebkitFilter', 'filter'] : ['filter']);
                    },
                },
            }));
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundBlurIn.js.map