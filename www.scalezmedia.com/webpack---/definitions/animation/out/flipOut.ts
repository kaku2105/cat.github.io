import { __rest } from "tslib";
import { getAdjustedDirection } from '../../../utils/animationsUtils';
const name = 'FlipOut';
const properties = {
    groups: ['3d', 'exit', 'animation'],
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
        sequence.add(factory.animate('BaseFade', elements, duration * 0.75, delay + duration * 0.25, { from: { opacity: 1 }, to: { autoAlpha: 0 }, ease: 'Sine.easeOut' })); // eslint-disable-line no-mixed-operators
        elements.forEach((element) => {
            const elementAngleInDeg = Number(element.getAttribute('data-angle')) || 0;
            const adjDirection = getAdjustedDirection(paramsMap, direction, elementAngleInDeg);
            const to = {
                rotationX: paramsMap[adjDirection].angleX,
                rotationY: paramsMap[adjDirection].angleY,
            };
            sequence.add(factory.animate('BaseRotate3D', element, duration * 0.75, delay, {
                to,
                perspective: 800,
                fallbackFor3D: true,
                ease: 'Strong.easeOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=flipOut.js.map