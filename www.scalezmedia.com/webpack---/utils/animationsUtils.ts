import { deg2rad } from './generalUtils';
/**
 * Get clipPath values by direction
 */
function getClipParams(compRect, contentRect, direction, { useClipRect = false, inset = false, scaleX = 1, scaleY = 1, minimum = 0, } = {}) {
    if (useClipRect) {
        return getClipRectParams(compRect, direction, {
            scaleX,
            scaleY,
            minimum,
        });
    }
    return inset
        ? getClipInsetParams(compRect, contentRect, direction, {
            scaleX,
            scaleY,
            minimum,
        })
        : getClipPolygonParams(compRect, contentRect, direction, {
            scaleX,
            scaleY,
            minimum,
        });
}
function getClipRectParams(compRect, direction, { scaleX = 1, scaleY = 1, minimum = 0 } = {}) {
    let top = (compRect.height * (1 - scaleY)) / 2;
    let left = (compRect.width * (1 - scaleX)) / 2;
    let width = (compRect.width * (1 + scaleX)) / 2;
    let height = (compRect.height * (1 + scaleY)) / 2;
    const min = minimum / 100;
    if (direction === 'center') {
        top = (height * (1 - min)) / 2;
        height = (height * (1 + min)) / 2;
        left = (width * (1 - min)) / 2;
        width = (width * (1 + min)) / 2;
    }
    else if (direction === 'top') {
        height *= min;
    }
    else if (direction === 'bottom') {
        top = height * min;
    }
    else if (direction === 'left') {
        width *= min;
    }
    else if (direction === 'right') {
        left = width * min;
    }
    return {
        clip: `rect(${top}px ${width}px ${height}px ${left}px)`,
    };
}
function getClipPolygonParams(compRect, contentRect, direction, { scaleX = 1, scaleY = 1, minimum = 0 } = {}) {
    const top = ((contentRect.top - compRect.top) / compRect.height) * 100 +
        ((1 - scaleY) / 2) * 100;
    const left = ((contentRect.left - compRect.left) / compRect.width) * 100 +
        ((1 - scaleX) / 2) * 100;
    const right = (contentRect.width / compRect.width) * 100 + left - (1 - scaleX) * 100; // eslint-disable-line no-extra-parens
    const bottom = (contentRect.height / compRect.height) * 100 + top - (1 - scaleY) * 100; // eslint-disable-line no-extra-parens
    const centerX = (right + left) / 2;
    const centerY = (bottom + top) / 2;
    const clipParams = {
        initial: `${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%`,
        top: `${left}% ${top}%, ${right}% ${top}%, ${right}% ${top + minimum}%, ${left}% ${top + minimum}%`,
        right: `${right - minimum}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${right - minimum}% ${bottom}%`,
        center: `${centerX - minimum / 2}% ${centerY - minimum / 2}%, ${centerX + minimum / 2}% ${centerY - minimum / 2}%, ${centerX + minimum / 2}% ${centerY + minimum / 2}%, ${centerX - minimum / 2}% ${centerY + minimum / 2}%`,
        bottom: `${left}% ${bottom - minimum}%, ${right}% ${bottom - minimum}%, ${right}% ${bottom}%, ${left}% ${bottom}%`,
        left: `${left}% ${top}%, ${left + minimum}% ${top}%, ${left + minimum}% ${bottom}%, ${left}% ${bottom}%`,
    };
    return {
        webkitClipPath: `polygon(${clipParams[direction]})`,
        clipPath: `polygon(${clipParams[direction]})`,
    };
}
function getClipInsetParams(compRect, contentRect, direction, { scaleX = 1, scaleY = 1, minimum = 0 } = {}) {
    const { width, height } = contentRect;
    const top = contentRect.top - compRect.top + (compRect.height * (1 - scaleY)) / 2;
    const left = contentRect.left - compRect.left + (compRect.width * (1 - scaleX)) / 2;
    const right = compRect.width -
        contentRect.width -
        left +
        ((compRect.width - contentRect.left - compRect.left) * (1 - scaleX)) / 2;
    const bottom = compRect.height -
        contentRect.height -
        top +
        ((compRect.height - contentRect.top - compRect.top) * (1 - scaleY)) / 2;
    const min = 1 - minimum / 100;
    const clipParams = {
        initial: `${top}px ${right}px ${bottom}px ${left}px`,
        top: `${top}px ${right}px ${(height + bottom) * min}px ${left}px`,
        right: `${top}px ${right}px ${bottom}px ${(width + left) * min}px`,
        center: `${(top + height / 2) * min}px ${(right + width / 2) * min}px ${(bottom + height / 2) * min}px ${(left + width / 2) * min}px`,
        bottom: `${(height + top) * min}px ${right}px ${bottom}px ${left}px`,
        left: `${top}px ${(width + right) * min}px ${bottom}px ${left}px`,
    };
    return {
        webkitClipPath: `inset(${clipParams[direction]})`,
        clipPath: `inset(${clipParams[direction]})`,
    };
}
/**
 * Get ScaleX and ScaleY params for ClipPath fallback
 */
