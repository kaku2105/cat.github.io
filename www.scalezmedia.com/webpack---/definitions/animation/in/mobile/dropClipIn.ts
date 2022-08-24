import { __rest } from "tslib";
import { getClipParams } from '../../../../utils/animationsUtils';
const name = 'DropClipIn';
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
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'soft',
        },
    },
};
const scaleMap = {
    soft: 1.2,
    medium: 3.6,
    hard: 6,
};
function register({ factory, engine }) {
    /**
     * Expand in from
     */
    function animation(elements, duration, delay, _a = {}) {
        var { power = properties.schema.power.default } = _a, params = __rest(_a, ["power"]);
        const scale = scaleMap[power];
        const sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            ease: 'Circ.easeOut',
        }));
        elements.forEach((element) => {
            const compRect = engine.getBoundingRect(element);
            const contentRect = engine.getBoundingContentRect(element);
            const from = getClipParams(compRect, contentRect, 'initial', {
                scaleX: 1 / scale,
                scaleY: 1 / scale,
            });
            sequence.add([
                factory.animate('BaseClipPath', element, duration, delay, {
                    from,
                    ease: 'Quad.easeOut',
                }),
                factory.animate('BaseScale', element, duration, delay, {
                    from: { scale },
                    ease: 'Quad.easeOut',
                }),
            ], 0);
        });
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=dropClipIn.js.map