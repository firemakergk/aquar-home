import axios from "axios"
import fs from 'fs'
import sha256 from 'crypto-js/sha256.js'
import appDao from "../../../service/db/app-dao.js"
const CACHE_PATH = '/var/aquardata/icon_img/'
const CONFIG_PATH_PREFIX = '/icon_img/'
const RE_URL = /^http.*\:\/\/.+$/i
const RE_MAIN_SITE = /^http.*\:\/\/.+?\//i
if (!fs.existsSync(CACHE_PATH)){
  fs.mkdirSync(CACHE_PATH, { recursive: true });
}

class IconAdvicer {
  
  constructor() {
    if (!fs.existsSync(CACHE_PATH)){
      fs.mkdirSync(CACHE_PATH, { recursive: true });
    }
  }
  async afterWidgetAdded (tabIndex,widgetData) {  
    if(widgetData.widget != 'IconWidget'){
      return
    }
    if(!widgetData.href || !RE_URL.test(widgetData.href)){
      return
    }
    var domain = RE_MAIN_SITE.exec(widgetData.href)
    if(!domain){
      domain += widgetData.href + '/'
    }
    var icoUrl = domain + 'favicon.ico'
    var fileName = sha256(Math.random().toString()).toString().substring(0,16)+ '.ico'
    const fsPath = CACHE_PATH + fileName
    const writer = fs.createWriteStream(fsPath)
    var configPath = CONFIG_PATH_PREFIX + fileName
    var res = await axios({
      url: icoUrl,
      method: 'get',
      timeout: 2000,
      responseType: 'stream'
    }).then((response) => {
      response.data.pipe(writer)
      return true
    })
    .catch(
      reason=>{
        console.log(reason)
    })
    var curConfig = appDao.findOne(tabIndex,widgetData.id)
    curConfig.data.ico_path = configPath
    appDao.updateById(tabIndex,widgetData.id,curConfig)
    return curConfig
  }
  async afterWidgetUpdated(tabIndex,widgetData){
    return null
  }
}
const iconAdvicer = new IconAdvicer()
export default iconAdvicer