import { __rest } from "tslib";
import { ZOOM_SELECTORS } from './balataConsts';
const name = 'BackgroundZoom';
const properties = {
    hideOnStart: false,
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
        componentHeight: {
            type: 'number',
            min: 0,
            default: 1,
        },
        viewPortHeight: {
            type: 'number',
            default: 1,
        },
        speedFactor: {
            type: 'number',
            default: -0.8,
        },
    },
};
function register({ factory }) {
    /**
     * Move balata media elements vertically and zoom(from y:0)
     */
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight = properties.schema.componentHeight.default, viewPortHeight = properties.schema.viewPortHeight.default, speedFactor = properties.schema.speedFactor.default } = _a, params = __rest(_a, ["componentHeight", "viewPortHeight", "speedFactor"]);
        const sequence = factory.sequence(params);
        elements.forEach((element) => {
            const childrenToZoom = ZOOM_SELECTORS.map((selector) => element.querySelector(selector)).filter(Boolean);
            const animateCallbacks = [
                factory.animate('BasePosition', childrenToZoom, duration, delay, {
                    force3D: true,
                    from: { z: 0 },
                    to: { z: 40 },
                    ease: 'Sine.easeIn',
                    immediateRender: true,
                }),
            ];
            if (params.isSmoothScroll) {
                animateCallbacks.unshift(factory.animate('BasePosition', element, duration, delay, {
                    from: {
                        perspectiveOrigin: `50% ${componentHeight / 2 + viewPortHeight * speedFactor}px`,
                    },
                    to: {
                        perspectiveOrigin: `50% ${componentHeight / 2 - componentHeight * speedFactor}px`,
                    },
                    ease: 'Linear.easeNone',
                    immediateRender: true,
                }));
            }
            sequence.add([
                factory.animate('BasePosition', element, 0, delay, {
                    perspective: 100,
                    force3D: true,
                    immediateRender: true,
                }),
                ...animateCallbacks,
            ]);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundZoom.js.map