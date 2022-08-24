import { Sequence } from './Sequence';
const log = { error: (...args) => console.error(...args) };
/**
 * Start a new sequence
 * NOTE: expects for an animation called 'BaseSequence' to be registered
 */
export class AnimationsFactory {
    constructor() {
        this.defs = {
            animations: {},
            transitions: {},
            properties: {},
        };
        this.sequence = this.sequence.bind(this);
        this.animate = this.animate.bind(this);
        this.transition = this.transition.bind(this);
        this.registerAnimation = this.registerAnimation.bind(this);
        this.registerTransition = this.registerTransition.bind(this);
        this.getProperties = this.getProperties.bind(this);
        this.getAllProperties = this.getAllProperties.bind(this);
        this.getAnimationsDefs = this.getAnimationsDefs.bind(this);
        this.getTransitionsDefs = this.getTransitionsDefs.bind(this);
        this.resetRegistrations = this.resetRegistrations.bind(this);
    }
    sequence(params) {
        return new Sequence(this.defs, params);
    }
    animate(name, elements, duration, delay, params) {
        let animationFunc = this.defs.animations[name];
        if (!animationFunc) {
            log.error('Warning:', name, 'is not a registered animation. skipping.');
            animationFunc = this.defs.animations.BaseNone;
        }
        return animationFunc(elements, duration, delay, params ? Object.assign({}, params) : {});
    }
    transition(name, sourceElements, destinationElements, duration, delay, params) {
        let transitionsDef = this.defs.transitions[name];
        if (!transitionsDef) {
            log.error('Warning:', name, 'is not a registered transition. skipping.');
            transitionsDef = this.defs.transitions.noTransition;
        }
        return transitionsDef(sourceElements, destinationElements, duration, delay, params ? Object.assign({}, params) : {});
    }
    registerAnimation(animationName, animationFunc, animationProperties) {
        if (this.defs.transitions[animationName]) {
            log.error('Warning: there is already a transition with the name', animationName);
        }
        this.defs.animations[animationName] = animationFunc;
        this.defs.properties[animationName] = animationProperties || {};
    }
    registerTransition(transitionName, transitionFunc, animationProperties) {
        if (this.defs.animations[transitionName]) {
            log.error('Warning: there is already an animation with the name', transitionName);
        }
        this.defs.transitions[transitionName] = transitionFunc;
        this.defs.properties[transitionName] = animationProperties;
    }
    getProperties(name) {
        return this.defs.properties[name] || {};
    }
    getAllProperties() {
        return this.defs.properties;
    }
    getAnimationsDefs() {
        return this.defs.animations;
    }
    getTransitionsDefs() {
        return this.defs.transitions;
    }
    resetRegistrations() {
        this.defs.animations = {};
        this.defs.transitions = {};
        this.defs.properties = {};
    }
}
//# sourceMappingURL=AnimationsFactory.js.map