import { __rest } from "tslib";
const name = 'HeaderMoveCustom';
const EASE_DEFAULT = 'Linear.easeNone';
const properties = {
    schema: {
        duration: {
            type: 'number',
            min: 0,
            default: 0,
        },
        delay: {
            type: 'number',
            min: 0,
            default: 0,
        },
    },
};
function register({ factory }) {
    function animation(elements, duration, delay, _a) {
        var { to = {}, ease = EASE_DEFAULT } = _a, params = __rest(_a, ["to", "ease"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BasePosition', elements, duration, delay, { to, ease }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=HeaderMoveCustom.js.map