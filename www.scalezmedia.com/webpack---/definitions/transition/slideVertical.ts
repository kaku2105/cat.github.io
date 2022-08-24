import { __rest } from "tslib";
import { toArray } from '../../utils/generalUtils';
const name = 'SlideVertical';
const properties = {
    defaultDuration: 0.6,
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
        reverse: {
            type: 'boolean',
            default: false,
        },
        height: {
            type: 'number',
            min: 0,
        },
    },
};
function register({ factory }) {
    /**
     * Slide an element out and another in from top to bottom.
     */
    function transition(sourceElements, destElements, duration, delay, _a = {}) {
        var { reverse = false, height, ease = 'Strong.easeInOut' } = _a, params = __rest(_a, ["reverse", "height", "ease"]);
        const direction = reverse ? -1 : 1;
        sourceElements = toArray(sourceElements);
        height = height !== null && height !== void 0 ? height : sourceElements[0].offsetHeight;
        const sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', destElements, 0, delay, {
                to: { opacity: 1 },
                immediateRender: false,
            }),
            factory.animate('BasePosition', sourceElements, duration, delay, {
                from: { y: 0 },
                to: { y: -height * direction },
                ease,
            }),
            factory.animate('BasePosition', destElements, duration, delay, {
                from: { y: height * direction },
                to: { y: 0 },
                ease,
            }),
        ]);
        return sequence.get();
    }
    factory.registerTransition(name, transition, properties);
}
export { name, properties, register };
//# sourceMappingURL=slideVertical.js.map