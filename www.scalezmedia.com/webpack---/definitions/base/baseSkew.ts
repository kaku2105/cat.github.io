const name = 'BaseSkew';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Skew animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, Object.assign({ duration, delay }, params), [
            'skewX',
            'skewY',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseSkew.js.map