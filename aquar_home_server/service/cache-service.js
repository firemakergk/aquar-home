import fs from 'fs'
import du from 'du'
import AdmZip from 'adm-zip'
import fileUtil from '../utils/file-util.js'
import appDao from './db/app-dao.js'
import _ from 'lodash'

class CacheService {
  DATA_PATH = '/var/aquardata'
  STATIC_FILES = ['db.json']
  RE_CACHE_FILE = /"\/.+?\..+?"/g
  DATA_EXPORT_PATH = '/tmp/aquardata.zip'
  DATA_IMPORT_PATH = '/tmp/importdata.zip'
  constructor() {
  }

  async cacheSize() {
    return await du(this.DATA_PATH)
  }

  async clearCache(){
    var allCacheFiles = []
    fileUtil.listFilesRecursive('/var/aquardata',allCacheFiles)
    var dataStr = JSON.stringify(appDao.allData())
    var cacheFilesInUse = dataStr.match(this.RE_CACHE_FILE)
    cacheFilesInUse = cacheFilesInUse.map( s => {
      var tmp = s.replace(/"/g,'')
      return tmp.substr(tmp.lastIndexOf('/')+1)
    })
    cacheFilesInUse = cacheFilesInUse.concat(this.STATIC_FILES)
    var useLessList = allCacheFiles.filter(s => {
      var inUse = false
      for(var i=0;i<cacheFilesInUse.length;i++){
        if(s.includes(cacheFilesInUse[i])){
          inUse = true
          break
        }
      }
      return !inUse
    })
    for(var j=0;j<useLessList.length;j++){
      fs.rmSync(useLessList[j])
      console.log('缓存文件被系统清理：'+useLessList[j])
    }
  }

  async exportData() {
    if (fs.existsSync(this.DATA_EXPORT_PATH)){
      fs.rmSync(this.DATA_EXPORT_PATH)
    }
    let zip = new AdmZip()
    zip.addLocalFolder(this.DATA_PATH)
    zip.writeZip(this.DATA_EXPORT_PATH)
  }

  async importData() {
    if (!fs.existsSync(this.DATA_IMPORT_PATH)){
      console.log('未找到导入的数据文件')
      return {code: -1, msg:"未找到导入的数据文件"}
    }
    let zip = new AdmZip(this.DATA_IMPORT_PATH)
    if (!zip.getEntry("bg_img/") || !zip.getEntry("icon_img/")) {
      console.log('数据文件结构不完整')
      return {code: -1, msg:"数据文件结构不完整"}
    }
    let importedDB = JSON.parse(zip.readAsText('db/db.json'))
    if (!importedDB) {
      console.log('数据文件格式不正确')
      return {code: -1, msg:"数据文件结构不完整"}
    }
    console.log('开始导入数据')
    zip.extractEntryTo("bg_img/", "/var/aquardata/bg_img", /*maintainEntryPath*/ false, /*overwrite*/ true)
    zip.extractEntryTo("icon_img/", "/var/aquardata/icon_img", /*maintainEntryPath*/ false, /*overwrite*/ true)
    for(let tab of importedDB.tabs) {
      console.log(`导入tab页: ${tab.title}`)
      appDao.addTab(tab)
    }
    fs.rmSync(this.DATA_IMPORT_PATH)
    return {code: 0, msg:"数据导入成功"}
  }
}

var cacheService = new CacheService()
export default cacheService