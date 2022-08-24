"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getQaDataAttributes = void 0;
const getQaDataAttributes = (isQaMode, fullNameCompType) => isQaMode ?
    {
        'data-comp': fullNameCompType,
        'data-aid': fullNameCompType,
    } :
    {};
exports.getQaDataAttributes = getQaDataAttributes;
//# sourceMappingURL=qaUtils.js.map