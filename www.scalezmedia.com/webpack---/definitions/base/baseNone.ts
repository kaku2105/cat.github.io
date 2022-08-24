const name = 'BaseNone';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Empty animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        const to = {};
        return engine.tween(elements, Object.assign(Object.assign({ duration, delay }, params), { to }), []);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseNone.js.map