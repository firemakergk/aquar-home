import axios from "axios"
import https from "https"
class PveController {
  async queryStatus(ctx, next) {
    var server = ctx.query.server
    var node = ctx.query.node
    var apiToken = ctx.query.apiToken
    var resData = await query(server, node, apiToken)
    ctx.body = {code:0, data: resData}
  }
}
async function query(server, node, apiToken){

  const agent = new https.Agent({  
    rejectUnauthorized: false
  });
  let pveStatus = await axios({
    method: 'get',
    url: server + `/api2/json/nodes/${node}/status`,
    headers: { 
      Authorization: apiToken
    },
    withCredentials:true,
    httpsAgent: agent
  })
  .then((response) => {
    var data = response.data.data
    return data 
  })
  .catch(
    reason=>{
        console.log(reason)
  })
  let vmList = await axios({
    method: 'get',
    url: server + '/api2/json/cluster/resources',
    headers: { 
      Authorization: apiToken
    },
    withCredentials:true,
    httpsAgent: agent
  })
  .then((response) => {
    var data = response.data.data
    return data 
  })
  .catch(
    reason=>{
        console.log(reason)
  })
  var queryRes = {}
  queryRes.pveStatus = pveStatus
  queryRes.vmList = vmList 
  return queryRes 
}


var pveController = new PveController()
export default pveController