import { __rest } from "tslib";
import { REVEAL_SELECTORS } from './balataConsts';
const name = 'BackgroundReveal';
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
     * BackgroundReveal animation.
     */
    function animation(elements, duration, delay, _a = {}) {
        var { viewPortHeight = 1, browserFlags = {}, componentHeight = 1 } = _a, params = __rest(_a, ["viewPortHeight", "browserFlags", "componentHeight"]);
        const sequence = factory.sequence(params);
        let childrenToAnimate;
        if (browserFlags.animateRevealScrubAction) {
            // fixed layers on IE and Edge jitter while scrolling , we're animating the layers for steady reveal.
            elements.forEach((element) => {
                childrenToAnimate = REVEAL_SELECTORS.map((selector) => element.querySelector(selector)).filter(Boolean);
                sequence.add([
                    factory.animate('BasePosition', element, duration, delay, {
                        from: { y: viewPortHeight },
                        to: { y: -componentHeight },
                        force3D: true,
                        immediateRender: true,
                    }),
                    factory.animate('BasePosition', childrenToAnimate, duration, delay, {
                        from: { y: -viewPortHeight },
                        to: { y: componentHeight },
                        force3D: true,
                        immediateRender: true,
                    }),
                ]);
            });
        }
        else {
            // no animation , just force 3d layering
            elements.forEach((element) => {
                childrenToAnimate = REVEAL_SELECTORS.map((selector) => element.querySelector(selector)).filter(Boolean);
                sequence.add([
                    factory.animate('BaseNone', elements, 0, 0, {
                        transformStyle: 'preserve-3d',
                        force3D: true,
                    }),
                    factory.animate('BaseNone', childrenToAnimate, 0, 0, {
                        transformStyle: 'preserve-3d',
                        force3D: true,
                    }),
                ]);
            });
        }
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundReveal.js.map