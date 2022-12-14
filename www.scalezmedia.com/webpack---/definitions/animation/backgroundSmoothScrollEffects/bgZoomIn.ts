import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgZoomIn';
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
        perspectiveParent: {
            type: 'element',
        },
        componentHeight: {
            type: 'number',
            min: 0,
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
        },
        speedFactor: {
            type: 'number',
            default: 0.8,
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight, componentTop, siteHeight, viewPortHeight, speedFactor = properties.schema.speedFactor.default } = _a, params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight", "speedFactor"]);
        const sequence = factory.sequence(params);
        const { TOP_TO_BOTTOM, BOTTOM_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.out_first_fold);
        // tombigel, July 2020 TODO:
        // As long as we use fixed bgMedia element inside the animation we cant use balata as the perspective parent
        // We have to use the old element.children method here, and assume it is ok to animate all the media children
        // This animation should be simplified when (if) changing to the root to fixed and removing fixed from the media bg
        sequence.add([
            ...elements.map((element) => factory.animate('BaseBgParallaxY', element.children, duration, delay, {
                viewPortHeight,
                componentHeight,
                speedFactor,
                start: TOP_TO_BOTTOM,
                end: BOTTOM_TO_TOP,
                ease: 'none',
            })),
            ...elements.map((element) => factory.animate('BaseBgZoom', element.children, duration, delay, {
                viewPortHeight,
                componentHeight,
                perspectiveParent: element,
                speedFactor: 0,
                in: {
                    start: TOP_TO_BOTTOM,
                    end: BOTTOM_TO_TOP,
                    scale: 1.667,
                    ease: 'sine.in',
                },
            })),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgZoomIn.js.map