import axios from 'axios'
import cryptoRandomString from 'crypto-random-string'
import xmldom from 'xmldom'
import xpath from 'xpath'
import appDao from '../../../service/db/app-dao.js'

const dom = xmldom.DOMParser
const RE_DATA_BING = /<ul.+\<\/ul>/g
const RE_DATA_GOOGLE = /\[.*\]/g
function getSuggestUrl(source, word){
  if(source === 'baidu'){
    return `https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&wd=${encodeURIComponent(word)}`
  }else if(source === 'bing'){
    var cvid = cryptoRandomString({length: 32})
    return `https://cn.bing.com/AS/Suggestions?pt=page.home&mkt=zh-cn&qry=${encodeURIComponent(word)}&cp=3&msbqf=false&cvid=${cvid}`
  }else if(source === "google"){
    return `https://www.google.com.hk/complete/search?q=${encodeURIComponent(word)}&cp=4&client=gws-wiz&xssi=t&hl=zh-CN&authuser=0&psi=aaa-bbb-ccc.${Date.now()}&newwindow=1&dpr=1`
  }else{
    return null
  }
}

function extractData(source,data){
  if(source === 'baidu'){
    var dataObj = data['g'].map(i => i.q)
    return dataObj
  }else if(source === 'bing'){
    var dataArray = RE_DATA_BING.exec(data)
    var dataStr = dataArray[0]
    var doc = new dom().parseFromString(dataStr)
    var dataObj = xpath.select("//li/@query",doc).map(i=>i['nodeValue'])
    return dataObj
  }else if(source === "google"){
    var dataArray = RE_DATA_GOOGLE.exec(data)
    var dataStr = dataArray[0]
    var dataObj = JSON.parse(dataStr)[0].map(i => i[0])
    return dataObj
  }else{
    return null
  }
}

class SearchController {
  async changeSource(ctx, next){
    var id = ctx.request.body.id
    var tabIndex = ctx.request.body.tabIndex
    var source = ctx.request.body.source
    var data = {source:source}
    var db = appDao.getDbInstance()
    db.chain
    .get('tabs['+tabIndex+'].widgets')
    .find({ 'id': id })
    .get('data')
    .assign(data).value()
    db.write()
    ctx.body = {code:0}
  }
  async suggest(ctx, next) {
    var word = ctx.query.word
    var source = ctx.query.source
    var url = getSuggestUrl(source, word)
    if(!url){
      return {code: 0, data:null}
    }
    let res = await axios({
      method: 'get',
      url: url
    })
    .then((response) => extractData(source,response.data))
    .catch(
      reason=>{
          console.log(reason)
    })
    ctx.body = {code: 0, data: res}
  }
}

var searchController = new SearchController()
export default searchController