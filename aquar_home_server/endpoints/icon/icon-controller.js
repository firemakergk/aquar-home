import multer from '@koa/multer'
import sha256 from 'crypto-js/sha256.js'
import fs from 'fs'
const ICON_PATH = '/var/aquardata/icon_img/'

if (!fs.existsSync(ICON_PATH)){
  fs.mkdirSync(ICON_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: ICON_PATH,
  filename(ctx,file,cb){
    const filenameArr = 'webp'
    var iconName = sha256(Math.random().toString()).toString().substring(0,32)+ '.' + filenameArr
    cb(null, iconName)
    ctx.iconName = iconName
    file.iconName = iconName
  }
})

class IconController {
  upload = multer({storage})
  async uploadIcon(ctx, next) {
    ctx.body = {code:0, data: {img_path: '/icon_img/'+ctx.request.file.filename}}
  }
}

var iconController = new IconController()
export default iconController
