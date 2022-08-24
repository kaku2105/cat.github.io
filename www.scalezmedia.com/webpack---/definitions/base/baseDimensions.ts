const name = 'BaseDimensions';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Dimensions base animation object
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, Object.assign({ duration, delay }, params), [
            'width',
            'height',
            'top',
            'left',
            'maxWidth',
            'maxHeight',
            'minWidth',
            'minHeight',
            'bottom',
            'right',
            'margin',
            'padding',
            'marginTop',
            'marginBottom',
            'marginLeft',
            'marginRight',
            'paddingTop',
            'paddingBottom',
            'paddingRight',
            'paddingLeft',
            'zIndex',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseDimensions.js.map