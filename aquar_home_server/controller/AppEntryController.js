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
    appEntryDao.updateById(data.tabIndex,data.widget.id,data.widget)
    var resStr = await appEntryDao.findOneById(data.tabIndex,data.widget.id)
    ctx.body = resStr
  }
  async addWidget(ctx, next) {
    var data = ctx.request.body
    data.widget.id = uuidv4()
    // data.layout.i = data.id
    appEntryDao.saveAppEntry(data.tabIndex,data.widget)
    var resStr = await appEntryDao.findOneById(data.widget.id)
    ctx.body = resStr
  }
  async removeWidget(ctx, next) {
    var data = ctx.request.body
    appEntryDao.deleteById(data.tabIndex, data.id)
    var resStr = await appEntryDao.findByCurIndex()
    ctx.body = resStr
  }
  async allData(ctx, next) {
    var resStr = await appEntryDao.allData()
    ctx.body = resStr
  }
  async submitTabs(ctx, next) {
    var data = ctx.request.body
    appEntryDao.updateTabs(data)
    var resStr = await appEntryDao.allData()
    ctx.body = resStr
  }
  async addTab(ctx, next) {
    var data = ctx.request.body
    appEntryDao.addTab(data)
    var resStr = await appEntryDao.allData()
    ctx.body = resStr
  }
  
}
var appEntryController = new AppEntryController()
export default appEntryController