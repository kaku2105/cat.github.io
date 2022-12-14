import { __rest } from "tslib";
import { PARALLAX_SELECTORS } from './balataConsts';
const name = 'BackgroundParallax';
const properties = {
    hideOnStart: false,
    requestFullScreenHeight: true,
    shouldDisableSmoothScrolling: true,
    getMaxTravel(elementMeasure, viewportHeight) {
        return viewportHeight + elementMeasure.height;
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
        speedFactor: {
            type: 'number',
            default: 0.2,
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
            default: 1,
        },
        browserFlags: {
            type: 'object',
        },
        componentHeight: {
            type: 'number',
            min: 0,
            default: 1,
        },
    },
};
function register({ factory }) {
    /**
     * Move balata media elements vertically (from y:0)
     */
    function animation(elements, duration, delay, _a = {}) {
        var { speedFactor = properties.schema.speedFactor.default, viewPortHeight = properties.schema.viewPortHeight.default, browserFlags = {}, componentHeight = properties.schema.componentHeight.default } = _a, params = __rest(_a, ["speedFactor", "viewPortHeight", "browserFlags", "componentHeight"]);
        const sequence = factory.sequence(params);
        let childrenToAnimate;
        if (browserFlags.animateParallaxScrubAction) {
            // fixed layers on Edge Browser, jitter while scrolling , we're animating the layers for steady reveal.
            elements.forEach((element) => {
                childrenToAnimate = PARALLAX_SELECTORS.map((selector) => element.querySelector(selector)).filter(Boolean);
                sequence.add([
                    factory.animate('BasePosition', element, duration, delay, {
                        from: { y: viewPortHeight },
                        to: { y: -componentHeight },
                        force3D: true,
                        immediateRender: true,
                    }),
                    factory.animate('BasePosition', childrenToAnimate, duration, delay, {
                        from: { y: viewPortHeight * (speedFactor - 1) },
                        to: { y: componentHeight * (1 - speedFactor) },
                        force3D: true,
                        immediateRender: true,
                    }),
                ]);
            });
        }
        else {
            // animate single layer
            let cssParams = {};
            const { isSmoothScroll } = params;
            if (!isSmoothScroll) {
                if (browserFlags.preserve3DParallaxScrubAction) {
                    cssParams = { transformStyle: 'preserve-3d' };
                }
            }
            sequence.add(factory.animate('BaseNone', elements, 0, 0, cssParams));
            elements.forEach((element) => {
                childrenToAnimate = PARALLAX_SELECTORS.map((selector) => element.querySelector(selector)).filter(Boolean);
                if (isSmoothScroll) {
                    // prepare all layers for parallax effect as much as possible
                    childrenToAnimate.forEach((child) => {
                        child.style.transform = 'translate3d(0px, 0px, 0px)';
                        child.style.willChange = 'transform';
                    });
                }
                sequence.add(factory.animate('BasePosition', childrenToAnimate, duration, delay, {
                    from: { y: viewPortHeight * speedFactor },
                    to: { y: 0 - componentHeight * speedFactor },
                    ease: 'Linear.easeNone',
                    force3D: true,
                    immediateRender: true,
                }));
            });
        }
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundParallax.js.map