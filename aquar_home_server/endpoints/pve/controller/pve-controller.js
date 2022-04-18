import axios from "axios"
import https from "https"
import _ from "lodash"

class PveController {
  async queryStatus(ctx, next) {
    let server = ctx.query.server
    let node = ctx.query.node
    let user = ctx.query.user
    let tokenId = ctx.query.tokenId
    let tokenSecret = ctx.query.tokenSecret
    let authInfo = `PVEAPIToken=${user}!${tokenId}=${tokenSecret}`
    var resData = await query(server, node, authInfo)
    ctx.body = {code:0, data: resData}
  }
}
async function query(server, node, apiToken){

  const agent = new https.Agent({  
    rejectUnauthorized: false
  });
  let pveStatus = await axios({
    method: 'get',
    url: server + `api2/json/nodes/${node}/status`,
    headers: { 
      Authorization: apiToken
    },
    // withCredentials:true, httpsAgent: agent
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
    url: server + `api2/json/nodes/${node}/qemu`,
    headers: { 
      Authorization: apiToken
    },
    // withCredentials:true,
    // httpsAgent: agent
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
  queryRes.vmList = _.sortBy(vmList,i => i.vmid) 
  return queryRes 
}


var pveController = new PveController()
export default pveController