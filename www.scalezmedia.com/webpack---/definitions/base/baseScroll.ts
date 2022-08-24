import { __rest } from "tslib";
const name = 'BaseScroll';
const properties = {};
function register({ engine, factory }) {
    /**
     * Scroll base animation object
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { x = 0, y = 0, autoKill = false } = _a, params = __rest(_a, ["x", "y", "autoKill"]);
        // eslint-disable-line complexity
        const scrollTo = { x, y, autoKill };
        return engine.tween(elements, Object.assign({ duration, delay, scrollTo }, params), [
            'scrollTo',
            'autoKill',
        ]);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseScroll.js.map