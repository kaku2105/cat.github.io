import { toArray } from '../../utils/generalUtils';
const name = 'BaseObjectProps';
const properties = {};
function register({ engine, factory }) {
    /**
     * Base Animation to mutate object properties
     */
    function animation(objects, duration = 0, delay = 0, params = {}) {
        objects = toArray(objects);
        const paramsSet = new Set(objects.reduce((acc, object) => acc.concat(Object.keys(object)), []));
        const allowedParams = Array.from(paramsSet);
        return engine.tween(objects, Object.assign({ duration, delay }, params), allowedParams);
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=baseObjectProperties.js.map