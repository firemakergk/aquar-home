import koarouter from 'koa-router'
import widgetController from '../controller/widget-controller.js'
import configController from '../controller/config-controller.js'
import themeController from '../controller/theme-controller.js'
import syncThingController from '../endpoints/syncthing/controller/syncthing-controller.js'
import rsyncphaseController from '../endpoints/rsync-phase/controller/rsyncphase-controller.js'
import NextCloudController from '../endpoints/nextcloud/controller/nextcloud-controller.js'
import iconController from '../endpoints/icon/icon-controller.js'
import trueNasController from '../endpoints/truenas/controller/truenas-controller.js'
import pveController from '../endpoints/pve/controller/pve-controller.js'
import dockerController from '../endpoints/docker/controller/docker-controller.js'
import searchController from '../endpoints/search/controller/search-controller.js'
import transmissionController from '../endpoints/transmission/controller/transmission-controller.js'
import qbittorrentController from '../endpoints/qbittorrent/controller/qbittorrent-controller.js'

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
router.get('/api/allData', widgetController.allData)
router.get('/api/list', widgetController.list)
router.post('/api/updateWidgets', widgetController.updateWidgets)
router.post('/api/updateById', widgetController.updateById)
router.post('/api/addWidget', widgetController.addWidget)
router.post('/api/addWidgetBatch', widgetController.addWidgetBatch)
router.post('/api/removeWidget', widgetController.removeWidget)
router.post('/api/moveWidget', widgetController.moveWidget)
router.get('/api/config', configController.config)
router.post('/api/config/uploadBgImg',configController.bgImgUpload.single('bgImg'), configController.uploadBgImg)
router.post('/api/config/update', configController.updateConfig)
router.get('/api/config/addTab', widgetController.addTab)
router.post('/api/config/removeTab', widgetController.removeTab)
router.post('/api/config/submitTabs', widgetController.submitTabs)
router.get('/api/config/export', configController.exportData)
router.post('/api/config/import',configController.importDataUpload.single('importFile'), configController.importData)
router.get('/api/cache/info', configController.cacheInfo)
router.get('/api/cache/clear', configController.clearCache)
router.get('/api/theme/listNames', themeController.listNames)
router.get('/api/theme/list', themeController.list)
router.get('/api/theme/findOne', themeController.findOneByName)
router.post('/api/theme/saveOrUpdate', themeController.saveOrUpdate)
router.post('/api/theme/remove', themeController.remove)

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
router.post('/api/endpoints/icon/refreshIco',iconController.refreshIco)
router.get('/api/endpoints/truenas/queryPools',trueNasController.queryPools)
router.get('/api/endpoints/pve/queryStatus',pveController.queryStatus)
router.get('/api/endpoints/docker/list',dockerController.list)
router.get('/api/endpoints/search/suggest',searchController.suggest)
router.post('/api/endpoints/search/changeSource',searchController.changeSource)
router.get('/api/endpoints/transmission/torrentList',transmissionController.torrentList)
router.post('/api/endpoints/transmission/operate',transmissionController.operateTorrent)
router.post('/api/endpoints/qbittorrent/torrentList',qbittorrentController.torrentList)
router.post('/api/endpoints/qbittorrent/operateTorrent',qbittorrentController.operateTorrent)
router.post('/api/endpoints/qbittorrent/deleteTorrent',qbittorrentController.deleteTorrent)
router.post('/api/endpoints/qbittorrent/addTorrent', qbittorrentController.torrentUpload.fields([
  {
    name: 'file',
    maxCount: 1
  },
  {
    name: 'data',
    maxCount: 1
  }
]),qbittorrentController.addTorrent)

export default router