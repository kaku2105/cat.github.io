import { __rest } from "tslib";
import { toArray } from '../../../../utils/generalUtils';
const name = 'BaseBgParallaxY';
const properties = {
    hideOnStart: false,
    groups: ['animation', 'background'],
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
        start: {
            type: 'number',
            min: 0,
            max: 1,
        },
        end: {
            type: 'number',
            min: 0,
            max: 1,
        },
        ease: {
            type: 'string',
        },
        componentHeight: {
            type: 'number',
            min: 0,
        },
        viewPortHeight: {
            type: 'number',
            min: 0,
        },
        speedFactor: {
            type: 'number',
        },
    },
};
function register({ factory }) {
    /**
     * Base Parallax for balata media elements on scroll
     */
    function animation(elements, duration, delay, _a = {}) {
        var { speedFactor, start, end, ease, componentHeight, viewPortHeight } = _a, params = __rest(_a, ["speedFactor", "start", "end", "ease", "componentHeight", "viewPortHeight"]);
        elements = toArray(elements);
        const sequence = factory.sequence(params);
        Array.isArray(elements) &&
            elements.forEach((element) => {
                element.style.willChange = 'transform';
            });
        const from = -viewPortHeight * speedFactor;
        const to = componentHeight * speedFactor;
        const travel = to - from;
        sequence.add(factory.animate('BaseBgPositionY', elements, duration, delay, {
            from: from + travel * start,
            to: to - travel * (1 - end),
            start,
            end,
            ease,
        }), 0);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseBgParallaxY.js.map