import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgExpand';
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
        const { TOP_TO_BOTTOM, CENTER_TO_CENTER, withOffset } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.in_last_fold);
        sequence.add([
            factory.animate('BaseBgScale', elements, duration, delay, {
                in: {
                    start: TOP_TO_BOTTOM,
                    end: withOffset(CENTER_TO_CENTER, 5),
                    scaleX: 0.8,
                    scaleY: 0.8,
                    ease: 'sine.out',
                },
            }),
            ...elements.map((element) => factory.animate('BaseBgClipPath', element.children, duration, delay, {
                clipParent: element,
                in: {
                    start: TOP_TO_BOTTOM,
                    end: CENTER_TO_CENTER,
                    direction: 'center',
                    minimum: 60,
                    ease: 'sine.out',
                },
            })),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgExpand.js.map