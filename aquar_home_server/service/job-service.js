import cron from'cron'
import cacheService from './cache-service.js'
//0 0 3 15 * *
var jobService = new cron.CronJob('0 0 3 * * *', function() {
  console.log('定时清理缓存文件任务启动！')
  cacheService.clearCache()
}, null, true, 'Asia/Shanghai')

export default jobService