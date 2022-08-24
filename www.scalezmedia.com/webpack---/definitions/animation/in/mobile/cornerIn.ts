import { __rest } from "tslib";
import { setSmoothTransformOrigin } from '../../../../utils/animationsUtils';
const name = 'CornerIn';
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
            enum: ['right', 'left'],
            default: 'right',
        },
    },
};
const paramsMap = {
    left: { dx: -1, angle: 45 },
    right: { dx: 1, angle: 45 },
};
function register({ factory }) {
    /**
     * TurnIn animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const origin = paramsMap[direction];
        const transformRotate = (origin.dx > 0 ? '+=' : '-=') + origin.angle;
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Linear.easeIn',
        }));
        elements.forEach((element) => {
            const transformOrigin = origin.dx > 0 ? '100% 100%' : '0 100%';
            sequence.add([
                setSmoothTransformOrigin(element, transformOrigin, factory.animate),
                factory.animate('BaseRotate', element, duration, delay, {
                    from: { rotation: transformRotate },
                    ease: 'Quad.easeOut',
                    immediateRender: false,
                }),
            ], 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=cornerIn.js.map