function getClipFallbackParams(direction) {
    const fallbackParams = {
        initial: { scaleX: 1, scaleY: 1 },
        top: { scaleX: 1, scaleY: 0 },
        right: { scaleX: 0, scaleY: 1 },
        center: { scaleY: 0, scaleX: 0 },
        bottom: { scaleX: 1, scaleY: 0 },
        left: { scaleX: 0, scaleY: 1 },
    };
    return fallbackParams[direction];
}
/**
 * Adjust direction by angle from predefined list
 */
function getAdjustedDirection(paramsMap, direction, angleInDeg) {
    const directions = Object.keys(paramsMap);
    const index = paramsMap[direction].idx;
    const shiftBy = Math.round(angleInDeg / 90);
    const newIndex = (index + (directions.length - 1) * shiftBy) % directions.length; // eslint-disable-line no-mixed-operators
    return directions[newIndex];
}
// Transforms for clip
/**
 * Transform position to compensate existing rotate and transformOrigin
 */
function getElementTransformedPosition(origin, compRect, angleInRad) {
    const centerX = compRect.width / 2;
    const centerY = compRect.height / 2;
    const originX = (compRect.width * parseInt(origin.x, 10)) / 100;
    const originY = (compRect.height * parseInt(origin.y, 10)) / 100;
    const toX = centerX - centerX * Math.cos(angleInRad) + centerY * Math.sin(angleInRad);
    const toY = centerY - centerX * Math.sin(angleInRad) - centerY * Math.cos(angleInRad);
    const fromX = originX - originX * Math.cos(angleInRad) + originY * Math.sin(angleInRad);
    const fromY = originY - originX * Math.sin(angleInRad) - originY * Math.cos(angleInRad);
    const x = toX - fromX;
    const y = toY - fromY;
    return { x, y };
}
function getTransformOriginTweenParams(compRect, contentRect, origin) {
    const x = contentRect.left +
        contentRect.width * (parseInt(origin.x, 10) / 100) -
        compRect.left;
    const y = contentRect.top +
        contentRect.height * (parseInt(origin.y, 10) / 100) -
        compRect.top;
    return `${x}px ${y}px`;
}
/**
 * Measure component and adjust positioning to new transform origin
 */
function setSmoothTransformOrigin(element, transformOrigin, animate) {
    const before = element.getBoundingClientRect();
    element.style.transformOrigin = transformOrigin;
    const after = element.getBoundingClientRect();
    return animate('BasePosition', element, 0, 0, {
        x: `+=${before.left - after.left}`,
        y: `+=${before.top - after.top}`,
        immediateRender: true,
    });
}
function getTransformTweenParams(contentRect, originDirection, angleInRad, scale = 1) {
    const width = contentRect.width * scale;
    const height = contentRect.height * scale;
    const x = originDirection.dy * height * Math.sin(-angleInRad) +
        originDirection.dx * width * Math.cos(angleInRad); // eslint-disable-line no-mixed-operators
    const y = originDirection.dy * height * Math.cos(-angleInRad) +
        originDirection.dx * width * Math.sin(angleInRad); // eslint-disable-line no-mixed-operators
    return { x, y };
}
/**
 * x' = x * cos (a) - y * sin (a)
 * y' = x * sin (a) + y * cos (a)
 */
function translatePoint(x, y, angleInDeg) {
    const angleInRad = deg2rad(angleInDeg);
    return {
        x: x * Math.cos(angleInRad) - y * Math.sin(angleInRad),
        y: x * Math.sin(angleInRad) + y * Math.cos(angleInRad), // eslint-disable-line no-mixed-operators
    };
}
// Modes calculations
function calculateScaleDeviation(compRect, from) {
    const to = {
        width: compRect.width,
        height: compRect.height,
    };
    return {
        x: (from.width - to.width) / 2,
        y: (from.height - to.height) / 2,
    };
}
function getPositionParams(compRect, from, calculateScale = false) {
    const defaultScale = { x: 0, y: 0 };
    const scaleDeviation = calculateScale
        ? calculateScaleDeviation(compRect, from)
        : defaultScale;
    const x = from.left - compRect.left + scaleDeviation.x;
    const y = from.top - compRect.top + scaleDeviation.y;
    return { x, y };
}
function getScaleParams(compRect, from) {
    const scaleX = from.width / compRect.width;
    const scaleY = from.height / compRect.height;
    return { scaleX, scaleY };
}
function getRotatedBoundingRectScale(width, height, angleInDeg) {
    const angleInRad = deg2rad(angleInDeg);
    const newHeight = width * Math.abs(Math.sin(angleInRad)) +
        height * Math.abs(Math.cos(angleInRad));
    const newWidth = width * Math.abs(Math.cos(angleInRad)) +
        height * Math.abs(Math.sin(angleInRad));
    return Math.max(newHeight / height, newWidth / width);
}
// minimal bounding box for a given angle
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
    return {
        width: minimalWidth,
        height: minimalHeight,
        scale: Math.max(minimalHeight / height, minimalWidth / width),
    };
}
function getMaxSkewYBounds(width, height, angleInDeg) {
    const angleInRad = deg2rad(angleInDeg);
    return { width, height: width * Math.tan(angleInRad) + height };
}
/**
 * getRelativeTravel predefined Animation types, see https://docs.google.com/spreadsheets/d/1s35BeeEt5TI7WYNsW0Uc7C7U1TNpfcCjTD-B2Nfw92A/edit?ts=5f7447ef#gid=0
 */
