import { getElementRect, getContentRect, getBoundingRect, getBoundingContentRect, } from '@wix/dom-measurements';
import { toArray, unionArrays } from '../utils/generalUtils';
const _allowedTweenMaxParamsList = [
    // Basics
    'ease',
    'duration',
    'delay',
    'to',
    'from',
    'repeat',
    'yoyo',
    'repeatDelay',
    'easeParams',
    'stagger',
    'transformOrigin',
    // Advanced
    'clearProps',
    'paused',
    'overwrite',
    'autoClear',
    'parseTransform',
    'fireUpdateCommand',
    'data',
    'elementClearParams',
    'perspective',
    'transformPerspective',
    'immediateRender',
    'callbacks',
    'force3D',
    'transformStyle',
];
const _allowedGSAPTimelineParamsList = [
    // Basics
    'delay',
    'repeat',
    'yoyo',
    'repeatDelay',
    'stagger',
    // Advanced
    'paused',
    'align',
    'tweens',
    'autoClear',
    'data',
    'elementClearParams',
    'callbacks',
];
/**
 * easeParams and old ease format is not supported on gsap3
 * old
 *    easeParams: [1, 0.5],
 *    ease: Elastic.easeOut
 * new
 *    ease: "elastic.out(1, 0.5)"
 */
