const deg2rad = (angleInDeg) => (angleInDeg * Math.PI) / 180;
const getMediaDimensions = (width, height) => ({
    width,
    height,
});
const getFullHeightMedia = (width, height, screenHeight) => ({
    width,
    height: Math.max(height, screenHeight),
});
function getMaxRotateBounds(width, height, angleInDeg) {
    const angleInRad = deg2rad(angleInDeg);
    const radius = Math.hypot(width, height) / 2;
    const travelAngle = Math.acos(width / 2 / radius);
    const boundingWidth = width * Math.abs(Math.cos(angleInRad)) +
        height * Math.abs(Math.sin(angleInRad));
    const boundingHeight = width * Math.abs(Math.sin(angleInRad)) +
        height * Math.abs(Math.cos(angleInRad));
    const minimalWidth = Math.ceil(angleInRad < travelAngle ? boundingWidth : radius * 2);
    const minimalHeight = Math.ceil(angleInRad < deg2rad(90) - travelAngle ? boundingHeight : radius * 2);
    return { width: minimalWidth, height: minimalHeight };
}
function getMaxSkewYBounds(width, height, angleInDeg) {
    const angleInRad = deg2rad(angleInDeg);
    return { width, height: width * Math.tan(angleInRad) + height };
}
const panSpeed = 0.2;
const rotateAngle = 22;
const skewAngle = 20;
const zoomScale = 1.15;
const BackgroundParallax = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BackgroundParallaxZoom = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BackgroundReveal = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BgCloseUp = { getMediaDimensions };
const BgExpand = { getMediaDimensions };
const BgFabeBack = { getMediaDimensions };
const BgFadeIn = { getMediaDimensions };
const BgFadeOut = { getMediaDimensions };
const BgFake3D = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BgPanLeft = {
    getMediaDimensions: (width, height) => ({
        width: width * (1 + panSpeed),
        height,
    }),
};
const BgPanRight = {
    getMediaDimensions: (width, height) => ({
        width: width * (1 + panSpeed),
        height,
    }),
};
const BgParallax = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BgPullBack = { getMediaDimensions };
const BgReveal = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BgRotate = {
    getMediaDimensions: (width, height) => getMaxRotateBounds(width, height, rotateAngle),
};
const BgShrink = { getMediaDimensions };
const BgSkew = {
    getMediaDimensions: (width, height) => getMaxSkewYBounds(width, height, skewAngle),
};
const BgUnwind = { getMediaDimensions };
const BgZoomIn = {
    hasParallax: true,
    getMediaDimensions: getFullHeightMedia,
};
const BgZoomOut = {
    getMediaDimensions: (width, height) => ({
        width: width * zoomScale,
        height: height * zoomScale,
    }),
};
export { 
// Legacy
BackgroundParallax, BackgroundParallaxZoom, BackgroundReveal, 
// New
BgCloseUp, BgExpand, BgFabeBack, BgFadeIn, BgFadeOut, BgFake3D, BgPanLeft, BgPanRight, BgParallax, BgPullBack, BgReveal, BgRotate, BgShrink, BgSkew, BgUnwind, BgZoomIn, BgZoomOut, };
//# sourceMappingURL=mediaResizeMap.js.map