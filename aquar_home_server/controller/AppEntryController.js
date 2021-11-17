import appDao from '../service/db/app-dao.js'
import { v4 as uuidv4 } from 'uuid'
class AppEntryController {
  async list(ctx, next) {
    var index = ctx.query.index
    var resStr = await appDao.findByCurIndex()
    ctx.body = resStr
  }
  async updateById(ctx, next) {
    var data = ctx.request.body
    // data = JSON.parse(data)
    console.log(data)
    appDao.updateById(data.tabIndex,data.widget.id,data.widget)
    var resStr = await appDao.findOneById(data.tabIndex,data.widget.id)
    ctx.body = resStr
  }
  async addWidget(ctx, next) {
    var data = ctx.request.body
    data.widget.id = uuidv4()
    // data.layout.i = data.id
    appDao.saveAppEntry(data.tabIndex,data.widget)
    var resStr = await appDao.findOneById(data.widget.id)
    ctx.body = resStr
  }
  async removeWidget(ctx, next) {
    var data = ctx.request.body
    appDao.deleteById(data.tabIndex, data.id)
    var resStr = await appDao.findByCurIndex()
    ctx.body = resStr
  }
  async allData(ctx, next) {
    var resStr = await appDao.allData()
    ctx.body = resStr
  }
  async submitTabs(ctx, next) {
    var data = ctx.request.body
    appDao.updateTabs(data)
    var resStr = await appDao.allData()
    ctx.body = resStr
  }
  async addTab(ctx, next) {
    var data = ctx.request.body
    appDao.addTab(data)
    var resStr = await appDao.allData()
    ctx.body = resStr
  }
  
}
var appEntryController = new AppEntryController()
export default appEntryController