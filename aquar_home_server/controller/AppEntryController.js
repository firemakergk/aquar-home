import appEntryDao from '../service/db/app-entry.js'
import { v4 as uuidv4 } from 'uuid'
class AppEntryController {
  async list(ctx, next) {
    var index = ctx.query.index
    var resStr = await appEntryDao.findByCurIndex()
    ctx.body = resStr
  }
  async updateById(ctx, next) {
    var data = ctx.request.body
    // data = JSON.parse(data)
    console.log(data)
    appEntryDao.updateById(data.id,data)
    var resStr = await appEntryDao.findOneById(data.id)
    ctx.body = resStr
  }
  async addWidget(ctx, next) {
    var data = ctx.request.body
    data.id = uuidv4()
    // data.layout.i = data.id
    appEntryDao.saveAppEntry(data)
    var resStr = await appEntryDao.findOneById(data.id)
    ctx.body = resStr
  }
  async removeWidget(ctx, next) {
    var data = ctx.request.body
    appEntryDao.deleteById(data.id)
    var resStr = await appEntryDao.findAllBySort()
    ctx.body = resStr
  }
}
var appEntryController = new AppEntryController()
export default appEntryController