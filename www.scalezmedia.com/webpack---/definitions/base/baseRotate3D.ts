import { __rest } from "tslib";
import { toArray } from '../../utils/generalUtils';
const name = 'BaseRotate3D';
const properties = {};
/**
 * Safari (All versions) has a bug with css 3d transforms -
 * it requires the animated element parent to have it's own rendering context or else the 3d animations
 * intersect with the background and with each other.
 *
 * With this hack we add a counter for the parent element of the animated elements that keeps track on
 * how many 3d animations happen right now inside this parent.
 * in viewer.css we have this code:
 *
 *   [data-z-counter]{z-index:0;}
 *   [data-z-counter="0"]{z-index:auto;}
 *
 * that adds z-index to the parent while 3d animations are running.
 */
function increment3dAnimationsCounter(parents) {
    parents.forEach((parent) => {
        let zCounter = parent.getAttribute('data-z-counter');
        zCounter = zCounter ? Number(zCounter) : 0;
        parent.setAttribute('data-z-counter', (zCounter + 1).toString());
    });
}
/**
 * This is the second part of the Safari hack, this time we decrement the counter after the animation is complete.
 */
function decrement3dAnimationsCounter(parents, sequence, engine) {
    parents.forEach((parent) => sequence.add(engine.set(parent, {
        attr: { 'data-z-counter': '-=1' },
        immediateRender: false,
    })));
}
function register({ engine, factory } /* , frame*/) {
    /**
     * Rotate 3D animation object
     */
    function animation(elements, duration = 0, delay = 0, _a = {}) {
        var { perspective } = _a, params = __rest(_a, ["perspective"]);
        elements = toArray(elements);
        const allowedParams = ['rotationX', 'rotationY', 'rotationZ'];
        // TODO: We need to fix or css cleaning technique.
        // TODO: this setting is actually never read
        const parents = new Set(elements.map((element) => element.parentNode));
        const sequence = factory.sequence();
        increment3dAnimationsCounter(parents);
        sequence
            .add(engine.set(elements, { transformPerspective: perspective }), 0)
            .add(engine.tween(elements, Object.assign({ duration, delay }, params), allowedParams));
        decrement3dAnimationsCounter(parents, sequence, engine);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseRotate3D.js.map