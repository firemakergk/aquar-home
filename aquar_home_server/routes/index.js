const router = require('koa-router')()
const appEntryController = require('../controller/AppEntryController')
const syncThingController = require('../endpoints/syncthing/controller/syncthing-controller')
const rsyncphaseController = require('../endpoints/rsync-phase/controller/rsyncphase-controller')
const NextCloudController = require('../endpoints/nextcloud/controller/nextcloud-controller')
const iconController = require('../endpoints/icon/icon-controller')
const trueNasController = require('../endpoints/truenas/controller/truenas-controller')
const pveController = require('../endpoints/pve/controller/pve-controller')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

// router.get('/list', async (ctx, next) => {
//   ctx.body = {
//     title: 'koa2 json'
//   }
// })
router.get('/api/list', appEntryController.list)
router.post('/api/updateById', appEntryController.updateById)
router.post('/api/addWidget', appEntryController.addWidget)
router.post('/api/removeWidget', appEntryController.removeWidget)
router.get('/api/endpoints/syncthing/info',syncThingController.getFoldersInfo)
router.get('/api/endpoints/archive_phase/prepare',rsyncphaseController.prepareArchive)
router.get('/api/endpoints/archive_phase/start',rsyncphaseController.startArchive)
router.post('/api/endpoints/archive_phase/addNewItem',rsyncphaseController.addNewItem)
router.post('/api/endpoints/archive_phase/updateItem',rsyncphaseController.updateItem)
router.post('/api/endpoints/archive_phase/removeItem',rsyncphaseController.removeItem)
router.get('/api/endpoints/nextcloud/login',NextCloudController.login)
router.get('/api/endpoints/nextcloud/poll',NextCloudController.poll)
router.post('/api/endpoints/nextcloud/query',NextCloudController.query)
router.post('/api/endpoints/nextcloud/thumbnail',NextCloudController.thumbnail)
router.post('/api/endpoints/nextcloud/download',NextCloudController.download)
router.post('/api/endpoints/icon/upload',iconController.upload.single('icon'),iconController.uploadIcon)
router.get('/api/endpoints/truenas/queryPools',trueNasController.queryPools)
router.get('/api/endpoints/pve/queryStatus',pveController.queryStatus)
module.exports = router
