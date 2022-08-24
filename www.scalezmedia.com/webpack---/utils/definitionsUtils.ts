import { __rest } from "tslib";
/**
 * Animation properties, (like threshold, hideOnStart etc.)
 * Properties are by animation name, so we assume the properties on the default animation are correct
 * and collect from other view modes only those who doesn't have defaults
 */
function getAllAnimationProperties(_a) {
    var { defaults } = _a, viewModes = __rest(_a, ["defaults"]);
    const defaultProperties = defaults.reduce((acc, animationDef) => {
        acc[animationDef.name] = animationDef.properties;
        return acc;
    }, {});
    const viewModesProperties = Object.entries(viewModes).map(([, definitions]) => definitions.reduce((acc, animationDef) => {
        if (!defaultProperties[animationDef.name]) {
            acc[animationDef.name] = animationDef.properties;
        }
        return acc;
    }, {}));
    return Object.assign({}, defaultProperties, ...viewModesProperties);
}
/**
 * Return a combination of animations defs fom defaults + passed viewMode
 */
function getAnimationDefsByViewMode(defaultDefs, viewModeDefs = []) {
    const viewModeNames = viewModeDefs.map((def) => def.name);
    return defaultDefs
        .filter((def) => !viewModeNames.includes(def.name))
        .concat(viewModeDefs);
}
/**
 * Normalize view mode to lower case, and default to internal 'defaults' for 'desktop' viewMode
 * We need this to deal with Santa getViewMode()
 */
function getAnimationMode(viewMode = '') {
    const normalizedViewMode = viewMode.toLowerCase();
    return normalizedViewMode !== 'desktop'
        ? normalizedViewMode
        : 'defaults';
}
export { getAllAnimationProperties, getAnimationDefsByViewMode, getAnimationMode, };
//# sourceMappingURL=definitionsUtils.js.map