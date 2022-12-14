import { __rest } from "tslib";
import { getAdjustedDirection } from '../../../../utils/animationsUtils';
const name = 'ArcIn';
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
            enum: ['right', 'left'],
            default: 'left',
        },
    },
};
const paramsMap = {
    pseudoRight: { angleX: '135', angleY: '0', idx: 0 },
    right: { angleX: '0', angleY: '135', idx: 1 },
    pseudoLeft: { angleX: '-135', angleY: '0', idx: 2 },
    left: { angleX: '0', angleY: '-135', idx: 3 },
};
function getRotate3DParams(direction) {
    return {
        rotationX: paramsMap[direction].angleX,
        rotationY: paramsMap[direction].angleY,
    };
}
function getTransformOriginParams(element) {
    return `50% 50% ${-0.5 * element.offsetWidth}`;
}
function register({ engine, factory }) {
    /**
     * ArcIn from opacity 0 animation object
     */
    function animation(elements, duration, delay, _a = {}) {
        var { direction = properties.schema.direction.default } = _a, params = __rest(_a, ["direction"]);
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Quad.easeOut',
        }));
        elements.forEach((element) => {
            const elementAngleInDeg = Number(element.getAttribute('data-angle')) || 0;
            const adjDirection = getAdjustedDirection(paramsMap, direction, elementAngleInDeg);
            const rotate3DParams = getRotate3DParams(adjDirection);
            const transformOriginParams = getTransformOriginParams(element);
            sequence
                .add(engine.set(element, { transformOrigin: transformOriginParams }), 0)
                .add(factory.animate('BaseRotate3D', element, duration, delay, {
                from: rotate3DParams,
                perspective: 200,
                ease: 'Quad.easeOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=arcIn.js.map