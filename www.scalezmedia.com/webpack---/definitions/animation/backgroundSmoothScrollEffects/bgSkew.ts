import { __rest } from "tslib";
import { getMaxSkewYBounds, getTravelMap, TRAVEL_TYPES, } from '../../../utils/animationsUtils';
const name = 'BgSkew';
const angle = 20;
const properties = {
    hideOnStart: false,
    getMediaDimensions(width, height) {
        return getMaxSkewYBounds(width, height, angle);
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
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight, componentTop, siteHeight, viewPortHeight } = _a, params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight"]);
        const sequence = factory.sequence(params);
        const { TOP_TO_BOTTOM, CENTER_TO_CENTER, BOTTOM_TO_TOP, isInFirstFold } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.normal);
        const animationParams = {
            out: {
                start: CENTER_TO_CENTER,
                end: BOTTOM_TO_TOP,
                skewY: -angle,
                ease: 'none',
            },
            // if in first fold skip the in animation, start with no skew
            in: isInFirstFold
                ? undefined
                : {
                    start: TOP_TO_BOTTOM,
                    end: CENTER_TO_CENTER,
                    skewY: angle,
                    ease: 'none',
                },
        };
        sequence.add([
            factory.animate('BaseBgSkew', elements, duration, delay, animationParams),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgSkew.js.map