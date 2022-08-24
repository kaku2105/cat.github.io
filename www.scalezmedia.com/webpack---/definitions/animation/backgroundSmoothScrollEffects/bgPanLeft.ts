import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgPanLeft';
const speedFactor = 0.2;
const properties = {
    hideOnStart: false,
    getMediaDimensions(width, height) {
        return { width: width * (1 + speedFactor), height };
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
        parallaxParent: {
            type: 'element',
        },
    },
};
function register({ engine, factory }) {
    function animation(elements, duration, delay, _a = {}) {
        var { componentHeight, componentTop, siteHeight, viewPortHeight, parallaxParent } = _a, params = __rest(_a, ["componentHeight", "componentTop", "siteHeight", "viewPortHeight", "parallaxParent"]);
        if (!parallaxParent) {
            console.warn(`animations-kit: ${name}: "parallaxParent: element" is a mandatory parameter for this animation`);
        }
        const sequence = factory.sequence(params);
        const { width } = engine.getBoundingRect(parallaxParent);
        const { TOP_TO_BOTTOM, BOTTOM_TO_TOP } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.normal);
        sequence.add([
            factory.animate('BaseBgPositionX', elements, duration, delay, {
                start: TOP_TO_BOTTOM,
                end: BOTTOM_TO_TOP,
                from: (width * speedFactor) / 2,
                to: (-width * speedFactor) / 2,
                ease: 'none',
            }),
        ]);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgPanLeft.js.map