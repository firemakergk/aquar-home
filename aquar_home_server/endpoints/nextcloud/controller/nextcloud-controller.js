import nextcloudService from '../service/nextcloud-service.js'

class NextCloudController {
  async login(ctx, next) {
    var server = ctx.query.server
    var res = await nextcloudService.login(server)
    ctx.body = {code:0, data: res}
  }
  async poll(ctx, next) {
    var server = ctx.query.server
    var token = ctx.query.token
    var res = await nextcloudService.poll(server, token)
    ctx.body = {code:0, data: res}
  }
  async query(ctx, next) {
    var server = ctx.request.body.server
    var path = ctx.request.body.path
    var username = ctx.request.body.username
    var apppassword = ctx.request.body.apppassword
    var res = await nextcloudService.query(server, path, username, apppassword)
    ctx.body = {code:0, data: res}
  }
  async thumbnail(ctx, next) {
    var url = ctx.request.body.url
    var username = ctx.request.body.username
    var apppassword = ctx.request.body.apppassword
    var res = await nextcloudService.thumbnail(url, username, apppassword)
    ctx.body = {code:0, data: res}
  }
  async download(ctx, next) {
    var url = ctx.request.body.url
    var username = ctx.request.body.username
    var apppassword = ctx.request.body.apppassword
    var res = await nextcloudService.downloadBlob(url, username, apppassword)
    // ctx.response.set("Content-Type", "application/force-download")
    // ctx.response.set('Content-disposition', 'attachment; filename=' + 'test');
    ctx.body = res
  }
}

var nextCloudController = new NextCloudController()
export default nextCloudController