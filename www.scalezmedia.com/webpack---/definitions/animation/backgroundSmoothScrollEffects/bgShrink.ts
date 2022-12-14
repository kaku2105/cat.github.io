import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgShrink';
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
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight, componentTop, siteHeight, viewPortHeight } = _a, params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight"]);
        const sequence = factory.sequence(params);
        // We want to use 'out' logic for Shrink, we just want the animation to start sooner on the timeline
        // We can do it with 'isInFirstFold' and change the animation timeing.
        // We can instead pass a different travel function that conpensates half the component height like so:
        // (travel, {maxTravelHeight, extraOutDistance}) => Math.min(1, (extraOutDistance + travel - componentHeight / 2) / maxTravelHeight)
        // But I find it less readable
        const { TOP_TO_BOTTOM, TOP_TO_CENTER, CENTER_TO_BOTTOM, CENTER_TO_CENTER, isInFirstFold, } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.out_first_fold);
        sequence.add(factory.animate('BaseBgScale', elements, duration, delay, {
            out: {
                start: isInFirstFold ? TOP_TO_BOTTOM : CENTER_TO_BOTTOM,
                end: isInFirstFold ? TOP_TO_CENTER : CENTER_TO_CENTER,
                scaleX: 0.8,
                scaleY: 0.8,
                ease: 'sine.out',
            },
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgShrink.js.map