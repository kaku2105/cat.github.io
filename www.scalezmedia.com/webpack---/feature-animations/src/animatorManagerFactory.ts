import { ViewMode } from '@wix/thunderbolt-symbols'
import { TweenEngine, AnimationsKit } from '@wix/animations-kit'
import { getAnimatorManager } from './animations'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

export const createAnimatorManager = (viewMode: ViewMode) => {
	const tweenEngineAndFactory = new TweenEngine(gsap, [ScrollToPlugin])
	const animator = new AnimationsKit(tweenEngineAndFactory, undefined, viewMode)

	return getAnimatorManager(animator)
}
