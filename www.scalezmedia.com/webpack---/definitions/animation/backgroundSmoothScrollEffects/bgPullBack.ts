import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgPullBack';
const properties = {
    hideOnStart: false,
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
            default: 1,
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { perspectiveParent, componentHeight, componentTop, siteHeight, viewPortHeight } = _a, 
        // speedFactor = properties.schema.speedFactor.default,
        params = __rest(_a, ["perspectiveParent", "componentHeight", "componentTop", "siteHeight", "viewPortHeight"]);
        const sequence = factory.sequence(params);
        const { TOP_TO_BOTTOM, BOTTOM_TO_BOTTOM } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.in_last_fold);
        sequence.add([
            factory.animate('BaseBgZoom', elements, duration, delay, {
                viewPortHeight,
                componentHeight,
                perspectiveParent,
                speedFactor: 0,
                out: {
                    start: TOP_TO_BOTTOM,
                    end: BOTTOM_TO_BOTTOM,
                    scale: 2,
                    ease: 'none',
                },
            }),
            factory.animate('BaseBgPositionY', elements, duration, delay, {
                from: -componentHeight / 6,
                to: 0,
                start: TOP_TO_BOTTOM,
                end: BOTTOM_TO_BOTTOM,
                ease: 'none',
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgPullBack.js.map