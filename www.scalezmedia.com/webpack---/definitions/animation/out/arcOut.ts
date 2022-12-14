import { __rest } from "tslib";
import { getAdjustedDirection } from '../../../utils/animationsUtils';
const name = 'ArcOut';
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
            enum: ['right', 'left'],
            default: 'left',
        },
    },
};
const paramsMap = {
    pseudoRight: { angleX: '180', angleY: '0', idx: 0 },
    right: { angleX: '0', angleY: '180', idx: 1 },
    pseudoLeft: { angleX: '-180', angleY: '0', idx: 2 },
    left: { angleX: '0', angleY: '-180', idx: 3 },
};
function getRotate3DParams(direction) {
    return {
        rotationX: paramsMap[direction].angleX,
        rotationY: paramsMap[direction].angleY,
    };
}
function getTransformOriginParams(element) {
    return `50% 50% ${-1.5 * element.offsetWidth}`;
}
function register({ engine, factory }) {
    /**
     * Arc Out animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 1 },
            to: { autoAlpha: 0 },
            ease: 'Sine.easeInOut',
        }));
        elements.forEach((element) => {
            const elementAngleInDeg = Number(element.getAttribute('data-angle')) || 0;
            const adjDirection = getAdjustedDirection(paramsMap, direction, elementAngleInDeg);
            const rotate3DParams = getRotate3DParams(adjDirection);
            const transformOriginParams = getTransformOriginParams(element);
            sequence
                .add(engine.set(element, { transformOrigin: transformOriginParams }), 0)
                .add(factory.animate('BaseRotate3D', element, duration, delay, {
                to: rotate3DParams,
                perspective: 200,
                fallbackFor3D: false,
                ease: 'Sine.easeInOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=arcOut.js.map