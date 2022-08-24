const name = 'BaseRotate';
const properties = {};
const supportedDirections = {
    cw: true,
    ccw: true,
    short: true,
};
function register({ engine, factory } /* , frame*/) {
    /**
     * Rotate animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        const { to, from } = params;
        if (to &&
            typeof to.rotation !== 'undefined' &&
            supportedDirections[to.direction]) {
            params.to.rotation = `${to.rotation}_${to.direction}`;
        }
        if (from &&
            typeof from.rotation !== 'undefined' &&
            supportedDirections[from.direction]) {
            params.from.rotation = `${from.rotation}_${from.direction}`;
        }
        return engine.tween(elements, Object.assign({ duration, delay }, params), ['rotation']);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseRotate.js.map