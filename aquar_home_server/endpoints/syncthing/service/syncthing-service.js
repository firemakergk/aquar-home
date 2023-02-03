import axios from "axios"
const reg = /(\d{4}-\d{2}-\d{2}).+?(d{2}:\d{2}:d{2})/i

export default async function getFoldersInfo(baseUrl, appKey){
    let folderList = await axios({
        method: 'get',
        url: baseUrl.replace(/\/$/, '')+"/rest/config/folders",
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
    for(var i = 0;i< folderList.length;i++){
        let [status,localFiles,globalFiles,lastActiveTime] = await axios({
            method: 'get',
            url: encodeURI(baseUrl.replace(/\/$/, '')+"/rest/db/status?folder="+folderList[i].id),
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
    return folderList
}