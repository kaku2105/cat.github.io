import { AnimationsFactory } from './AnimationsFactory';
import { TweenEngineGreenSock } from './TweenEngineGreenSock3';
/**
 * Constructor for a local tween engine.
 */
export class TweenEngine {
    constructor(gsap, plugins) {
        this.engine = new TweenEngineGreenSock(gsap, plugins);
        this.factory = new AnimationsFactory();
    }
}
//# sourceMappingURL=TweenEngine.js.map