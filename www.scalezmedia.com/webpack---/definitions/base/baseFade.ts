import { __rest } from "tslib";
const name = 'BaseFade';
const properties = {};
function register({ engine, factory } /* , frame*/) {
    /**
     * Fade base animation object (defaults to always use 'autoAlpha' which treats visibility:hidden as opacity:0)
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { lazy = false, to = {}, from = {} } = _a, params = __rest(_a, ["lazy", "to", "from"]);
        if (to.opacity > 0) {
            to.autoAlpha = to.opacity;
            delete to.opacity;
        }
        if (from.opacity > 0) {
            from.autoAlpha = from.opacity;
            delete from.opacity;
        }
        return engine.tween(elements, Object.assign({ duration, delay, lazy, to, from }, params), ['opacity', 'autoAlpha']);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseFade.js.map