import { __rest } from "tslib";
const name = 'FlyOut';
const properties = {
    groups: ['exit', 'animation'],
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
            enum: [
                'top',
                'top left',
                'top right',
                'left',
                'bottom',
                'bottom left',
                'bottom right',
                'right',
            ],
            default: 'right',
        },
    },
};
const paramsMap = {
    top: { dy: -1 },
    right: { dx: 1 },
    bottom: { dy: 1 },
    left: { dx: -1 },
};
function parseParams(direction) {
    const fromParams = { dx: 0, dy: 0 };
    direction.forEach((value) => {
        if (paramsMap[value]) {
            Object.assign(fromParams, paramsMap[value]);
        }
    });
    return fromParams;
}
function register({ engine, factory }, frame) {
    /**
     * FlyIn animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const fromParams = parseParams(direction.split(' '));
        const browserViewPortDim = {
            width: frame.innerWidth,
            height: frame.innerHeight,
        };
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 1 },
            to: { autoAlpha: 0 },
            ease: 'Linear.easeIn',
        }));
        elements.forEach((element) => {
            const elementViewPortDim = engine.getBoundingRect(element);
            const transformX = fromParams.dx > 0
                ? browserViewPortDim.width - elementViewPortDim.right
                : fromParams.dx * elementViewPortDim.left;
            const transformY = fromParams.dy > 0
                ? browserViewPortDim.height - elementViewPortDim.top
                : fromParams.dy * elementViewPortDim.bottom;
            sequence.add(factory.animate('BasePosition', element, duration, delay, {
                to: { x: transformX, y: transformY },
                ease: 'Sine.easeIn',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=flyOut.js.map