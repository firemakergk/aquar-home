import multer from '@koa/multer'
import mime from 'mime-types'
import sha256 from 'crypto-js/sha256.js'
import fs from 'fs'
import appDao from '../service/db/app-dao.js'
import themeDao from '../service/db/theme-dao.js'
import cacheService from '../service/cache-service.js'
const BG_PATH = '/var/aquardata/bg_img/'
const IMPORT_FILE_PATH = '/tmp/'

if (!fs.existsSync(BG_PATH)){
  fs.mkdirSync(BG_PATH, { recursive: true });
}

const bgImgStorage = multer.diskStorage({
  destination: BG_PATH,
  filename(ctx,file,cb){
    const filenameArr = 'webp'
    var imgName = sha256(Math.random().toString()).toString().substring(0,32)+ '.' + filenameArr
    cb(null, imgName)
    ctx.imgName = imgName
    file.imgName = imgName
  }
})

const importDataStorage = multer.diskStorage({
  destination: IMPORT_FILE_PATH,
  filename(ctx,file,cb){
    console.log('ctx')
    let fileName = 'importdata.zip'
    cb(null, fileName)
    ctx.fileName = fileName 
    file.fileName =fileName 
  }
})

class ConfigController {
  bgImgUpload = multer({storage:bgImgStorage})
  importDataUpload = multer({storage:importDataStorage})
  async uploadBgImg(ctx, next) {
    ctx.body = {code:0, data: {img_path: '/bg_img/'+ctx.request.file.imgName}}
  }
  async updateConfig(ctx, next) {
    var data = ctx.request.body
    // data = JSON.parse(data)
    appDao.updateConfig(data)
    let resStr = await appDao.getConfig()
    ctx.body = resStr
  }
  async config(ctx, next) {
    var res = await appDao.getConfig()
    let themes = themeDao.listNames()
    res.appearance.themes = themes 
    let resDetail = null
    if(res && res.appearance && res.appearance.theme){
      let themeDetail = themeDao.findOneByName(res.appearance.theme)
      if(themeDetail){
        resDetail = themeDetail.detail
      }
    }
    ctx.body = {config: res, themeDetail: resDetail}
  }
  async register(ctx, next) {
    let data = ctx.request.body
    let userName = data.userName
    let password = data.password
    
    if(!userName || !password){
      ctx.body = {code:-1, msg:"用户名和密码不能为空"}
      return
    }
    if(data.userName.length > 30){
      ctx.body = {code:-1, msg:"用户名不能超过30位"}
      return
    }
    appDao.updateAuth({userName:userName,password:password})
    ctx.body = {code:0, msg:"修改登录信息成功"}
  }
  async login(ctx, next) {
    let data = ctx.request.body
    let userName = data.userName
    let password = data.password
    ctx.body = appDao.checkAuth(userName,password)
  }
  async destoryAccount(ctx, next) {
    appDao.updateAuth({userName:null,password:null})
    ctx.body = {code:0, msg:"帐户注销成功"}
  }
  async cacheInfo(ctx, next) {
    let cacheSize = await cacheService.cacheSize()
    ctx.body = {code:0, data:cacheSize}
  }
  async clearCache(ctx, next) {
    await cacheService.clearCache()
    ctx.body = {code:0, msg:"缓存已清理"}
  }
  async exportData(ctx, next) {
    console.log('exportData start')
    await cacheService.exportData()
    console.log('exportData done')
    let mimeType = mime.lookup('zip')
    ctx.response.set("content-type", mimeType)
    ctx.body = fs.createReadStream(cacheService.DATA_EXPORT_PATH)
  }
  async importData(ctx, next) {
    let res = await cacheService.importData()
    ctx.body = res 
  }
}

var configController = new ConfigController()
export default configController
