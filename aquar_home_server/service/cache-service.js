import fs from 'fs'
import du from 'du'
import fileUtil from '../utils/file-util.js'
import appDao from './db/app-dao.js'
import _ from 'lodash'

class CacheService {
  CACHE_PATH = '/var/aquardata'
  STATIC_FILES = ['db.json']
  RE_CACHE_FILE = /"\/.+?\..+?"/g
  constructor() {
  }

  async cacheSize() {
    return await du(this.CACHE_PATH)
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
}

var cacheService = new CacheService()
export default cacheService