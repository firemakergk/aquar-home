import koarouter from 'koa-router'
import appEntryController from '../controller/AppEntryController.js'
import configController from '../controller/config-controller.js'
import syncThingController from '../endpoints/syncthing/controller/syncthing-controller.js'
import rsyncphaseController from '../endpoints/rsync-phase/controller/rsyncphase-controller.js'
import NextCloudController from '../endpoints/nextcloud/controller/nextcloud-controller.js'
import iconController from '../endpoints/icon/icon-controller.js'
import trueNasController from '../endpoints/truenas/controller/truenas-controller.js'
import pveController from '../endpoints/pve/controller/pve-controller.js'

const router = koarouter()
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
router.post('/api/register', configController.register)
router.post('/api/login', configController.login)
router.get('/api/destoryAccount', configController.destoryAccount)
router.get('/api/allData', appEntryController.allData)
router.get('/api/list', appEntryController.list)
router.post('/api/updateById', appEntryController.updateById)
router.post('/api/addWidget', appEntryController.addWidget)
router.post('/api/removeWidget', appEntryController.removeWidget)
router.get('/api/config', configController.config)
router.post('/api/config/uploadBgImg',configController.upload.single('bgImg'), configController.uploadBgImg)
router.post('/api/config/update', configController.updateConfig)
router.post('/api/config/submitTabs', appEntryController.submitTabs)
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
export default router