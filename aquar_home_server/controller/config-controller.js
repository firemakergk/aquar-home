const multer = require('@koa/multer')
const sha256 = require('crypto-js/sha256')
const fs = require('fs')
const BG_PATH = '/var/aquardata/bg_img/'
const appEntryDao = require('../service/db/app-entry')

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
    appEntryDao.updateConfig(data)
    var resStr = await appEntryDao.getConfig()
    ctx.body = resStr
  }
  async config(ctx, next) {
    var resStr = await appEntryDao.getConfig()
    ctx.body = resStr
  }
}

configController = new ConfigController()
module.exports = configController
