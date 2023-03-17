import axios from "axios"
import FormData from 'form-data'
import {Blob} from 'buffer';
import stream from 'stream'
import fs from 'fs'
import {fileFromPath} from 'formdata-node/file-from-path'
import jwt from 'jsonwebtoken'
import appDao from '../../../service/db/app-dao.js'
const reg = /(\d{4}-\d{2}-\d{2}).+?(d{2}:\d{2}:d{2})/i

const STATUS_ERROR = "error";	// Some error occurred, applies to paused torrents
const STATUS_MISSINGFILES = "missingFiles";	// Torrent data files is missing
const STATUS_UPLOADING = "uploading";	// Torrent is being seeded and data is being transferred
const STATUS_PAUSEDUP = "pausedUP";	// Torrent is paused and has finished downloading
const STATUS_QUEUEDUP = "queuedUP";	// Queuing is enabled and torrent is queued for upload
const STATUS_STALLEDUP = "stalledUP";	// Torrent is being seeded, but no connection were made
const STATUS_CHECKINGUP = "checkingUP";	// Torrent has finished downloading and is being checked
const STATUS_FORCEDUP = "forcedUP";	// Torrent is forced to uploading and ignore queue limit
const STATUS_ALLOCATING = "allocating";	// Torrent is allocating disk space for download
const STATUS_DOWNLOADING = "downloading";	// Torrent is being downloaded and data is being transferred
const STATUS_METADL = "metaDL";	// Torrent has just started downloading and is fetching metadata
const STATUS_PAUSEDDL = "pausedDL";	// Torrent is paused and has NOT finished downloading
const STATUS_QUEUEDDL = "queuedDL";	// Queuing is enabled and torrent is queued for download
const STATUS_STALLEDDL = "stalledDL";	// Torrent is being downloaded, but no connection were made
const STATUS_CHECKINGDL = "checkingDL";	// Same as checkingUP, but torrent has NOT finished downloading
const STATUS_FORCEDDL = "forcedDL";	// Torrent is forced to downloading to ignore queue limit
const STATUS_CHECKINGRESUMEDATA = "checkingResumeData";	// Checking resume data on qBt startup
const STATUS_MOVING = "moving";	// Torrent is moving to another location
const STATUS_UNKNOWN = "unknown";	// Unknown status


async function logout(baseUrl){
  let res = await axios.post(
    baseUrl.replace(/\/$/, '')+"/api/v2/auth/logout",
    null,
    {
      headers: {}
    }
  ).then((response) => {
    if(response.status === 200){
      return {code:0}
    }else{
      return {code:-1, msg:'登出失败'+response.status}
    }
  })
  .catch(function (error) {
    console.log('Error', error.message);
    return {code:-1, msg:'登出失败'+ error.message}
  });
  return res;
}

async function login(baseUrl,username, password){
  var formData = new URLSearchParams()
  formData.append('username',username)
  formData.append('password',password)
  let res = await axios.post(
    baseUrl.replace(/\/$/, '')+"/api/v2/auth/login",
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  ).then((response) => {
    if(response.status === 200){
      let headerValue = response.headers['set-cookie']
      let match = /^SID=(.+?);/g.exec(headerValue[0])
      if(!match){
        return {code: -1, msg:'未能解析出sid'}
      }
      let sid = match[1]
      if(!sid){
        return {code: -1, msg:'未能解析出sid'}
      }else{
        return {code: 0, sid}
      }
    }
  })
  .catch(function (error) {
    console.log('Error', error.message);
    return {code: -1, msg:'登录失败'}
  });
  return res
}

async function getNewSid(baseUrl,username, password){
  let logoutRes = await logout(baseUrl)
  let loginRes = await login(baseUrl,username,password)
  if(!loginRes || loginRes.code !== 0){
    return null
  }else{
    return loginRes.sid
  }
}

async function getTorrentList(baseUrl,sid){
  
  let res = await axios.get(baseUrl.replace(/\/$/, '')+"/api/v2/torrents/info",
  {
    headers: {
    'Cookie':'SID='+sid 
    },
    withCredentials:true
  })
  .then((response) => {
    let torrentList = response.data
    return {code:0, data: extractTorrentInfo(torrentList)}
  })
  .catch(function (error) {
    console.log('Error', error.message);
    if(error.response.status === 403){
      return {code:403}
    }
  });
  return res
}

async function operateTorrent(operation,baseUrl,sid,hashes){
  let hashStr = "all"
  if(!hashes){
    hashStr= "all"
  }else{
    hashStr = hashes.join('|')
  }
  var formData = new URLSearchParams()
  formData.append('hashes',hashStr)
  let res = await axios({
    method: 'post',
    url: baseUrl.replace(/\/$/, '')+`/api/v2/torrents/${operation}`,
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie':'SID='+sid
    },
    withCredentials:true
  })
  .then((response) => {
    return {code:0}
  })
  .catch(function (error) {
    console.log('Error', error.message);
    if(error.response.status === 403){
      return {code:403}
    }
  });
  return res
}

async function deleteTorrent(deleteFiles,baseUrl,sid,hashes){
  if(!hashes){
    return {code: -1}
  }
  deleteFiles = deleteFiles==="true" ? "true":"false"
  let hashStr = hashes.join('|')
  let formData = new URLSearchParams()
  formData.append('hashes',hashStr)
  formData.append('deleteFiles',deleteFiles)

  let res = await axios({
    method: 'post',
    url: baseUrl.replace(/\/$/, '')+`/api/v2/torrents/delete`,
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie':'SID='+sid
    },
    withCredentials:true
  })
  .then((response) => {
    return {code:0}
  })
  .catch(function (error) {
    console.log('Error', error.message);
    if(error.response.status === 403){
      return {code:403}
    }
  });
  return res
}

