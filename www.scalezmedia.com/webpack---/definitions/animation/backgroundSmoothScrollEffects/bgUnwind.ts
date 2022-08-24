import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgUnwind';
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
        clipParent: {
            type: 'element',
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { clipParent, componentHeight, componentTop, siteHeight, viewPortHeight } = _a, params = __rest(_a, ["clipParent", "componentHeight", "componentTop", "siteHeight", "viewPortHeight"]);
        const sequence = factory.sequence(params);
        const { TOP_TO_BOTTOM, TOP_TO_CENTER, CENTER_TO_CENTER, TOP_TO_TOP, withOffset, isInFirstFold, } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.in_last_fold);
        sequence.add([
            factory.animate('BaseBgFade', elements, duration, delay, {
                baseOpacity: 0.99,
                in: {
                    start: withOffset(TOP_TO_BOTTOM, 15),
                    end: TOP_TO_CENTER,
                    opacity: 0,
                    ease: 'sine.out',
                },
            }),
            // We are animating children because we need the "overflow:hidden" of the parent balata
            ...elements.map((element) => factory.animate('BaseBgRotate', element.children, duration, delay, {
                in: {
                    start: TOP_TO_BOTTOM,
                    end: Math.min(CENTER_TO_CENTER, TOP_TO_TOP),
                    rotation: 30 * (isInFirstFold ? 1 - componentTop / viewPortHeight : 1),
                    ease: 'sine.out',
                },
            })),
            ...elements.map((element) => factory.animate('BaseBgClipPath', element.children, duration, delay, {
                clipParent,
                in: {
                    start: TOP_TO_BOTTOM,
                    end: Math.min(CENTER_TO_CENTER, TOP_TO_TOP),
                    direction: 'center',
                    minimum: isInFirstFold
                        ? (1 - componentTop / viewPortHeight) * 100
                        : 0,
                    ease: 'none',
                },
            })),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgUnwind.js.map