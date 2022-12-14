import { __rest } from "tslib";
const name = 'FloatIn';
const properties = {
    hideOnStart: true,
    mobile: true,
    viewportThreshold: 0.15,
    groups: ['entrance', 'animation'],
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
        direction: {
            type: 'string',
            enum: ['top', 'right', 'bottom', 'left'],
            default: 'right',
        },
    },
};
const paramsMap = {
    top: { dx: 0, dy: -1, distance: 50 },
    right: { dx: 1, dy: 0, distance: 50 },
    bottom: { dx: 0, dy: 1, distance: 50 },
    left: { dx: -1, dy: 0, distance: 50 },
};
function register({ factory }) {
    /**
     * FloatIn animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const fromParams = paramsMap[direction];
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Cubic.easeInOut',
        }));
        elements.forEach((element) => {
            const transformX = fromParams.dx * fromParams.distance;
            const transformY = fromParams.dy * fromParams.distance;
            sequence.add(factory.animate('BasePosition', element, duration, delay, {
                from: { x: transformX, y: transformY },
                ease: 'Quad.easeInOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=floatIn.js.map