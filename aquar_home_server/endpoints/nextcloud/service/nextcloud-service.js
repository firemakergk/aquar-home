import axios from "axios"
import xpath from 'xpath'
import xmldom from 'xmldom'
import sharp from 'sharp'
import stream from 'stream'
import fs from 'fs'
import sha256 from 'crypto-js/sha256.js'
const dom = xmldom.DOMParser
const CACHE_PATH = '/var/aquardata/cache/nextcloud/thumb/'

if (!fs.existsSync(CACHE_PATH)){
  fs.mkdirSync(CACHE_PATH, { recursive: true });
}

async function login(baseUrl){
  let res = axios({
    method: 'post',
    url: baseUrl+"/index.php/login/v2",
    params: null,
  })
  .then((response) => response.data)
  return res
}

async function poll(baseUrl, pollToken){
  let res = axios({
    method: 'post',
    url: baseUrl+"/index.php/login/v2/poll",
    params: {token: pollToken},
  })
  .then((response) => response.data)
  return res 
}


async function query(baseUrl, path, username, apppassword){
  let queryData = await axios({
    method: 'propfind',
    url: baseUrl+'/remote.php/dav/files/' + path,
    auth: {
      username: username,
      password: apppassword	
    }
  })
  .then((response) => {
    var data = response.data
    var doc = new dom().parseFromString(data)
    var nodes = xpath.select("//*[name()='d:response']",doc)
    var resData = []
    for(var i=1; i<nodes.length; i++){
      var itemData = {}
      itemData.href = nodes[i].firstChild.textContent
      itemData.href = itemData.href.replace('/remote.php/dav/files/','')
      if(itemData.href.substring(itemData.href.length-1)==='/' ){
        itemData.content_type = 'dir'
        itemData.file_name = itemData.href.substring(0, itemData.href.length-1).replace(/^.*[\\\/]/, '') + '/'
        itemData.file_name = decodeURI(itemData.file_name)
      }else {
        itemData.file_name = itemData.href.replace(/^.*[\\\/]/, '')
        itemData.file_name = decodeURI(itemData.file_name)
        var contentType = nodes[i]
          .getElementsByTagName('d:propstat')[0]
          .getElementsByTagName('d:prop')[0]
          .getElementsByTagName('d:getcontenttype')
        if(contentType.length > 0){
          itemData.content_type = contentType[0].textContent
        }
        var size = nodes[i]
          .getElementsByTagName('d:propstat')[0]
          .getElementsByTagName('d:prop')[0]
          .getElementsByTagName('d:getcontentlength')
        if(size.length > 0){
          itemData.size = size[0].textContent
        }
      }
      itemData.modified_time = nodes[i]
        .getElementsByTagName('d:propstat')[0]
        .getElementsByTagName('d:prop')[0]
        .getElementsByTagName('d:getlastmodified')[0].textContent
        itemData.modified_time = new Date(itemData.modified_time).toISOString()
        // itemData.modified_time = itemData.modified_time.replace(/T/,' ').replace(/\.000Z/,'')
      resData.push(itemData)
    }
    return resData
  })
  .catch(
    reason=>{
        console.log(reason)
  })
  var sortedData = queryData.slice(0).sort(function(a,b) {
    var d1 = new Date(0)
    var d2 = new Date(0)
    if(a.modified_time){
      d1 = new Date(a.modified_time)
    }
    if(b.modified_time){
      d2 = new Date(b.modified_time)
    }
    return  d2 - d1
  });
  if(sortedData.length > 1000){
    sortedData = sortedData.slice(0,1000)
    lastData = {href: '#', content_type: 'file', file_name: '-------仅显示1000条--------',modified_time: new Date().toISOString()}
    sortedData.push(lastData)
  }
  for(var i=0;i<sortedData.length;i++){
    var itemData = sortedData[i]
    if(!itemData.content_type || !itemData.content_type.match(/^image/g)){
      continue
    }
    // var imgUrl = baseUrl+'remote.php/dav/files/' + itemData.href
    // var imgBuffer = await download(imgUrl, username, apppassword)
    // itemData.thumb = await genThumbnailBase64(itemData.file_name, imgBuffer)
    // console.log(i)
  }
  console.log(sortedData)
  return sortedData
}

async function download(url, username, apppassword){    
  let res = await axios({
    method: 'get',
    url: url,
    auth: {
      username: username,
      password: apppassword	
    },
    responseType: "arraybuffer"
  })
  .then((response) => Buffer.from(response.data, 'binary'))
  .catch(
    reason=>{
        console.log(reason)
  })
  return res
}

async function downloadBlob(url, username, apppassword){    
  let res = await axios({
    method: 'get',
    url: url,
    auth: {
      username: username,
      password: apppassword
    },
    responseType: "arraybuffer"
  })
  .then((response) => {
    console.log(response.data)
    var bufferStream = new stream.PassThrough();
    bufferStream.end(response.data);
    return bufferStream
  })
  .catch(
    reason=>{
        console.log(reason)
  })
  return res
}

async function genThumbnailBase64(data){
  const thumbnailBase64 = await sharp(data)
  .toFormat('jpeg')
  .resize({
    width: 100,
    height: 100,
    fit: sharp.fit.cover
  })
  .toBuffer()
  .then((res) => res.toString('base64'))
  return thumbnailBase64
}

async function thumbnail(url, username, apppassword) {
  if (!url.match(/(gif|jpg|jpeg|png)$/g)) {
    return null
  }
  var thumbPath = CACHE_PATH+sha256(url).toString().substring(0,32) + '.webp'
  console.log(thumbPath)
  var thumb = null
  var cacheHitted = fs.existsSync(thumbPath)
  if (cacheHitted) {
    thumb = fs.readFileSync(thumbPath)
  }else {
    var sourceImg = await download(url, username, apppassword)
    // fs.writeFileSync(thumbPath, res)
    thumb = await sharp(sourceImg)
    .resize({
      width: 100,
      height: 100,
      fit: sharp.fit.cover
    })
    .webp({ quality: 80 })
    .toBuffer()
    .then((res) => res)
    fs.writeFileSync(thumbPath, thumb)
  }
  return thumb.toString('base64')
}

export default {
    login,
    poll,
    query,
    thumbnail,
    downloadBlob
}

// query(
//   'http://39.100.115.231:8101/',
//   'aquar/images/finetu_meme_archive/20210403',
//   'finetu',
//   'z9oyjwqRXa1VYNLkhOAMd7JUNMIwpSPwldtXcr7BF1lE5c1NW12VIpF0KQssrUyhwXXB7Wd9')