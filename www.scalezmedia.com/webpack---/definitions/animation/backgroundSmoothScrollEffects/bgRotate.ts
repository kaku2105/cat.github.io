import { __rest } from "tslib";
import { getMaxRotateBounds, getTravelMap, TRAVEL_TYPES, } from '../../../utils/animationsUtils';
const name = 'BgRotate';
const angle = 22;
const properties = {
    hideOnStart: false,
    getMediaDimensions(width, height) {
        return getMaxRotateBounds(width, height, angle);
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
        const { TOP_TO_BOTTOM, TOP_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.in_last_fold);
        sequence.add([
            factory.animate('BaseBgRotate', elements, duration, delay, {
                in: {
                    start: TOP_TO_BOTTOM,
                    end: TOP_TO_TOP,
                    rotation: angle,
                    ease: 'sine.out',
                },
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgRotate.js.map