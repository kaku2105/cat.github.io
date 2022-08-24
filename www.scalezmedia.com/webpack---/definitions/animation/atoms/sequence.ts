import { __rest } from "tslib";
const name = 'Sequence';
const properties = {
    groups: ['animation'],
    schema: {
        delay: {
            type: 'number',
            min: 0,
            default: 0,
        },
        animations: {
            type: 'array',
        },
        repeat: {
            type: 'integer',
            min: -1,
        },
        repeatDelay: {
            type: 'number',
            min: 0,
        },
        yoyo: {
            type: 'boolean',
        },
    },
};
function register({ factory }) {
    /**
     * Sequence animations
     */
    function animation(elements, sequenceDelay = {}, _a = {}) {
        var { animations } = _a, params = __rest(_a, ["animations"]);
        const sequence = factory.sequence(Object.assign({ delay: sequenceDelay }, params));
        animations.forEach((def) => {
            const { name: animationName, duration, delay, offset, from = {}, to = {}, ease, } = def;
            sequence.add(factory.animate(animationName, elements, duration, delay, {
                from,
                to,
                ease,
            }), offset);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=sequence.js.map