const TRAVEL_TYPES = {
    // For "continuous" animations, we want to just devide the travel with max travel to get the relative position on the timeline
    normal: (travel, { maxTravelHeight }) => travel / maxTravelHeight,
    // For "legacy_in" animations, we want to trim the timeline from the end, get to the fully visible component faster when in first/last fold
    legacy_in: (travel, { maxTravelHeight, travelLastFold, travelFirstFold, }) => Math.min(travel, travelLastFold, travelFirstFold) / maxTravelHeight,
    // For "in" animations, we want to trim the timeline from the end, get to the fully visible component faster when in last fold
    in_last_fold: (travel, { maxTravelHeight, travelLastFold, }) => Math.min(travel, travelLastFold) / maxTravelHeight,
    // For "out" animations we want to push the start of the animation where the component is postioned on first fold
    out_first_fold: (travel, { maxTravelHeight, extraOutDistance, }) => Math.min(1, (extraOutDistance + travel) / maxTravelHeight),
    // To create custom function:
    // function(travel, {maxTravelHeight, travelLastFold, componentBottom, extraOutDistance}) {return a value beween 0 and 1}
};
/**
 * Get animation travel values relative to component height and viewport height
 * with normalized values by animation type and component position on the site
 */
function getTravelMap(componentHeight, componentTop, siteHeight, viewPortHeight, getRelativeTravel = TRAVEL_TYPES.normal) {
    // The max travel of a visible component
    const travelParams = {
        maxTravelHeight: componentHeight + viewPortHeight,
        // The distance from the end of the site.
        // If it is less than max travel we are in "last fold",
        travelLastFold: siteHeight - componentTop,
        // The component bottom.
        // If it is less than max travel then we are in "first fold", (normalize very large components to viewport height)
        travelFirstFold: Math.min(componentHeight, viewPortHeight) + componentTop,
        // The distance of the component from the bottom of the viewport.
        // If we are not in the first fold, normalize to 0
        extraOutDistance: Math.max(0, viewPortHeight - componentTop),
    };
    const travels = {
        TOP_TO_BOTTOM: getRelativeTravel(viewPortHeight * 0.0 + componentHeight * 0.0, travelParams),
        TOP_TO_CENTER: getRelativeTravel(viewPortHeight * 0.5 + componentHeight * 0.0, travelParams),
        TOP_TO_TOP: getRelativeTravel(viewPortHeight * 1.0 + componentHeight * 0.0, travelParams),
        CENTER_TO_BOTTOM: getRelativeTravel(viewPortHeight * 0.0 + componentHeight * 0.5, travelParams),
        CENTER_TO_CENTER: getRelativeTravel(viewPortHeight * 0.5 + componentHeight * 0.5, travelParams),
        CENTER_TO_TOP: getRelativeTravel(viewPortHeight * 1.0 + componentHeight * 0.5, travelParams),
        BOTTOM_TO_BOTTOM: getRelativeTravel(viewPortHeight * 0.0 + componentHeight * 1.0, travelParams),
        BOTTOM_TO_CENTER: getRelativeTravel(viewPortHeight * 0.5 + componentHeight * 1.0, travelParams),
        BOTTOM_TO_TOP: getRelativeTravel(viewPortHeight * 1.0 + componentHeight * 1.0, travelParams), // eslint-disable-line key-spacing
    };
    const withOffset = (travel, percentageOfVh) => Math.min(1, Math.max(0, travel + (travels.TOP_TO_TOP * percentageOfVh) / 100));
    const isInFirstFold = componentTop < viewPortHeight;
    const isInLastFold = siteHeight - (componentTop + componentHeight) < viewPortHeight;
    return Object.assign(Object.assign({}, travels), { withOffset,
        isInFirstFold,
        isInLastFold });
}
export { getClipParams, getClipFallbackParams, getAdjustedDirection, getPositionParams, getScaleParams, getElementTransformedPosition, getTransformOriginTweenParams, getTransformTweenParams, getRotatedBoundingRectScale, getMaxRotateBounds, getMaxSkewYBounds, translatePoint, setSmoothTransformOrigin, getTravelMap, TRAVEL_TYPES, };
//# sourceMappingURL=animationsUtils.js.map