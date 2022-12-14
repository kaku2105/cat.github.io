import { __rest } from "tslib";
import { getTravelMap, TRAVEL_TYPES } from '../../../utils/animationsUtils';
const name = 'BgFadeIn';
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
        const { TOP_TO_BOTTOM, CENTER_TO_CENTER } = getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, TRAVEL_TYPES.legacy_in);
        sequence.add(factory.animate('BaseBgFade', elements, duration, delay, {
            in: {
                start: TOP_TO_BOTTOM,
                end: CENTER_TO_CENTER,
                opacity: 0,
                ease: 'sine.in',
            },
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=bgFadeIn.js.map