import nextcloudService from '../service/nextcloud-service.js'
import { AuthType, createClient } from "webdav";


class NextCloudController {
  webdavClient = createClient("https://some-server.org", {
    authType: AuthType.Digest,
    username: "user",
    password: "pass"
  });

  async login(ctx, next) {
    var server = ctx.query.server
    var res = null
    try{
      res = await nextcloudService.login(server)
    } catch(e){
      ctx.response.status = 502
      ctx.body = {code: -1 ,msg:`请求失败，请检查配置是否正确，调试信息e.message:${e.message}`}
      return
    }
    if(!res){
      ctx.body = {code: -1 ,msg:"请求失败"}
    }else{
        ctx.body = {code: 0, data: res}
    }
  }
  async poll(ctx, next) {
    var server = ctx.query.server
    var token = ctx.query.token
    var res = null
    try{
      res = await nextcloudService.poll(server, token)
    } catch(e){
      ctx.response.status = 502
      ctx.body = {code: -1 ,msg:`请求失败，请检查配置是否正确，调试信息e.message:${e.message}`}
      return
    }
    if(!res){
      ctx.body = {code: -1 ,msg:"请求失败"}
    }else{
        ctx.body = {code: 0, data: res}
    }
  }
  async query(ctx, next) {
    var server = ctx.request.body.server
    var path = ctx.request.body.path
    var username = ctx.request.body.username
    var apppassword = ctx.request.body.apppassword
    var res = null
    try{
      res = await nextcloudService.query(server, path, username, apppassword)
    } catch(e){
      ctx.response.status = 502
      ctx.body = {code: -1 ,msg:`请求失败，请检查配置是否正确，调试信息e.message:${e.message}`}
      return
    }
    if(!res){
      ctx.body = {code: -1 ,msg:"请求失败"}
    }else{
        ctx.body = {code: 0, data: res}
    }
  }
  async thumbnail(ctx, next) {
    var url = ctx.request.body.url
    var username = ctx.request.body.username
    var apppassword = ctx.request.body.apppassword
    var res = await nextcloudService.thumbnail(url, username, apppassword)
    if(!res){
      ctx.body = {code: -1 ,msg:"请求失败"}
    }else{
        ctx.body = {code: 0, data: res}
    }
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