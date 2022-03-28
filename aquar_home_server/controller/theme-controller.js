import themeDao from '../service/db/theme-dao.js'

class ThemeController {
  async listNames(ctx, next) {
    var res = await themeDao.listNames()
    ctx.body = res 
  }
  async list(ctx, next) {
    var res = await themeDao.allThemes()
    ctx.body = res 
  }

  async findOneByName(ctx, next) {
    var name = ctx.query.name
    var res = await themeDao.findOneByName(name)
    ctx.body = res 
  }

  async saveOrUpdate(ctx, next) {
    var data = ctx.request.body
    await themeDao.saveOrUpdate(data)
    ctx.body = data
  }

  async remove(ctx, next) {
    var data = ctx.request.body
    if(!data || !data.name){
      ctx.body = {code:-1,msg:'缺少参数：name'}
      return
    }
    themeDao.deleteByName(data.name)
    ctx.body = {code:0,msg:'删除成功'}
  }
}

var themeController = new ThemeController()
export default themeController
