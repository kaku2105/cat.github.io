const name = 'BasePosition';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Position base animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, Object.assign({ duration, delay }, params), [
            'left',
            'top',
            'x',
            'y',
            'z',
            'bezier',
            'perspectiveOrigin',
            'perspective',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=basePosition.js.map