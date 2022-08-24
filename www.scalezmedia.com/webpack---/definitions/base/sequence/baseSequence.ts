const name = 'BaseSequence';
const properties = {};
function register({ engine, factory }) {
    /**
     * Sequence base animation object
     */
    function sequence(params) {
        return engine.timeline(params, []);
    }
    factory.registerAnimation(name, sequence, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseSequence.js.map