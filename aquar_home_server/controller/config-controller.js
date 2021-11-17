import multer from '@koa/multer'
import sha256 from 'crypto-js/sha256.js'
import fs from 'fs'
import appDao from '../service/db/app-dao.js'
const BG_PATH = '/var/aquardata/bg_img/'

if (!fs.existsSync(BG_PATH)){
  fs.mkdirSync(BG_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: BG_PATH,
  filename(ctx,file,cb){
    const filenameArr = 'webp'
    var imgName = sha256(Math.random().toString()).toString().substring(0,32)+ '.' + filenameArr
    cb(null, imgName)
    ctx.imgName = imgName
    file.imgName = imgName
  }
})

class ConfigController {
  upload = multer({storage})
  async uploadBgImg(ctx, next) {
    ctx.body = {code:0, data: {img_path: '/bg_img/'+ctx.request.file.imgName}}
  }
  async updateConfig(ctx, next) {
    var data = ctx.request.body
    // data = JSON.parse(data)
    appDao.updateConfig(data)
    var resStr = await appDao.getConfig()
    ctx.body = resStr
  }
  async config(ctx, next) {
    var resStr = await appDao.getConfig()
    ctx.body = resStr
  }
  async register(ctx, next) {
    var data = ctx.request.body
    var userName = data.userName
    var password = data.password
    
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
    var data = ctx.request.body
    var userName = data.userName
    var password = data.password
    ctx.body = appDao.checkAuth(userName,password)
  }
  async destoryAccount(ctx, next) {
    appDao.updateAuth({userName:null,password:null})
    ctx.body = {code:0, msg:"帐户注销成功"}
  }
}

var configController = new ConfigController()
export default configController
