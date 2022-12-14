import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgFake3D';
const properties = {
    hideOnStart: false,
    requestFullScreenHeight: true,
    getMediaDimensions(width, height, screenHeight) {
        return { width, height: Math.max(height, screenHeight) };
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
            default: 0.9,
        },
        componentHeight: {
            type: 'number',
            min: 0,
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight, componentTop, siteHeight, viewPortHeight, speedFactor = properties.schema.speedFactor.default } = _a, // TODO: when bgScrub is removed, we can remove this, factor becomes a constant 1
        params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight", "speedFactor"]);
        const sequence = factory.sequence(params);
        const { TOP_TO_BOTTOM, BOTTOM_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.normal);
        sequence.add([
            factory.animate('BaseBgParallaxY', elements, duration, delay, {
                viewPortHeight,
                componentHeight,
                speedFactor,
                start: TOP_TO_BOTTOM,
                end: BOTTOM_TO_TOP,
                ease: 'sine.out',
            }),
            // See comment in bgZoomIn
            ...elements.map((element) => factory.animate('BaseBgZoom', element.children, duration, delay, {
                viewPortHeight,
                componentHeight,
                perspectiveParent: element,
                speedFactor,
                in: {
                    start: TOP_TO_BOTTOM,
                    end: BOTTOM_TO_TOP,
                    scale: 1.2,
                    ease: 'sine.in',
                },
            })),
            factory.animate('BaseBgScale', elements, duration, delay, {
                in: {
                    start: TOP_TO_BOTTOM,
                    end: BOTTOM_TO_TOP,
                    scaleY: 1.3,
                    ease: 'none',
                },
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgFake3D.js.map