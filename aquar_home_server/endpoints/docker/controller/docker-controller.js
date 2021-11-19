import dockerService from '../service/docker-service.js'

class DockerController {
  async list(ctx, next) {
    var server = ctx.query.server
    var res = await dockerService.getContainerInfo(server)
    if(!res){
      ctx.body = {code: -1 ,msg:"请求失败"}
    }else{
        ctx.body = {code: 0, data: res}
    }
  }
}

var dockerController = new DockerController()
export default dockerController 