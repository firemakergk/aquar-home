import appDao from '../service/db/app-dao.js'
import { v4 as uuidv4 } from 'uuid'
import widgetAdvicer from '../service/widget-advicer.js'
class WidgetController {
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
    appDao.saveAppEntry(data.tabIndex,data.widget)
    await widgetAdvicer.afterWidgetAdded(data.tabIndex,data.widget)
    var resStr = await appDao.findOneById(data.widget.id)
    ctx.body = resStr
  }
  async addWidgetBatch(ctx, next) {
    var data = ctx.request.body
    var widgets = data.widgets
    for(var i=0;i<widgets.length;i++){
      widgets[i].id = uuidv4()
      appDao.saveAppEntry(data.tabIndex,widgets[i])
      await widgetAdvicer.afterWidgetAdded(data.tabIndex,widgets[i])
    }
    ctx.body = {code:0,msg:'插入成功'}
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
    var data = {title:"新标签",widgets:[]}
    appDao.addTab(data)
    var resStr = await appDao.allData()
    ctx.body = resStr
  }
  async removeTab(ctx, next) {
    var data = ctx.request.body
    appDao.removeTab(data.tabIndex)
    var resStr = await appDao.allData()
    ctx.body = resStr
  }
  
}
var widgetController = new WidgetController()
export default widgetController