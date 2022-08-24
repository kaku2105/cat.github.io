import { __rest } from "tslib";
import { getPositionParams } from '../../../utils/animationsUtils';
const name = 'ModesMotionNoScale';
const properties = {
    groups: ['entrance', 'animation'],
    modeChange: true,
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
function register({ engine, factory }) {
    /**
     * Shift animation object
     */
    function animation(elements, duration, delay, _a) {
        var { from } = _a, params = __rest(_a, ["from"]);
        const sequence = factory.sequence(params);
        const { width, height, rotation } = from;
        elements.forEach((element) => {
            const elementViewPortDim = engine.getBoundingRect(element);
            const positionParams = getPositionParams(elementViewPortDim, from);
            sequence.add(factory.animate('BasePosition', element, duration, delay, {
                from: positionParams,
                ease: 'Cubic.easeInOut',
            }), 0);
            sequence.add(factory.animate('BaseDimensions', element, duration, delay, {
                from: { width, height },
                ease: 'Cubic.easeInOut',
            }), 0);
            sequence.add(factory.animate('BaseRotate', element, duration, delay, {
                from: { rotation },
                ease: 'Cubic.easeInOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=ModesMotionNoScale.js.map