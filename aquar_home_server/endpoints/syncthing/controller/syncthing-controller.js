const getFoldersInfo = require('../service/syncthing-service')

class SyncThingController {
  async getFoldersInfo(ctx, next) {
    var server = ctx.query.server
    var appKey = ctx.query.appKey
    ctx.body = await getFoldersInfo(server, appKey)
  }
}

syncThingController = new SyncThingController()
module.exports = syncThingController