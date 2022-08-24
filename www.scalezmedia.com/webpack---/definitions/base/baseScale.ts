const name = 'BaseScale';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Scale base animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, Object.assign({ duration, delay }, params), [
            'scale',
            'scaleX',
            'scaleY',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseScale.js.map