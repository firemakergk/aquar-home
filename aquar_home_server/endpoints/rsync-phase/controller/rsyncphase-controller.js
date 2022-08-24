import appDao from '../../../service/db/app-dao.js'
import RsyncTaskService from '../service/task-service.js'
import rsyncService from '../service/rsync-service.js'
import StringUtil from '../../../utils/string-util.js'
import childprocess from 'child_process'
import path from "path"
import { v4 as uuidv4 } from 'uuid'
import dateFormat from "dateformat";
import _ from 'lodash'

const exec = childprocess.execSync
const baseDir = '/opt/aquarpool/'
const taskService = new RsyncTaskService()


class RsyncphaseController {

  async prepareArchive(ctx, next) {
    if (!ctx.query.source) {
      ctx.throw(400, {code:1,msg:'source required'});
    }
    if (!ctx.query.archiveDir) {
      ctx.throw(400, {code:1,msg:'archiveDir required'});
    }
    var source = ctx.query.source
    var archiveDir = ctx.query.archiveDir
    var archiveName = ctx.query.archiveName
    
    let res = rsyncService.genScript(source, archiveDir,archiveName)
    ctx.body = {code:0,msg:res}
  }
  async startArchive(ctx, next) {
    if (!ctx.query.tabIndex || !ctx.query.id || !ctx.query.itemId) {
      ctx.throw(400, {code:1,msg:'bad request'});
    }
    let tabIndex = ctx.query.tabIndex
    let id = ctx.query.id
    let itemId = ctx.query.itemId
    let widget = appDao.findOne(tabIndex, id)
    let item = _.find(widget.data.items,{id:itemId})
    var source = item.source
    var archiveDir = item.archive_dir_name
    var archiveName = item.phase_name
    let res = await rsyncService.execSync(source, archiveDir, archiveName)
    rsyncService.updateLastSyncTime(tabIndex, id,itemId)
    ctx.body = {code:0,msg:res}
  }
  async addNewItem(ctx, next) {
    var id = ctx.request.body.id
    var item = ctx.request.body.item
    var tabIndex = ctx.request.body.tabIndex
    var db = appDao.getDbInstance()
    item.id = uuidv4()
    db.chain
    .get('tabs['+tabIndex+'].widgets')
    .find({ id: id })
    .get('data')
    .get('items')
    .push(item).value()
    db.write()
    var res = appDao.findOne(tabIndex,id).data.items
    ctx.body =  {code:0,data:res}
  }
  async updateItem(ctx, next) {
    // let nowDate = new Date()
    console.log(dateFormat("yyyy-mmfd-dd HHfff:MMabc:ssabc"))
    var id = ctx.request.body.id
    var item = ctx.request.body.item
    var tabIndex = ctx.request.body.tabIndex
    var db = appDao.getDbInstance()
    if(!item.id){
      return {code:-1,data:"该组件数据格式不兼容，请删除该组件后重新添加"}
    }
    let oldCron = rsyncService.queryCron(tabIndex,id,item.id)
    db.chain
    .get('tabs['+tabIndex+'].widgets')
    .find({ 'id': id })
    .get('data')
    .get('items').find({ 'id': item.id })
    .assign(item).value()
    db.write()
    if(oldCron != item.cron){
      taskService.updateCron([item])
    }
    var res = appDao.findOne(tabIndex,id).data.items
    ctx.body = {code:0,data:res}
  }

  async removeItem(ctx, next) {
    var id = ctx.request.body.id
    var itemId = ctx.request.body.itemId
    var tabIndex = ctx.request.body.tabIndex
    var db = appDao.getDbInstance()
    if(!itemId){
      ctx.body = {code:-1,data:"该组件数据格式不兼容，请删除该组件后重新添加"}
      return
    }
    db.chain
    .get('tabs['+tabIndex+'].widgets')
    .find({ 'id': id })
    .get('data')
    .get('items').remove((value, index, array) => {
      return value.id === itemId
    }).value()
    db.write()
    var res = appDao.findOne(tabIndex,id).data.items
    ctx.body = {code:0,data:res}
  }
}


var rsyncphaseController = new RsyncphaseController()
export default rsyncphaseController