async function executeWithSid(auth, widget, func) {
  let res = await func(widget.data.sid)
    if(res.code === 403){
      if(!widget.data.token){
        return {code: -1 ,msg:"token丢失,请重新输入用户名密码"}
      }
      let authData = decodeToken(widget.data.token, auth.secret)
      if(!authData){
        return {code: -1 ,msg:"token数据损坏,请重新输入用户名密码"}
      }
      let newSid = await getNewSid(widget.data.server, authData.userName, authData.password)
      if(newSid){
        widget.data.sid = newSid
        appDao.updateById(widget.id, widget)
        res = await func(newSid)
      }else{
        return {code: -1}
      }
    }else{
      return res
    }
}

async function addTorrent(baseUrl,sid,fileName,torrentPath){
  let formData = new FormData()
  formData.append('torrents', fs.createReadStream(torrentPath),{contentType: "application/x-bittorrent",filename:fileName})

  let resData = await axios.post(
    baseUrl.replace(/\/$/, '')+'/api/v2/torrents/add',
    formData,
    {headers: {
      'Content-Type': 'multipart/form-data',
      'Cookie':'SID='+sid,
      'referer': `${baseUrl}/upload.html`,
      'Origin': `${baseUrl}`,
      'Upgrade-Insecure-Requests': 1 
    }}
  )
  .then((res) => {
    console.log(`res.status:${res.status}`)
    return true
  }).catch(function (error) {
    console.log('Error', error.message);
    if(error.response.status === 403){
      return {code:403}
    }
  });
  return resData
}

async function addMagnet(baseUrl,sid,magnet){
  let formData = new FormData()
  formData.append('urls', magnet)

  let resData = await axios.post(
    baseUrl.replace(/\/$/, '')+'/api/v2/torrents/add',
    formData,
    {headers: {
      'Content-Type': 'multipart/form-data',
      'Cookie':'SID='+sid,
      'referer': `${baseUrl}/upload.html`,
      'Origin': `${baseUrl}`,
      'Upgrade-Insecure-Requests': 1
    }}
  )
  .then((res) => {
    console.log(`res.status:${res.status}`)
    return true
  }).catch(function (error) {
    console.log('Error', error.message);
    if(error.response.status === 403){
      return {code:403}
    }
  });
  return resData
}

function extractTorrentInfo(torrentList){
  var res = {}
  res.rateDownload = 0
  res.rateUpload = 0
  res.torrents = []
  torrentList.map(i => {if(i.priority===0){i.priority = 999999}})
  torrentList.sort((a, b) => {return a.priority - b.priority})
  for(var i=0;i<torrentList.length;i++){
    var torrent = torrentList[i]
    var resItem = {}
    resItem.name = torrent.name
    resItem.id = i + '-' + torrent.hash
    resItem.hash = torrent.hash
    resItem.status = torrent.state
    resItem.statusName = getStatusName(torrent.state)
    resItem.totalSize = torrent.total_size
    resItem.downloadedEver = torrent.completed
    resItem.fileCount = null
    resItem.percent = torrent.progress
    resItem.rateDownload = torrent.dlspeed
    resItem.rateUpload = torrent.upspeed
    res.torrents.push(resItem)
    res.rateDownload += resItem.rateDownload
    res.rateUpload += resItem.rateUpload
  }
  return res
}
  
function getStatusName(status){
  if(status === STATUS_ERROR){
    return '异常';
  }
  if(status === STATUS_MISSINGFILES){
    return '文件丢失';
  }
  if(status === STATUS_UPLOADING){
    return '上传中';
  }
  if(status === STATUS_PAUSEDUP){
    return '下载完成';
  }
  if(status === STATUS_QUEUEDUP){
    return '队列中';
  }
  if(status === STATUS_STALLEDUP){
    return '做种中';
  }
  if(status === STATUS_CHECKINGUP){
    return '校验中';
  }
  if(status === STATUS_FORCEDUP){
    return '强制启动上传';
  }
  if(status === STATUS_ALLOCATING){
    return '寻找存储空间';
  }
  if(status === STATUS_DOWNLOADING){
    return '正在下载';
  }
  if(status === STATUS_METADL){
    return '获取元数据';
  }
  if(status === STATUS_PAUSEDDL){
    return '暂停下载';
  }
  if(status === STATUS_QUEUEDDL){
    return '等待队列';
  }
  if(status === STATUS_STALLEDDL){
    return '连接中';
  }
  if(status === STATUS_CHECKINGDL){
    return '校验中';
  }
  if(status === STATUS_FORCEDDL){
    return '强制开始下载';
  }
  if(status === STATUS_CHECKINGRESUMEDATA){
    return '校验中';
  }
  if(status === STATUS_MOVING){
    return '迁移中';
  }
  if(status === STATUS_UNKNOWN){
    return '未知';
  }
  return '未知'
}

function decodeToken(token, secret){
  let decodedJwt = jwt.verify(token, secret)
  return {userName:decodedJwt.uname, password: decodedJwt.pass}
}

export default {
  executeWithSid,
  getTorrentList,
  decodeToken,
  getNewSid,
  operateTorrent,
  deleteTorrent,
  addTorrent,
  addMagnet
}