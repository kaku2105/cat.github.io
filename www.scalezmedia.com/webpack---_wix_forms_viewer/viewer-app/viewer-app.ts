const viewerImpl = require('./viewer-app-impl')

module.exports = {
  initAppForPage: viewerImpl.initAppForPage,
  createControllers: viewerImpl.createControllers,
}
