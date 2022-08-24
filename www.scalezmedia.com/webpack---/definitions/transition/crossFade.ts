import { __rest } from "tslib";
const name = 'CrossFade';
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
        stagger: {
            type: 'number',
            default: 0,
        },
    },
};
function register({ factory }) {
    /**
     * CrossFade between two elements, animation the source from 1 to 0 opacity while animating the destination from 0 to 1.
     */
    function transition(sourceElements, destElements, duration, delay, _a = {}) {
        var { stagger = 0, sourceEase = 'Sine.easeInOut', destEase = 'Sine.easeInOut' } = _a, params = __rest(_a, ["stagger", "sourceEase", "destEase"]);
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
//# sourceMappingURL=crossFade.js.map