import { __rest } from "tslib";
import { getAdjustedDirection } from '../../../../utils/animationsUtils';
const name = 'FlipIn';
const properties = {
    hideOnStart: true,
    mobile: true,
    viewportThreshold: 0.15,
    groups: ['3d', 'entrance', 'animation'],
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
            default: 'left',
        },
    },
};
const paramsMap = {
    top: { angleX: '90', angleY: '0', idx: 0 },
    right: { angleX: '0', angleY: '90', idx: 1 },
    bottom: { angleX: '-90', angleY: '0', idx: 2 },
    left: { angleX: '0', angleY: '-90', idx: 3 },
};
function register({ factory }) {
    /**
     * Flip in from
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, 0, 0, { to: { opacity: 0.01 } }));
        sequence.add(factory.animate('BaseFade', elements, duration * 0.25, delay, {
            to: {
                opacity: 1,
            },
            ease: 'Quad.easeOut',
        }), 'animation-start');
        elements.forEach((element) => {
            const elementAngleInDeg = Number(element.getAttribute('data-angle')) || 0;
            const adjDirection = getAdjustedDirection(paramsMap, direction, elementAngleInDeg);
            const from = {
                rotationX: paramsMap[adjDirection].angleX,
                rotationY: paramsMap[adjDirection].angleY,
            };
            sequence.add(factory.animate('BaseRotate3D', element, duration * 0.75, delay, {
                from,
                perspective: 800,
                fallbackFor3D: true,
                ease: 'Quad.easeOut',
            }), 'animation-start');
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=flipIn.js.map