const convertEaseToGsap3 = (params) => {
    // check format
    const { ease, easeParams } = params;
    if (ease === null || ease === void 0 ? void 0 : ease.includes('ease')) {
        let [easeClass, easeType] = ease.split('.');
        easeClass = easeClass.charAt(0).toLowerCase() + easeClass.slice(1);
        easeType = easeType.replace('ease', '');
        easeType = easeType.charAt(0).toLowerCase() + easeType.slice(1);
        const easeConfig = Array.isArray(easeParams)
            ? `(${easeParams.join(',')})`
            : '';
        params.ease = `${easeClass}.${easeType}${easeConfig}`.replace('linear.', '');
        delete params.easeParams;
    }
};
const convertParamsToGsap3 = [{ ease: convertEaseToGsap3 }];
function _callHandlerIfExists(sequenceOrTimeline, eventName) {
    var _a;
    const { data } = sequenceOrTimeline;
    const eventHandler = (_a = data === null || data === void 0 ? void 0 : data.callbacks) === null || _a === void 0 ? void 0 : _a[eventName];
    if (typeof eventHandler === 'function') {
        sequenceOrTimeline.data.callbacks[eventName](sequenceOrTimeline);
    }
}
export class TweenEngineGreenSock {
    constructor(gsap, plugins = []) {
        this.gsap = gsap;
        this.getElementRect = getElementRect;
        this.getContentRect = getContentRect;
        this.getBoundingRect = getBoundingRect;
        this.getBoundingContentRect = getBoundingContentRect;
        this.gsap.registerPlugin(...plugins);
        this.tween = this.tween.bind(this);
        this.timeline = this.timeline.bind(this);
        this.set = this.set.bind(this);
        this.kill = this.kill.bind(this);
        this.addTickerEvent = this.addTickerEvent.bind(this);
        this.removeTickerEvent = this.removeTickerEvent.bind(this);
        this.isTweening = this.isTweening.bind(this);
        this.getTweensOf = this.getTweensOf.bind(this);
        this._from = this._from.bind(this);
        this._to = this._to.bind(this);
        this._fromTo = this._fromTo.bind(this);
        this.delayedCall = this.delayedCall.bind(this);
        this.animateTimeScale = this.animateTimeScale.bind(this);
        this.adjustLagSmoothing = this.adjustLagSmoothing.bind(this);
    }
    /**
     * Animate an element.
     * Passed params are being validated and filtered against _allowedGSAPGSAPTweenVars | GSAPTimelineVarsList list
     */
    tween(elements, params = {}, allowedAnimationParamsList) {
        let tweenFunc;
        // We handle only Arrays
        elements = toArray(elements);
        const allowedParamsUnioned = unionArrays(allowedAnimationParamsList, _allowedTweenMaxParamsList);
        params = this._validateAnimationParams(params, allowedParamsUnioned);
        this._assignCallbacks(params);
        if (params.from && params.to) {
            tweenFunc = this._fromTo;
        }
        else if (params.from) {
            tweenFunc = this._from;
        }
        else {
            tweenFunc = this._to;
        }
        return tweenFunc(elements, params);
    }
    /**
     * Accepts a list of GSAPTween arguments and returns a timeline with all the returned tweens timelined to the timeline 0 mark
     * Passed params are being validated and filtered against _allowedGSAPTimelineParamsList list
     */
    timeline(params, allowedAnimationParamsList = []) {
        const allowedParamsUnioned = unionArrays(allowedAnimationParamsList, _allowedGSAPTimelineParamsList);
        params = this._validateAnimationParams(params, allowedParamsUnioned);
        this._assignCallbacks(params);
        return this.gsap.timeline(params);
    }
    /**
     * Calls a tween of 0 seconds duration, equivalent to GSAPTween 'set' just with our engine syntax and callbacks
     */
    set(elements, params = {}) {
        params.duration = 0;
        params.delay = 0;
        params.to = params.to || {};
        return this.tween(elements, params, Object.keys(params));
    }
    /**
     * Kill a tween or timeline and invoke a callback if passed
     * Before killing the animation set the position of the play head to the end of the animation (simulate completion)
     */
    kill(src, seekTo) {
        var _a, _b;
        if (!src.paused()) {
            src.pause();
            this._onInterruptHandler.apply(src);
        }
        if (typeof seekTo === 'number' && isFinite(seekTo)) {
            src.progress(seekTo, true);
        }
        src.kill();
        (_b = (_a = src).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /**
     * Adds a ticker ( wrapper for requestAnimationFrame / setTimeout 60FPS )
     * We are telling the browser that we wish to perform ( usually an animation ) and that the callback should be called before the next repaint
     */
    addTickerEvent(callback) {
        this.gsap.ticker.add(callback);
    }
    /**
     * Removes the registered ticker function
     */
    removeTickerEvent(callback) {
        this.gsap.ticker.remove(callback);
    }
    /**
     * Return if the passed element is in the middle of an animation
     */
    isTweening(element) {
        return this.gsap.isTweening(element);
    }
    /**
     * Return all tweens on an element
     */
    getTweensOf(element, isActive) {
        return this.gsap.getTweensOf(element, isActive);
    }
    /**
     * Set a new "from" animation, the animation will end at the default state of the element
     * a clone of the passed params object is saved on the GSAPTween's 'data' object
     */
    _from(elements, params = {}) {
        let tw;
        let seq;
        const fromParams = Object.assign(Object.assign({}, params.from), params);
        fromParams.data = fromParams.data || {};
        delete fromParams.from;
        if (typeof fromParams.stagger !== 'undefined') {
            const { data } = params;
            const { delay } = params;
            fromParams.data = {};
            delete fromParams.delay;
            tw = this.gsap.from(elements, fromParams);
            seq = this.timeline({ data, delay }).add(tw);
        }
        else {
            tw = this.gsap.from(elements, fromParams);
        }
        return seq || tw;
    }
    /**
     * Set a new "to" animation, the animation will start at the default state of the element
     * a clone of the passed params object is saved on the GSAPTween's 'data' object
     */
    _to(elements, params = {}) {
        let tw;
        let seq;
        const toParams = Object.assign(Object.assign({}, params.to), params);
        toParams.data = toParams.data || {};
        delete toParams.to;
        if (typeof toParams.stagger !== 'undefined') {
            const { data } = params;
            const { delay } = params;
            toParams.data = {};
            delete toParams.delay;
            tw = this.gsap.to(elements, toParams);
            seq = this.timeline({ data, delay }).add(tw);
        }
        else {
            tw = this.gsap.to(elements, toParams);
        }
        return seq || tw;
    }
    /**
     * Set a new "fromTo" animation
     * a clone of the passed params object is saved on the GSAPTween's 'data' object
     */
    _fromTo(elements, params = {}) {
        const { from: fromParams = {}, to: toParams = {} } = params;
        toParams.data = (toParams === null || toParams === void 0 ? void 0 : toParams.data) || {};
        delete params.to;
        delete params.from;
        Object.assign(toParams, params);
        return this.gsap.fromTo(elements, fromParams, toParams);
    }
    _assignCallbacks(params) {
        params.data = params.data || {};
        if (params.callbacks) {
            params.data.callbacks = {};
            if (params.callbacks.onComplete) {
                params.data.callbacks.onComplete = params.callbacks.onComplete;
                params.onComplete = this._onCompleteHandler;
            }
            if (params.callbacks.onReverseComplete) {
                params.data.callbacks.onReverseComplete =
                    params.callbacks.onReverseComplete;
                params.onReverseComplete = this._onReverseCompleteHandler;
            }
            if (params.callbacks.onStart) {
                params.data.callbacks.onStart = params.callbacks.onStart;
                params.onStart = this._onStartHandler;
            }
            if (params.callbacks.onUpdate) {
                params.data.callbacks.onUpdate = params.callbacks.onUpdate;
                params.onUpdate = this._onUpdateHandler;
            }
            if (params.callbacks.onInterrupt) {
                params.data.callbacks.onInterrupt = params.callbacks.onInterrupt;
            }
        }
        delete params.callbacks;
        return params;
    }
    /**
     * OnComplete callback for tweens and timelines
     */
    _onCompleteHandler() {
        _callHandlerIfExists(this, 'onComplete');
    }
    /**
     * OnReverseComplete callback for tweens and timelines
     */
    _onReverseCompleteHandler() {
        _callHandlerIfExists(this, 'onReverseComplete');
    }
    /**
     * OnStart callback for tweens and timelines
     */
    _onStartHandler() {
        _callHandlerIfExists(this, 'onStart');
    }
    /**
     * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
     */
    _onUpdateHandler() {
        _callHandlerIfExists(this, 'onUpdate');
    }
    /**
     * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
     */
    _onInterruptHandler() {
        _callHandlerIfExists(this, 'onInterrupt');
    }
    /**
     * Removes from the passed params object values that are not present in the union of allowedAnimationParamsList and this._allowedGSAPGSAPTweenVars | GSAPTimelineVarsList
     */
    _validateAnimationParams(params = {}, allowedAnimationParamsLists) {
        Object.keys(params).forEach((key) => {
            // If the parameter is 'to' of 'from' (for fromTo animations)
            // run validation on the second level
            if (key === 'to' || key === 'from') {
                this._validateAnimationParams(params[key], allowedAnimationParamsLists);
            }
            else if (!allowedAnimationParamsLists.includes(key)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete params[key];
            }
            else {
                // handle gsap3 params deprecation
                const modifierItem = convertParamsToGsap3.find((item) => item[key]);
                if (modifierItem) {
                    modifierItem[key](params);
                }
            }
        });
        return params;
    }
    delayedCall(delay, callback, params) {
        return this.gsap.delayedCall(delay, callback, params);
    }
    /**
     *
     */
    animateTimeScale(src, duration, from, to, easing = 'Linear.easeNone', callbacks) {
        const fromParams = {
            timeScale: from,
        };
        const toParams = {
            duration,
            timeScale: to,
            easing,
        };
        if (callbacks) {
            Object.assign(toParams, callbacks);
        }
        if (from === 0 && src.paused()) {
            src.play();
        }
        return this.gsap.fromTo(src, fromParams, toParams);
    }
    /**
     * Utility function, USE WITH CAUTION.
     * see http://greensock.com/docs/#/HTML5/GSAP/GSAPTween/static_lagSmoothing/
     */
    adjustLagSmoothing(threshold, adjustedLag) {
        var _a, _b;
        // GSAPTween is not loaded on server side rendering and tests, so testing for existence
        (_b = (_a = this.gsap.ticker).lagSmoothing) === null || _b === void 0 ? void 0 : _b.call(_a, threshold, adjustedLag);
    }
}
//# sourceMappingURL=TweenEngineGreenSock3.js.map