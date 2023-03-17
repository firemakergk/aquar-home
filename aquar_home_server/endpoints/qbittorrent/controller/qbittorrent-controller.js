import axios from 'axios'
import multer from '@koa/multer'
import fs from 'fs'
import appDao from '../../../service/db/app-dao.js'
import _ from 'lodash'
import qbittorrentService from '../service/qbittorrent-service.js'
import toString from 'stream-to-string'
const TORRENT_PATH = '/var/aquardata/cache/'

if (!fs.existsSync(TORRENT_PATH)){
  fs.mkdirSync(TORRENT_PATH, { recursive: true });
}

// const torrentStorage = multer.memoryStorage()
const torrentStorage = multer.diskStorage({
  destination: TORRENT_PATH,
  filename(ctx,file,cb){
    if(file.fieldname === "data"){
      toString(file.stream).then(msg => {
        console.log(msg)
        ctx.body.formData = msg
      })
      toString(file.stream,  function (err, msg) {
        console.log(msg)
      })
      // ctx.formData = JSON.parse(ctx.files.data[0].buffer.toString())
      cb(null, "cache_formdata")
    }else if(file.fieldname === "file"){
      // ctx. = 
      cb(null, file.originalname)
    }
    ctx.torrentName = file.filename
  }
})
class QbittorrentController {
  torrentUpload = multer({ storage: torrentStorage })

  async addTorrent(ctx, next) {
    let data = JSON.parse(ctx.request.body.formData)
    let fileName = ctx.files.file ? ctx.files.file[0].originalname : ''
    let torrentPath = TORRENT_PATH+fileName
    let widget = appDao.findOne(data.tabIndex,data.id)
    let auth = appDao.getAuth()
    if(!widget || !auth.secret){
      ctx.body = {code:-1, msg:'操作失败'}
      return
    }
    let res = null
    if(data.type==='torrent'){
      qbittorrentService.addTorrent(data.server, widget.data.sid, fileName,torrentPath)
    }else if(data.type==='magnet'){
      qbittorrentService.addMagnet(data.server, widget.data.sid, data.magnet)
    }
    if(res){
      ctx.body = {code:0, msg:'操作成功'}
    } else {
      ctx.body = {code:-1, msg:'操作失败'}
    }
  }

  async torrentList(ctx, next) {
    var tabIndex = parseInt(ctx.request.body.tabIndex)
    var id = ctx.request.body.id
    var server = ctx.request.body.server
    var widget = appDao.findOne(tabIndex,id)
    var auth = appDao.getAuth()
    if(!widget || !auth.secret){
      ctx.body = {code:-1, msg:'操作失败'}
      return
    }
    
    // let res = await qbittorrentService.getTorrentList(server,widget.data.sid)
    // if(res.code === 403){
    //   if(!token){
    //     return {code: -1 ,msg:"token丢失,请重新输入用户名密码"}
    //   }
    //   let authData = qbittorrentService.decodeToken(token,auth.secret)
    //   if(!authData){
    //     return {code: -1 ,msg:"token数据损坏,请重新输入用户名密码"}
    //   }
    //   let sid = await qbittorrentService.getNewSid(server,authData.userName,authData.password)
    //   if(sid){
    //     widget.data.sid = sid
    //     appDao.updateWithId(tabIndex, id, widget)
    //     res = await qbittorrentService.getTorrentList(server,sid)
    //   }
    // }
    let res = await qbittorrentService.executeWithSid(auth, widget, (s) => qbittorrentService.getTorrentList(server,s))
    if(res.code === 0){
      ctx.body = {code:0, data:res.data}
    }else{
      ctx.body = {code:-1, msg:'查询失败'}
    }
  }

  async operateTorrent(ctx, next) {
    var tabIndex = parseInt(ctx.request.body.tabIndex)
    var id = ctx.request.body.id
    var server = ctx.request.body.server
    var hash = ctx.request.body.hash
    var operation = ctx.request.body.operation
    if(operation !== "pause" && operation !== "resume" && operation !== "delete"){
      return {code:-1, msg:'操作符不合法'}
    }
    var widget = appDao.findOne(tabIndex,id)
    var auth = appDao.getAuth()
    if(!widget || !auth.secret){
      ctx.body = {code:-1, msg:'操作失败'}
      return
    }
    let res = await qbittorrentService.executeWithSid(auth, widget, (s) => qbittorrentService.operateTorrent(operation, server,s,[hash]))
    if(res.code === 0){
      ctx.body = {code:0, msg:'操作成功'}
    }else{
      ctx.body = {code:-1, msg:'操作失败'}
    }
  }

  async deleteTorrent(ctx, next) {
    let tabIndex = parseInt(ctx.request.body.tabIndex)
    let id = ctx.request.body.id
    let server = ctx.request.body.server
    let hash = ctx.request.body.hash
    let deleteFiles = ctx.request.body.deleteFiles

    var widget = appDao.findOne(tabIndex,id)
    var auth = appDao.getAuth()
    if(!widget || !auth.secret){
      ctx.body = {code:-1, msg:'操作失败'}
      return
    }
    let res = await qbittorrentService.executeWithSid(auth, widget, (s) => qbittorrentService.deleteTorrent(deleteFiles, server,s,[hash]))
    if(res.code === 0){
      ctx.body = {code:0, msg:'操作成功'}
    }else{
      ctx.body = {code:-1, msg:'操作失败'}
    }
  }
}


var qbittorrentController = new QbittorrentController()
export default qbittorrentController