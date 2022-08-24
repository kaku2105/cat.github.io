import { __rest } from "tslib";
import { toArray } from '../../utils/generalUtils';
const name = 'SlideHorizontal';
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
        width: {
            type: 'number',
            min: 0,
        },
    },
};
function register({ factory }) {
    /**
     * Slide an element out and another in from left tot right.
     */
    function transition(sourceElements, destElements, duration, delay, _a = {}) {
        var { reverse = properties.schema.reverse.default, width, ease = 'Strong.easeInOut' } = _a, params = __rest(_a, ["reverse", "width", "ease"]);
        const direction = reverse ? -1 : 1;
        sourceElements = toArray(sourceElements);
        width = width !== null && width !== void 0 ? width : sourceElements[0].offsetWidth;
        const sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', destElements, 0, delay, {
                to: { opacity: 1 },
                immediateRender: false,
            }),
            factory.animate('BasePosition', sourceElements, duration, delay, {
                from: { x: 0 },
                to: { x: -width * direction },
                ease,
            }),
            factory.animate('BasePosition', destElements, duration, delay, {
                from: { x: width * direction },
                to: { x: 0 },
                ease,
            }),
        ]);
        return sequence.get();
    }
    factory.registerTransition(name, transition, properties);
}
export { name, properties, register };
//# sourceMappingURL=slideHorizontal.js.map