import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgCloseUp';
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
        var { componentHeight, componentTop, siteHeight, viewPortHeight, perspectiveParent } = _a, params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight", "perspectiveParent"]);
        const sequence = factory.sequence(params);
        {
            // We split the animation login here: the zoom is treated as "out" animation...
            const { TOP_TO_BOTTOM, BOTTOM_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.out_first_fold);
            sequence.add([
                ...elements.map((element) => factory.animate('BaseBgZoom', element.children, duration, delay, {
                    viewPortHeight,
                    componentHeight,
                    perspectiveParent,
                    in: {
                        start: TOP_TO_BOTTOM,
                        end: BOTTOM_TO_TOP,
                        scale: 5,
                        ease: 'none',
                    },
                })),
            ]);
        }
        {
            // ...but the "fade" is not being manipulated and is treated as a "continuous" animation
            const { CENTER_TO_CENTER, BOTTOM_TO_TOP, withOffset, isInFirstFold } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.normal);
            sequence.add(factory.animate('BaseBgFade', elements, duration, delay, {
                out: {
                    start: withOffset(CENTER_TO_CENTER, isInFirstFold ? 0 : 5),
                    end: withOffset(BOTTOM_TO_TOP, isInFirstFold ? 0 : -5),
                    opacity: 0,
                    ease: 'none',
                },
            }), 0);
        }
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgCloseUp.js.map