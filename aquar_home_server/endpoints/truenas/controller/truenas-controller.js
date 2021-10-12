import axios from "axios"
class TruenasController {
  async queryPools(ctx, next) {
    var server = ctx.query.server
    var apiKey = ctx.query.apiKey
    var apiPath = '/api/v2.0/pool'
    var resData = await query(server, apiPath, apiKey)
    ctx.body = {code:0, data: resData}
  }
}

async function query(baseUrl, apiPath, apiKey){
  let queryRes = await axios({
    method: 'get',
    url: baseUrl + apiPath,
    headers: { 'Authorization': 'Bearer ' + apiKey }
  })
  .then((response) => {
    var data = response.data
    var res = []
    for(var i=0;i<data.length;i++) {
      var resItem = {}
      var pool = data[i]
      resItem.name = pool.name
      resItem.healthy = pool.healthy
      resItem.status = pool.status
      resItem.used = fileSize(pool.topology.data[0].stats.allocated)
      resItem.usedBytes = pool.topology.data[0].stats.allocated
      resItem.total = fileSize(pool.topology.data[0].stats.size)
      resItem.totalBytes = pool.topology.data[0].stats.size

      resItem.type = pool.topology.data[0].type
      res.push(resItem)
    }
    return res 
  })
  .catch(
    reason=>{
        console.log(reason)
  })
  return queryRes 
}

function fileSize(byteSize) {
  if (!byteSize) {
    return 'DIR'
  }
  var resNum = 0
  var postfix = 'B'
  if (byteSize < 1024) {
    resNum = byteSize
  } else if (byteSize > 1024 && byteSize <= 1048576) {
    resNum = byteSize / 1024
    postfix = 'K'
  } else if (byteSize > 1048576 && byteSize <= 1073741824) {
    resNum = byteSize / 1048576
    postfix = 'M'
  } else if (byteSize > 1073741824 && byteSize <= 1099511627776) {
    resNum = byteSize / 1073741824
    postfix = 'G'
  } else if (byteSize > 1099511627776) {
    resNum = byteSize / 1099511627776
    postfix = 'T'
  }else {
    resNum = 0
    postfix = 'NaN'
  }
  return resNum.toFixed(2) + postfix
}

var truenasController = new TruenasController()
export default truenasController