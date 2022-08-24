import { __rest } from "tslib";
import { getPositionParams } from '../../../utils/animationsUtils';
const name = 'ModesMotionNoDimensions';
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
        elements.forEach((element) => {
            const elementViewPortDim = engine.getBoundingRect(element);
            const positionParams = getPositionParams(elementViewPortDim, from);
            sequence.add(factory.animate('BasePosition', element, duration, delay, {
                from: positionParams,
                ease: 'Cubic.easeInOut',
            }), 0);
            sequence.add(factory.animate('BaseRotate', element, duration, delay, {
                from: { rotation: from.rotation },
                ease: 'Cubic.easeInOut',
            }), 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=ModesMotionNoDimensions.js.map