import { __rest } from "tslib";
const name = 'OutIn';
const properties = {
    defaultDuration: 0.7,
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
        stagger: {
            type: 'number',
            default: 0,
        },
    },
};
function register({ factory }) {
    /**
     * Fade out an element and after it disappears fade in the next element.
     */
    function transition(sourceElements, destElements, duration, delay, _a = {}) {
        var { stagger = 0, sourceEase = 'Strong.easeOut', destEase = 'Strong.easeIn' } = _a, params = __rest(_a, ["stagger", "sourceEase", "destEase"]);
        const sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', sourceElements, duration, delay, {
                from: { opacity: 1 },
                to: { opacity: 0 },
                ease: sourceEase,
                stagger,
            }),
            factory.animate('BaseFade', destElements, duration, delay, {
                from: { opacity: 0 },
                to: { opacity: 1 },
                ease: destEase,
                stagger,
            }),
        ]);
        return sequence.get();
    }
    factory.registerTransition(name, transition, properties);
}
export { name, properties, register };
//# sourceMappingURL=outIn.js.map