import { __rest } from "tslib";
import { definitions } from '../definitions/definitions';
import { toArray } from '../utils/generalUtils';
import { getAnimationMode, getAnimationDefsByViewMode, } from '../utils/definitionsUtils';
import { validateSchema } from '../utils/validationUtils';
import { viewerDefaults } from '../utils/viewerDefaults';
/**
 * Animations constructor
 */
export class AnimationsKit {
    constructor({ engine, factory }, frame = window, viewMode = 'desktop') {
        this.engine = engine;
        this.factory = factory;
        this.engine.adjustLagSmoothing(500, 33);
        this.registerAnimations(definitions, viewMode, frame);
        this.validateAnimation = this.validateAnimation.bind(this);
        this.animate = this.animate.bind(this);
        this.transition = this.transition.bind(this);
        this.updateViewMode = this.updateViewMode.bind(this);
        this.sequence = factory.sequence;
        this.getProperties = factory.getProperties;
        this.addTickerEvent = engine.addTickerEvent;
        this.removeTickerEvent = engine.removeTickerEvent;
        this.kill = engine.kill;
        this.delayedCall = engine.delayedCall;
        this.animateTimeScale = engine.animateTimeScale;
        this.viewerDefaults = viewerDefaults;
    }
    /**
     * Register animations - Call the 'register' function of each animation filtered by viewMode
     */
    registerAnimations(_a, viewMode, frame) {
        var { defaults } = _a, viewModes = __rest(_a, ["defaults"]);
        const animationMode = getAnimationMode(viewMode);
        const animationDefsByViewMode = getAnimationDefsByViewMode(defaults, viewModes[animationMode]);
        animationDefsByViewMode.forEach((animationDef) => {
            animationDef.register({ engine: this.engine, factory: this.factory }, frame);
        });
    }
    validateAnimation(name, params) {
        const properties = this.factory.getAllProperties();
        if (!properties[name]) {
            console.log(`No such animation "${name}"`);
            return false;
        }
        return validateSchema(properties[name].schema || {}, params, (errors) => errors.forEach((error) => console.error(error)));
    }
    animate(name, elements, duration, delay = 0, params = {}) {
        if (this.validateAnimation(name, Object.assign({ duration, delay }, params))) {
            return this.factory.animate(name, toArray(elements), duration, delay, params);
        }
        return this.factory.animate('BaseNone', elements, 0, 0, {});
    }
    transition(name, sourceElements, destinationElements, duration, delay = 0, params = {}) {
        if (this.validateAnimation(name, Object.assign({ duration, delay }, params))) {
            return this.factory.transition(name, toArray(sourceElements), toArray(destinationElements), duration, delay, params);
        }
        return this.factory.transition('noTransition', sourceElements, destinationElements, 0, 0, {});
    }
    updateViewMode(mode, frame = window) {
        this.factory.resetRegistrations();
        this.registerAnimations(definitions, mode, frame);
    }
}
//# sourceMappingURL=AnimationsKit.js.map