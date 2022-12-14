export class Sequence {
    constructor(defs, params = {}) {
        this.timeline = defs.animations.BaseSequence(Object.assign({}, params));
        this.add = this.add.bind(this);
        this.get = this.get.bind(this);
        this.event = this.event.bind(this);
        this.play = this.play.bind(this);
        this.reverse = this.reverse.bind(this);
        this.pause = this.pause.bind(this);
        this.seek = this.seek.bind(this);
        this.clear = this.clear.bind(this);
    }
    /**
     * Add another animation, transition or sequence to the sequence
     */
    add(tweens, position = '+=0') {
        this.timeline.add(tweens, position);
        return this;
    }
    /**
     * Get the real timeline attached to the sequence
     */
    get() {
        return this.timeline;
    }
    /**
     * Add/remove Timeline event handler
     * From GSAP Docs (https://greensock.com/docs/v3/GSAP/Timeline/eventCallback()):
     * .eventCallback( type:String, callback:Function, params:Array ) : [Function | self]
     * Gets or sets an event callback like onComplete, onUpdate, onStart, onReverseComplete, or onRepeat
     * along with any parameters that should be passed to that callback.
     */
    event(type, handler, ...args) {
        this.timeline.eventCallback(type, handler, ...args);
        return this;
    }
    /**
     * Play the timeline
     */
    play() {
        this.timeline.play();
        return this;
    }
    /**
     * Play the timeline backwards
     */
    reverse() {
        this.timeline.reverse();
        return this;
    }
    /**
     * Pause the timeline
     */
    pause() {
        this.timeline.pause();
        return this;
    }
    /**
     * Seek the timeline
     */
    seek(progress) {
        this.timeline.totalProgress(progress);
        return this;
    }
    /**
     * Get the real timeline attached to the sequence
     */
    clear() {
        this.timeline.clear();
        return this;
    }
}
//# sourceMappingURL=Sequence.js.map