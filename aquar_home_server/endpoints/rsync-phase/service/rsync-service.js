import childprocess from 'child_process'
import fs from "fs"
import _ from 'lodash'
import dateFormat from "dateformat";
import appDao from '../../../service/db/app-dao.js'
import StringUtil from '../../../utils/string-util.js'
const exec = childprocess.execSync
const baseDir = '/opt/aquarpool/'


class RsyncService {
    listCrons(){
      let widgets = appDao.findByWidget('ArchivePhaseWidget')
      
      let resList = []
      for(let widget of widgets){
          if(!widget.data.items){
              continue
          }
          let itemList = widget.data.items
          itemList.forEach(it => it.widgetId = widget.id)
          resList.push(..._.filter(itemList, (item) => {return item.cron && item.id}))
      }
      // for(let i=0;i<widget.data.items.length;i++){
      //     let item = widget.data.items[i]
      //     if(item.cron){
      //         item.index = i
      //         resList.push(item)
      //     }
      // }
      return resList
    }

    queryCron(tabIndex,id,itemId){
      let widget = appDao.findOne(tabIndex,id)
      if(!widget.data.items || widget.data.items.length === 0){
          return null
      }
      let it = _.find(widget.data.items, (item) => {return item.id === itemId})
      return it.cron
    }

    updateLastSyncTime(tabIndex, widgetId, itemId){
      var db = appDao.getDbInstance()
      let tabs = db.chain.get('tabs').value()
      let targetTabIndex = null
      if(tabIndex){
        targetTabIndex = tabIndex
      }else{
        for(let tbIndex=0;tabIndex < tabs.length;tbIndex++){
          let tab = tabs[tbIndex]
          let resList = _.filter(tab.widgets,{'id':widgetId})
          if(!resList || resList.length === 0){
            continue
          }else{
            targetTabIndex = tbIndex
            break
          }
        }
      }
      if(!targetTabIndex){
        return
      }
      db.chain
      .get('tabs['+targetTabIndex+'].widgets')
      .find({ 'id': widgetId })
      .get('data')
      .get('items').find({ 'id': itemId })
      .assign({lastSyncTime:dateFormat("yyyy-mm-dd HH:MM:ss")}).value()
      db.write()
    }

    async execSync(source,archiveDir,archiveName ){
      let cmd = this.genScript(source,archiveDir,archiveName)
      console.log(`executing rsync cmd: ${cmd}`)
      let res = await new Promise((resolve,reject) => resolve(exec(cmd).toString()))

      return res
    }

    genScript(sourceDir,targetDir,archiveName){
      if(!sourceDir || !targetDir){
        return null
      }
      if(!archiveName){
        archiveName = ""
      }
      archiveName = StringUtil.parseFormatDateString(archiveName)
      sourceDir = baseDir + sourceDir
      sourceDir = _.endsWith(sourceDir,'/') ? sourceDir.subStr(0,sourceDir.length-1) : sourceDir
      targetDir = baseDir + targetDir
      targetDir = _.endsWith(targetDir,'/') ? targetDir.subStr(0,targetDir.length-1) : targetDir

      let compareCmd = ''
      if(archiveName != ""){
        let compareParams = fs.readdirSync(targetDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => `--compare-dest=${targetDir}/${dirent.name}`)
        compareParams.splice(0, 0, '--compare-dest='+targetDir)
        compareCmd = compareParams.join(' ')
      }
      let script = `rsync -avry --itemize-changes --size-only ${compareCmd} ${sourceDir}/ ${targetDir}/${archiveName}`
      return script
    }

}

var rsyncService = new RsyncService()
export default rsyncService