import { __rest } from "tslib";
const name = 'TurnIn';
const properties = {
    hideOnStart: true,
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
            enum: ['right', 'left'],
            default: 'left',
        },
    },
};
const paramsMap = {
    left: { dx: -1, angle: 90 },
    right: { dx: 1, angle: 90 },
};
function register({ engine, factory }, frame) {
    /**
     * TurnIn animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const origin = paramsMap[direction];
        const browserRect = { width: frame.innerWidth, height: frame.innerHeight };
        const transformRotate = (origin.dx > 0 ? '+=' : '-=') + origin.angle;
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Linear.easeIn',
        }));
        elements.forEach((element) => {
            const compRect = engine.getBoundingRect(element);
            const transformX = origin.dx > 0
                ? browserRect.width - compRect.right
                : origin.dx * compRect.left;
            const transformY = Math.min(-1.5 * compRect.height, Math.max(-300, -5.5 * compRect.height));
            sequence.add([
                factory.animate('BasePosition', element, duration, delay, {
                    from: { x: transformX },
                    ease: 'Circ.easeOut',
                    immediateRender: false,
                }),
                factory.animate('BasePosition', element, duration, delay, {
                    from: { y: transformY },
                    ease: 'Linear.easeOut',
                    immediateRender: false,
                }),
                factory.animate('BaseRotate', element, duration, delay, {
                    from: { rotation: transformRotate },
                    ease: 'Linear.easeOut',
                    immediateRender: false,
                }),
            ], 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=turnIn.js.map