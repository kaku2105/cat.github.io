const name = 'BaseAttribute';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Object enumeration base animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, Object.assign({ duration, delay }, params), ['attr']);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseAttribute.js.map