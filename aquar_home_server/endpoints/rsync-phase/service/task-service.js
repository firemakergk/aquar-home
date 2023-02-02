import cron from'cron'
import rsyncService from './rsync-service.js'
import dateFormat from 'dateformat'
class RsyncTaskService{
  cronList = null
  taskMap = {}
  constructor() {
    this.cronList = rsyncService.listCrons()
    this.installTask(this.cronList)
  }

  installTask(cronList){
    if(!cronList){
      return
    }

    for(let cr of cronList){
      let task = null
      try{
          task = new cron.CronJob(cr.cron, function(){
          console.log(`task executing,time:${new Date().toISOString()},id:${cr.id},name:${cr.name}`)
          rsyncService.execSync(cr.source,cr.archive_dir_name).then((res) =>{
            console.log(`task executed,time:${new Date().toISOString()},id:${cr.id},name:${cr.name},out:${res}`)
            rsyncService.updateLastSyncTime(null,cr.widgetId,cr.id)
          })
        }, null, true, 'Asia/Shanghai')
      }catch(error){
        console.warn(`task cron error,id:${cr.id},cron:${cr.cron},error: ${error.message}`)
      }
      if(task){
        task.start()
        console.log(`task installed,id: ${cr.id} ,name:${cr.name}`)
        this.taskMap[cr.id] = task
      }
      
    }
  }
  

  async startAll(){
    for(id in this.taskMap){
      taskMap[id].start()
    }
  }
  
  async stopAll(){
    for(id in this.taskMap){
      taskMap[id].stop()
    }
  }

  async updateCron(cronList){
    for(let cr of cronList){
      if(cr.id in this.taskMap){
        this.taskMap[cr.id].stop()
      }
      let task = null
      try{
        task = new cron.CronJob(cr.cron, function(){
          console.log(`task executing,time:${new Date().toISOString()},id:${cr.id},name:${cr.name}`)
          rsyncService.execSync(cr.source,cr.archive_dir_name,cr.phase_name).then((res) =>{
            console.log(`task executed,time:${new Date().toISOString()},id:${cr.id},name:${cr.name},out:${res}`)
            rsyncService.updateLastSyncTime(null,cr.widgetId,cr.id)
          })
        }, null, true, 'Asia/Shanghai')
      }catch(error){
        console.warn(`task cron error,id:${cr.id},cron:${cr.cron},error: ${error.message}`)
      }
      if(task){
        console.log(`task updated: ${cr.name}`)
        task.start()
        this.taskMap[cr.id] = task
      }
    }
  }
}



export default RsyncTaskService