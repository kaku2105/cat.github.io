"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.linkPropsSDKFactory = exports.getLink = exports.setLink = void 0;
const editor_elements_corvid_utils_1 = require("@wix/editor-elements-corvid-utils");
const setLink = (url, target, linkUtils, setProps) => {
    if (editor_elements_corvid_utils_1.assert.isNil(url) || url === '') {
        setProps({
            link: undefined,
        });
        return;
    }
    try {
        setProps({
            link: linkUtils.getLinkProps(url, target),
        });
    } catch (e) {
        editor_elements_corvid_utils_1.reportError(`The link property that is passed to the link method cannot be set to the value "${url}" as this is not a supported link type.`);
    }
};
exports.setLink = setLink;
const getLink = (props, linkUtils) => props.link ? linkUtils.getLink(props.link) : '';
exports.getLink = getLink;
const _linkPropsSDKFactory = ({
    setProps,
    props,
    platformUtils: {
        linkUtils
    }
}) => {
    return {
        set link(url) {
            var _a;
            exports.setLink(url, (_a = props.link) === null || _a === void 0 ? void 0 : _a.target, linkUtils, setProps);
        },
        get link() {
            return exports.getLink(props, linkUtils);
        },
        set target(target) {
            setProps({
                link: Object.assign(Object.assign({}, props.link), {
                    target
                }),
            });
        },
        get target() {
            var _a, _b;
            return (_b = (_a = props.link) === null || _a === void 0 ? void 0 : _a.target) !== null && _b !== void 0 ? _b : '_blank';
        },
    };
};
exports.linkPropsSDKFactory = editor_elements_corvid_utils_1.withValidation(_linkPropsSDKFactory, {
    type: ['object'],
    properties: {
        link: {
            type: ['string', 'nil'],
            warnIfNil: true
        },
        target: {
            type: ['string', 'nil'],
            warnIfNil: true
        },
    },
}, {
    target: [
        (target) => {
            if (target === '_blank' || target === '_self') {
                return true;
            }
            editor_elements_corvid_utils_1.reportError(editor_elements_corvid_utils_1.messageTemplates.error_target_w_photo({
                target
            }));
            if (editor_elements_corvid_utils_1.assert.isNil(target)) {
                return true;
            }
            return false;
        },
    ],
});
//# sourceMappingURL=linkPropsSDKFactory.js.map