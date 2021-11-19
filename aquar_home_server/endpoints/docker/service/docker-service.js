import axios from "axios"

class DockerService {
  async getContainerInfo(baseUrl){
    let containerList = await axios({
      method: 'get',
      url: baseUrl+"/containers/json?all=true",
    })
    .then((response) => response.data.map((item) =>{
      return {'name':item.Names[0].substr(1),'image':item.Image,'state':item.State,'status':item.Status}
    }))
    .catch(function (error) {
      console.log('Error', error.message);
    });
    return containerList
  }
}
var dockerService = new DockerService()
export default dockerService