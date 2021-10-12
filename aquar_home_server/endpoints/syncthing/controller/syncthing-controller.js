import getFoldersInfo from '../service/syncthing-service.js'

class SyncThingController {
  async getFoldersInfo(ctx, next) {
    var server = ctx.query.server
    var appKey = ctx.query.appKey
    ctx.body = await getFoldersInfo(server, appKey)
  }
}

var syncThingController = new SyncThingController()
export default syncThingController