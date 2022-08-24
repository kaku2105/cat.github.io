import { __rest } from "tslib";
const name = 'SiteBackgroundParallax';
const properties = {
    hideOnStart: false,
    getMaxTravel(_elementMeasure, viewportHeight, siteHeight) {
        return Math.max(siteHeight - viewportHeight, 0);
    },
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
        speedFactor: {
            type: 'number',
            default: 0.2,
        },
    },
};
function register({ factory }, frame) {
    /**
     * Move an element vertically (from y:0)
     */
    function animation(elements, duration, delay, _a = {}) {
        var { speedFactor = properties.schema.speedFactor.default } = _a, params = __rest(_a, ["speedFactor"]);
        const sequence = factory.sequence(params);
        const maxY = Math.max(frame.document.body.scrollHeight * speedFactor, 0);
        const desiredY = frame.innerHeight * speedFactor;
        const y = Math.min(maxY, desiredY);
        sequence.add(factory.animate('BasePosition', elements, duration, delay, {
            from: { y: 0 },
            to: { y: -y },
            force3D: true,
            ease: 'Linear.easeNone',
        }));
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=siteBackgroundParallax.js.map