const name = 'BackgroundParallaxZoom';
const properties = {
    hideOnStart: false,
    requestFullScreenHeight: true,
    groups: ['animation', 'background'],
    schema: {},
};
function register({ factory }) {
    /**
     * TODO: THIS IS A TEMP STUB FOR THE TRANSITION TO "Smooth Scroll" PROJECT https://jira.wixpress.com/browse/BOLT-2314
     */
    function animation(params) {
        const sequence = factory.sequence(params);
        return sequence.get();
    }
    factory.registerAnimation(name, animation, properties);
}
export { name, properties, register };
//# sourceMappingURL=backgroundParallaxZoom.js.map