const axios = require("axios");
// const baseUrl = "http://192.168.0.108:8384"
// const appKey = 'YYsec2jDZQ3XQmJYESZ7QJWeU6skKgT3'
// const baseUrl = "http://localhost:8384"
// const appKey = 'mESCgd6imiPvTfVGojshHRSwcAd9SYzp'
const reg = /(\d{4}-\d{2}-\d{2}).+?(d{2}:\d{2}:d{2})/i

module.exports = async function getFoldersInfo(baseUrl, appKey){
    let folderList = await axios({
        method: 'get',
        url: baseUrl+"/rest/config/folders",
        params: null,
        headers: {
          'X-API-Key': appKey
        }
    })
    .then((response) => response.data.map((item) =>{
        let ni = {'id':item.id,'paused':item.paused}
        return ni
    }))
    .catch(function (error) {
        console.log('Error', error.message);
    });
    for(i = 0;i< folderList.length;i++){
        let [status,localFiles,globalFiles,lastActiveTime] = await axios({
            method: 'get',
            url: baseUrl+"/rest/db/status?folder="+folderList[i].id,
            params: null,
            headers: {
              'X-API-Key': appKey
            }
        })
        .then((response) => [response.data.state,response.data.localFiles,response.data.globalFiles,response.data.stateChanged])
        .catch(function (error) {
            console.log('Error', error.message);
        });
        folderList[i].status = status
        folderList[i].localFiles = localFiles
        folderList[i].globalFiles = globalFiles
        folderList[i].lastActiveTime = lastActiveTime
    }
    console.log(folderList)
    return folderList
}