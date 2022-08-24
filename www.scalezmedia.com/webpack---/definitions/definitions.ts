// Base animations
import * as baseSequence from './base/sequence/baseSequence';
import * as baseNone from './base/baseNone';
import * as baseFade from './base/baseFade';
import * as basePosition from './base/basePosition';
import * as baseScale from './base/baseScale';
import * as baseSkew from './base/baseSkew';
import * as baseRotate from './base/baseRotate';
import * as baseRotate3D from './base/baseRotate3D';
import * as baseClip from './base/baseClip';
import * as baseClipPath from './base/baseClipPath';
import * as baseDimensions from './base/baseDimensions';
import * as baseScroll from './base/baseScroll';
import * as baseAttribute from './base/baseAttribute';
import * as baseObjectProperties from './base/baseObjectProperties';
import * as baseClear from './base/baseClear';
// General Animations
import * as fade from './animation/atoms/fade';
import * as position from './animation/atoms/position';
import * as scale from './animation/atoms/scale';
import * as rotate from './animation/atoms/rotate';
import * as sequence from './animation/atoms/sequence';
import * as clearSequence from './animation/atoms/clearSequence';
import * as timelineAnimation from './animation/atoms/timelineAnimation';
// In Animations
import * as arcIn from './animation/in/defaults/arcIn';
import * as dropIn from './animation/in/defaults/dropIn';
import * as expandIn from './animation/in/defaults/expandIn';
import * as fadeIn from './animation/in/defaults/fadeIn';
import * as flipIn from './animation/in/defaults/flipIn';
import * as floatIn from './animation/in/defaults/floatIn';
import * as flyIn from './animation/in/defaults/flyIn';
import * as foldIn from './animation/in/defaults/foldIn';
import * as reveal from './animation/in/defaults/reveal';
import * as slideIn from './animation/in/defaults/slideIn';
import * as spinIn from './animation/in/defaults/spinIn';
import * as turnIn from './animation/in/defaults/turnIn';
import * as bounceIn from './animation/in/defaults/bounceIn';
import * as glideIn from './animation/in/defaults/glideIn';
// Out Animations
import * as arcOut from './animation/out/arcOut';
import * as popOut from './animation/out/popOut';
import * as collapseOut from './animation/out/collapseOut';
import * as fadeOut from './animation/out/fadeOut';
import * as flipOut from './animation/out/flipOut';
import * as floatOut from './animation/out/floatOut';
import * as flyOut from './animation/out/flyOut';
import * as foldOut from './animation/out/foldOut';
import * as conceal from './animation/out/conceal';
import * as slideOut from './animation/out/slideOut';
import * as spinOut from './animation/out/spinOut';
import * as turnOut from './animation/out/turnOut';
import * as bounceOut from './animation/out/bounceOut';
import * as glideOut from './animation/out/glideOut';
// Mode Transition Animations
import * as ModesMotionNoScale from './animation/modes/ModesMotionNoScale';
import * as ModesMotionNoDimensions from './animation/modes/ModesMotionNoDimensions';
import * as ModesMotionScale from './animation/modes/ModesMotionScale';
// Background Smooth Scroll Effects Base
import * as baseBgFade from './animation/backgroundSmoothScrollEffects/base/baseBgFade';
import * as baseBgPositionX from './animation/backgroundSmoothScrollEffects/base/baseBgPositionX';
import * as baseBgPositionY from './animation/backgroundSmoothScrollEffects/base/baseBgPositionY';
import * as baseBgParallaxY from './animation/backgroundSmoothScrollEffects/base/baseBgParallaxY';
import * as baseBgRotate from './animation/backgroundSmoothScrollEffects/base/baseBgRotate';
import * as baseBgScale from './animation/backgroundSmoothScrollEffects/base/baseBgScale';
import * as baseBgSkew from './animation/backgroundSmoothScrollEffects/base/baseBgSkew';
import * as baseBgZoom from './animation/backgroundSmoothScrollEffects/base/baseBgZoom';
import * as baseBgClipPath from './animation/backgroundSmoothScrollEffects/base/baseBgClipPath';
// background Smooth Scroll Effects
// Stub
import * as backgroundParallaxZoom from './animation/backgroundScrollEffects/backgroundParallaxZoom';
// Classic
import * as bgParallax from './animation/backgroundSmoothScrollEffects/bgParallax';
import * as bgReveal from './animation/backgroundSmoothScrollEffects/bgReveal';
import * as bgFadeIn from './animation/backgroundSmoothScrollEffects/bgFadeIn';
// New
import * as bgZoomIn from './animation/backgroundSmoothScrollEffects/bgZoomIn';
import * as bgZoomOut from './animation/backgroundSmoothScrollEffects/bgZoomOut';
import * as bgCloseUp from './animation/backgroundSmoothScrollEffects/bgCloseUp';
import * as bgPullBack from './animation/backgroundSmoothScrollEffects/bgPullBack';
import * as bgFadeOut from './animation/backgroundSmoothScrollEffects/bgFadeOut';
import * as bgPanLeft from './animation/backgroundSmoothScrollEffects/bgPanLeft';
import * as bgPanRight from './animation/backgroundSmoothScrollEffects/bgPanRight';
import * as bgRotate from './animation/backgroundSmoothScrollEffects/bgRotate';
import * as bgUnwind from './animation/backgroundSmoothScrollEffects/bgUnwind';
import * as bgFake3D from './animation/backgroundSmoothScrollEffects/bgFake3D';
import * as bgSkew from './animation/backgroundSmoothScrollEffects/bgSkew';
import * as bgFadeBack from './animation/backgroundSmoothScrollEffects/bgFadeBack';
import * as bgShrink from './animation/backgroundSmoothScrollEffects/bgShrink';
import * as bgExpand from './animation/backgroundSmoothScrollEffects/bgExpand';
// Background Scroll Effects
import * as siteBackgroundParallax from './animation/backgroundScrollEffects/siteBackgroundParallax';
import * as backgroundReveal from './animation/backgroundScrollEffects/backgroundReveal';
import * as backgroundParallax from './animation/backgroundScrollEffects/backgroundParallax';
import * as backgroundZoom from './animation/backgroundScrollEffects/backgroundZoom';
import * as backgroundFadeIn from './animation/backgroundScrollEffects/backgroundFadeIn';
import * as backgroundBlurIn from './animation/backgroundScrollEffects/backgroundBlurIn';
// Component specific animations
import * as headerHideToTop from './animation/componentAnimations/headerHideToTop';
import * as HeaderMoveCustom from './animation/componentAnimations/HeaderMoveCustom';
import * as HeaderFadeOut from './animation/componentAnimations/HeaderFadeOut';
import * as HeaderFadeOutCustom from './animation/componentAnimations/HeaderFadeOutCustom';
// Transitions
import * as noTransition from './transition/noTransition';
import * as crossFade from './transition/crossFade';
import * as outIn from './transition/outIn';
import * as slideHorizontal from './transition/slideHorizontal';
import * as slideVertical from './transition/slideVertical';
import * as shrink from './transition/shrink';
// In Animations
import * as arcInMobile from './animation/in/mobile/arcIn';
import * as dropInMobile from './animation/in/mobile/dropIn';
import * as expandInMobile from './animation/in/mobile/expandIn';
import * as fadeInMobile from './animation/in/mobile/fadeIn';
import * as flipInMobile from './animation/in/mobile/flipIn';
import * as floatInMobile from './animation/in/mobile/floatIn';
import * as flyInMobile from './animation/in/mobile/flyIn';
import * as foldInMobile from './animation/in/mobile/foldIn';
import * as revealMobile from './animation/in/mobile/reveal';
import * as slideInMobile from './animation/in/mobile/slideIn';
import * as spinInMobile from './animation/in/mobile/spinIn';
import * as turnInMobile from './animation/in/mobile/turnIn';
import * as bounceInMobile from './animation/in/mobile/bounceIn';
import * as glideInMobile from './animation/in/mobile/glideIn';
import * as dropClipInMobile from './animation/in/mobile/dropClipIn';
import * as cornerInMobile from './animation/in/mobile/cornerIn';
export const definitions = {
    defaults: [
        baseSequence,
        baseNone,
        baseFade,
        basePosition,
        baseScale,
        baseSkew,
        baseRotate,
        baseRotate3D,
        baseClip,
        baseClipPath,
        baseDimensions,
        baseScroll,
        baseAttribute,
        baseObjectProperties,
        baseClear,
        // General Animations
        fade,
        position,
        scale,
        rotate,
        sequence,
        clearSequence,
        timelineAnimation,
        // In Animations
        arcIn,
        dropIn,
        expandIn,
        fadeIn,
        flipIn,
        floatIn,
        flyIn,
        foldIn,
        reveal,
        slideIn,
        spinIn,
        turnIn,
        bounceIn,
        glideIn,
        // Out Animations
        arcOut,
        popOut,
        collapseOut,
        fadeOut,
        flipOut,
        floatOut,
        flyOut,
        foldOut,
        conceal,
        slideOut,
        spinOut,
        turnOut,
        bounceOut,
        glideOut,
        // Mode Transition Animations
        ModesMotionNoScale,
        ModesMotionNoDimensions,
        ModesMotionScale,
        // Background Smooth Scroll Effects Base
        baseBgFade,
        baseBgPositionX,
        baseBgPositionY,
        baseBgParallaxY,
        baseBgRotate,
        baseBgScale,
        baseBgSkew,
        baseBgZoom,
        baseBgClipPath,
        // background Smooth Scroll Effects
        // Stub
        backgroundParallaxZoom,
        // Classic
        bgParallax,
        bgReveal,
        bgFadeIn,
        // New
        bgZoomIn,
        bgZoomOut,
        bgCloseUp,
        bgPullBack,
        bgFadeOut,
        bgPanLeft,
        bgPanRight,
        bgRotate,
        bgUnwind,
        bgFake3D,
        bgSkew,
        bgFadeBack,
        bgShrink,
        bgExpand,
        // Background Scroll Effects
        siteBackgroundParallax,
        backgroundReveal,
        backgroundParallax,
        backgroundZoom,
        backgroundFadeIn,
        backgroundBlurIn,
        // Component specific animations
        headerHideToTop,
        HeaderMoveCustom,
        HeaderFadeOut,
        HeaderFadeOutCustom,
        // Transitions
        noTransition,
        crossFade,
        outIn,
        slideHorizontal,
        slideVertical,
        shrink,
    ],
    mobile: [
        // In Animations
        arcInMobile,
        dropInMobile,
        expandInMobile,
        fadeInMobile,
        flipInMobile,
        floatInMobile,
        flyInMobile,
        foldInMobile,
        revealMobile,
        slideInMobile,
        spinInMobile,
        turnInMobile,
        bounceInMobile,
        glideInMobile,
        dropClipInMobile,
        cornerInMobile,
    ],
};
//# sourceMappingURL=definitions.js.map