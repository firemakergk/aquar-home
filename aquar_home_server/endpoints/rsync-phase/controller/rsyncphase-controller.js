const appEntryDao = require('../../../service/db/app-entry')
const exec = require('child_process').execSync
const path = require("path")
const baseDir = '/opt/aquarpool/'

class RsyncphaseController {
  async prepareArchive(ctx, next) {
    if (!ctx.query.source) {
      ctx.throw(400, {code:1,msg:'source required'});
    }
    var source = baseDir + ctx.query.source
    var archiveDir = ctx.query.archiveDir
    var archiveName = ctx.query.archiveName
    
    let shPath = path.resolve('endpoints/rsync-phase/sh/sync_phase.sh')
    let extParam = ''
    if(archiveDir) {
      extParam += ' -a=' + baseDir + archiveDir
    }
    if(archiveName) {
      extParam += ' -n=' + baseDir + archiveName
    }
    let res = '/bin/bash ' + shPath +' -s=' + source + extParam
    ctx.body = {code:0,msg:res}
  }
  async startArchive(ctx, next) {
    if (!ctx.query.source) {
      ctx.throw(400, {code:1,msg:'source required'});
    }
    var source = baseDir + ctx.query.source
    var archiveDir = ctx.query.archiveDir
    var archiveName = ctx.query.archiveName
    if (!source) {
      ctx.throw(400, {code:1,msg:'source required'});
    }
    let shPath = path.resolve('endpoints/rsync-phase/sh/sync_phase.sh')
    let extParam = ''
    if(archiveDir) {
      extParam += ' -a=' + baseDir + archiveDir
    }
    if(archiveName) {
      extParam += ' -n=' + baseDir + archiveName
    }
    let res = await new Promise((resolve,reject) => resolve(exec('/bin/bash ' + shPath +' -s=' + source + extParam).toString()))
    ctx.body = {code:0,msg:res}
  }
  async addNewItem(ctx, next) {
    var id = ctx.request.body.id
    var item = ctx.request.body.item
    appEntryDao.getDbInstance()
      .get('widgets').find({ 'id': id })
      .get('data')
      .get('items')
      .push(item)
      .write()
    let res = appEntryDao.getDbInstance()
      .get('widgets').find({ 'id': id })
      .get('data')
      .get('items')
      .value()
      ctx.body =  {code:0,data:res}
  }
  async updateItem(ctx, next) {
    var id = ctx.request.body.id
    var index = ctx.request.body.index
    var item = ctx.request.body.item
    appEntryDao.getDbInstance()
      .get('widgets').find({ 'id': id })
      .get('data')
      .get('items').nth(index)
      .assign(item)
      .write()
    let res = appEntryDao.getDbInstance()
    .get('widgets').find({ 'id': id })
    .get('data')
    .get('items')
    .value() 
    ctx.body = {code:0,data:res}
  }
  async removeItem(ctx, next) {
    var id = ctx.request.body.id
    var index = ctx.request.body.index
    var items = appEntryDao.getDbInstance()
      .get('widgets').find({ 'id': id })
      .get('data')
      .get('items').value()
    items.remove(index)
    var res = appEntryDao.getDbInstance()
      .get('widgets').find({ 'id': id })
      .get('data')
      .set('items',items).write()
    ctx.body = {code:0,data:items}
  }
}


rsyncphaseController = new RsyncphaseController()
module.exports = rsyncphaseController