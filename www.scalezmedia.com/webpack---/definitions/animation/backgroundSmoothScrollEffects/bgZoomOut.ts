import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgZoomOut';
const scale = 1.15;
const properties = {
    hideOnStart: false,
    getMediaDimensions(width, height) {
        return { width: width * scale, height: height * scale };
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
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
        },
        perspectiveParent: {
            type: 'element',
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { perspectiveParent, componentHeight, componentTop, siteHeight, viewPortHeight } = _a, params = __rest(_a, ["perspectiveParent", "componentHeight", "componentTop", "siteHeight", "viewPortHeight"]);
        const sequence = factory.sequence(params);
        // We handle scale as out (and not "in" as originally was) and in first fold we start from scale 1 so we don't have a jump from ssr
        const { TOP_TO_BOTTOM, BOTTOM_TO_TOP, isInFirstFold } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.out_first_fold);
        sequence.add(factory.animate('BaseBgZoom', elements, duration, delay, {
            viewPortHeight,
            componentHeight,
            perspectiveParent,
            baseScale: 1 / scale,
            out: {
                start: TOP_TO_BOTTOM,
                end: BOTTOM_TO_TOP,
                scale: isInFirstFold ? 1 : 2 - 1 / scale,
                ease: 'sine.inOut',
            },
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgZoomOut.js.map