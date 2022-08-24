const name = 'NoTransition';
const properties = {
    defaultDuration: 0,
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
    /**
     * Empty transition.
     */
    function transition(sourceElements, destElements, duration, delay, params) {
        const sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseNone', sourceElements, duration, delay),
            factory.animate('BaseNone', destElements, duration, delay),
        ]);
        return sequence.get();
    }
    factory.registerTransition(name, transition, properties);
}
export { name, properties, register };
//# sourceMappingURL=noTransition.js.map