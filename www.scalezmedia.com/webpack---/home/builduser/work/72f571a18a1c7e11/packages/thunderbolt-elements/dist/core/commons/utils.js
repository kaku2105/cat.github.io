"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDataAttributes = exports.isSafari = exports.isEmptyObject = exports.isCSSMaskSupported = exports.performOnEnter = exports.isBrowser = exports.throttle2 = exports.throttle = exports.debounce = void 0;
const a11y_1 = require("./a11y");
const debounce = (fn, ms = 0) => {
    let timeoutId;
    return function(...args) {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
};
exports.debounce = debounce;
const throttle = (func, ms = 0) => {
    let isThrottled = false,
        savedArgs;

    function wrapper(...args) {
        if (isThrottled) {
            savedArgs = args;
            return;
        }
        func.apply(this, args);
        isThrottled = true;
        setTimeout(() => {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(this, savedArgs);
                savedArgs = null;
            }
        }, ms);
    }
    return wrapper;
};
exports.throttle = throttle;
const throttle2 = (fn, wait = 0) => {
    let isCalled = false;
    return function(...args) {
        if (!isCalled) {
            fn(...args);
            isCalled = true;
            setTimeout(function() {
                isCalled = false;
            }, wait);
        }
    };
};
exports.throttle2 = throttle2;
const isBrowser = () => typeof window !== `undefined`;
exports.isBrowser = isBrowser;
const performOnEnter = (fn) => {
    return function(event) {
        if (event.keyCode === a11y_1.keyCodes.enter) {
            fn(event);
        }
    };
};
exports.performOnEnter = performOnEnter;
const isCSSMaskSupported = () => {
    if (!exports.isBrowser()) {
        return true;
    }
    return (window.CSS &&
        window.CSS.supports('(mask-repeat: no-repeat) or (-webkit-mask-repeat: no-repeat)'));
};
exports.isCSSMaskSupported = isCSSMaskSupported;
const isEmptyObject = (obj) => !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
exports.isEmptyObject = isEmptyObject;
const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator === null || navigator === void 0 ? void 0 : navigator.userAgent);
exports.isSafari = isSafari;
const getDataAttributes = (props) => {
    return Object.entries(props).reduce((acc, [key, val]) => {
        if (key.includes('data-')) {
            acc[key] = val;
        }
        return acc;
    }, {});
};
exports.getDataAttributes = getDataAttributes;
//# sourceMappingURL=utils.js.map