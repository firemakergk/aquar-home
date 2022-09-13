import dockerService from '../service/docker-service.js'

class DockerController {
  async list(ctx, next) {
    var server = ctx.query.server
    var res = null
    try{
      res = await dockerService.getContainerInfo(server)
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
}

var dockerController = new DockerController()
export default dockerController 