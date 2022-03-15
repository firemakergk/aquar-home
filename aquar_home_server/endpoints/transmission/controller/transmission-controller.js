import axios from 'axios'
import appDao from '../../../service/db/app-dao.js'
import jwt from 'jsonwebtoken'
import _ from 'lodash'

const STATUS_STOPPED = 0;
const STATUS_CHECK_WAIT = 1;
const STATUS_CHECK = 2;
const STATUS_DOWNLOAD_WAIT = 3;
const STATUS_DOWNLOAD = 4;
const STATUS_SEED_WAIT = 5;
const STATUS_SEED = 6;

function extractTorrentInfo(jsonStr){
  var res = {}
  res.rateDownload = 0
  res.rateUpload = 0
  res.torrents = []
  for(var i=0;i<jsonStr.arguments.torrents.length;i++){
    var torrent = jsonStr.arguments.torrents[i]
    var resItem = {}
    resItem.name = torrent.name
    resItem.id = torrent.id
    resItem.status = torrent.status
    resItem.statusName = getStatusName(torrent.status)
    resItem.totalSize = torrent.totalSize
    resItem.downloadedEver = torrent.downloadedEver
    resItem.fileCount = torrent.files.length
    resItem.percent = torrent.percentDone
    resItem.rateDownload = torrent.rateDownload
    resItem.rateUpload = torrent.rateUpload
    res.torrents.push(resItem)
    res.rateDownload += torrent.rateDownload
    res.rateUpload += torrent.rateUpload
  }
  return res
}

function getStatusName(status){
  if(status === STATUS_STOPPED){
    return '停止'
  }
  if(status === STATUS_CHECK_WAIT){
    return '等待校验'
  }
  if(status === STATUS_CHECK){
    return '校验中'
  }
  if(status === STATUS_DOWNLOAD_WAIT){
    return '等待下载'
  }
  if(status === STATUS_DOWNLOAD){
    return '下载中'
  }
  if(status === STATUS_SEED_WAIT){
    return '等待做种'
  }
  if(status === STATUS_SEED){
    return '做种中'
  }
  return '未知'
}

async function getSession(tabindex, id, server,widget,auth) {
  let res = await axios({
    method: 'post',
    url: server,
    auth: auth,
    data:{method:"session-get"}
  })
  .then((response) => {
    return response.data
  })
  .catch(
    reason=>{
      if(reason.response.status === 409){
        var sessionId = reason.response.headers['x-transmission-session-id']
        widget.data.sessionId = sessionId
        appDao.updateById(tabindex, id, widget)
        return sessionId
      }else{
        return null
      }
  })
  return res
}

async function torrentInfo(tabindex, id, server,widget,auth,trSession) {
  if(!trSession){
    trSession = ''
  }
  let res = await axios({
    method: 'post',
    url: server,
    auth: auth,
    data:{arguments:{fields:["id","addedDate","name","totalSize","error","errorString","eta","isFinished","isStalled","leftUntilDone","metadataPercentComplete","peersConnected","peersGettingFromUs","peersSendingToUs","percentDone","queuePosition","rateDownload","rateUpload","recheckProgress","seedRatioMode","seedRatioLimit","sizeWhenDone","status","trackers","downloadDir","uploadedEver","uploadRatio","webseedsSendingToUs","activityDate","corruptEver","desiredAvailable","downloadedEver","fileStats","haveUnchecked","haveValid","peers","startDate","trackerStats","comment","creator","dateCreated","files","hashString","isPrivate","pieceCount","pieceSize"]},method:"torrent-get"},
    headers:{'X-Transmission-Session-Id':trSession}
  })
  .then((response) => {
    var extractedData = extractTorrentInfo(response.data)
    return extractedData
  })
  .catch(
    reason=>{
      if(reason.response.status === 409){
        var sessionId = reason.response.headers['x-transmission-session-id']
        widget.data.sessionId = sessionId
        appDao.updateById(tabindex, id, widget)
        return {code: 1, data: sessionId}
      }else{
        return null
      }
  })
  return res
}

async function operate(tabindex, id, server,widget,auth,trSession,optData) {
  if(!trSession){
    trSession = ''
  }
  var reqData = {arguments:{ids:optData.ids},method:optData.method}
  reqData.arguments = _.assign(reqData.arguments,optData.options)
  let res = await axios({
    method: 'post',
    url: server,
    auth: auth,
    data:reqData,
    headers:{'X-Transmission-Session-Id':trSession}
  })
  .then((response) => {
    if(response.data.result === 'success'){
      return {code: 0, data: null}
    }else{
      console.log(JSON.stringify(response.data))
      return {code: 1, data: response.data}
    }
  })
  .catch(
    reason=>{
      if(reason.response.status === 409){
        var sessionId = reason.response.headers['x-transmission-session-id']
        widget.data.sessionId = sessionId
        appDao.updateById(tabindex, id, widget)
        return {code: 1, data: sessionId}
      }else{
        return null
      }
  })
  return res
}

class TransmissionController {
  async torrentList(ctx, next) {
    var tabIndex = parseInt(ctx.query.tabIndex)
    var id = ctx.query.id
    var server = ctx.query.server
    var token = ctx.query.token
    var widget = appDao.findOne(tabIndex,id)
    var auth = appDao.getAuth()
    if(!widget || !auth.secret){
      return null
    }
    var decodedJwt = jwt.verify(token, auth.secret)
    var auth = {username:decodedJwt.uname, password:decodedJwt.pass}
    var sessionId = widget.data.sessionId
    if(!sessionId){
      sessionId = await getSession(tabIndex,id,server,widget,auth)
    }
    var res = await torrentInfo(tabIndex, id, server,widget,auth,sessionId)
    if(res.code === 1){
      res = await torrentInfo(tabIndex, id, server,widget,auth,res.data)
    }
    ctx.body = res
  }
  
  async operateTorrent(ctx, next) {
    var tabIndex = parseInt(ctx.request.body.tabIndex)
    var id = ctx.request.body.id
    var server = ctx.request.body.server
    var token = ctx.request.body.token
    var optData = {}
    optData.method = ctx.request.body.method
    optData.ids = ctx.request.body.ids
    optData.options = ctx.request.body.options
    var widget = appDao.findOne(tabIndex,id)
    var auth = appDao.getAuth()
    if(!widget || !auth.secret){
      return null
    }
    var decodedJwt = jwt.verify(token, auth.secret)
    var auth = {username:decodedJwt.uname, password:decodedJwt.pass}
    var sessionId = widget.data.sessionId
    if(!sessionId){
      sessionId = await getSession(tabIndex,id,server,widget,auth)
    }
    var res = await operate(tabIndex, id, server,widget,auth,sessionId,optData)
    if(res.code === 1){
      res = await operate(tabIndex, id, server,widget,auth,res.data,optData)
    }
    ctx.body = res
  }
}

var transmissionController = new TransmissionController()
export default transmissionController