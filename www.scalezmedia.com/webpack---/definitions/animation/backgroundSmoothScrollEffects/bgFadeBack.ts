import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgFadeBack';
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
        // As long as the animation start point is TOP_TO_TOP we don't need to manipulate the start point
        // So we can think of it as a 'normal' animation
        const { TOP_TO_TOP, CENTER_TO_TOP, BOTTOM_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.normal);
        sequence.add([
            factory.animate('BaseBgFade', elements, duration, delay, {
                out: {
                    start: TOP_TO_TOP,
                    end: BOTTOM_TO_TOP,
                    opacity: 0,
                    ease: 'none',
                },
            }),
            factory.animate('BaseBgScale', elements, duration, delay, {
                out: {
                    start: TOP_TO_TOP,
                    end: CENTER_TO_TOP,
                    scaleX: 0.7,
                    scaleY: 0.7,
                    ease: 'sine.out',
                },
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgFadeBack.js.map