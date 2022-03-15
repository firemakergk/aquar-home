import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import cryptoRandomString from 'crypto-random-string'
import moment from 'moment'
import _ from 'lodash'

class AppDao {
  DB_PATH = '/var/aquardata/db/'
  db = null
  constructor() {
    this.db = new LowSync(new JSONFileSync(this.DB_PATH+'db.json'))
    this.db.read()
    this.db.chain = lodash.chain(this.db.data)
  }

  saveAppEntry(tabIndex,entry) {
    this.db.data.tabs[tabIndex].widgets.push(entry)
    this.db.write()
  }
  saveAppEntryBatch(tabIndex,widgets) {
    for(var i=0;i<widgets.length;i++){
      var w = widgets[i]
      this.db.data.tabs[tabIndex].widgets.push(w)
    }
    this.db.write()
  }
  findOne(tabIndex,id) {
    var res = this.db.chain.get('tabs['+tabIndex+'].widgets')
      .find({ 'id': id }).value()
    return res
  }
  findOneById(id) {
    let tabs = this.db.chain.get('tabs').value()
    for(let tab of tabs){
      let resList = _.filter(tab.widgets,{'id':id})
      if(!resList || resList.length === 0){
        continue
      }
      return resList[0]
    }
    return null 
  }
  findByCurIndex() {
    var index = this.db.chain.get('config.current_index').value()
    index = index ? index:0;
    return this.db.data.tabs[index].widgets
  }
  updateById(tabIndex,id,item) {
    this.db.chain.get('tabs['+tabIndex+'].widgets')
    .find({ id: id })
    .assign(item).value()
    this.db.write()
  }
  deleteById(tabIndex,id) {
    this.db.chain.get('tabs['+tabIndex+'].widgets').remove({'id':id}).value()
    this.db.write()
  }
  updateConfig(config) {
    this.db.chain.get('config').assign(config).value()
    this.db.write()
  }
  getConfig() {
    var res = this.db.data.config
    return res
  }
  updateAuth(authData) {
    this.db.chain.get('auth').assign(authData).value()
    this.db.write()
  }
  getAuth() {
    var res = this.db.data.auth
    return res
  }
  getSecret() {
    
    var auth = this.db.data.auth
    if(!auth || !auth.secret){
      var secret = cryptoRandomString({length: 10, type: 'alphanumeric'})
      this.db.chain.get('auth').assign({secret:secret}).value()
      this.db.write()
    }
    var secret = this.db.data.auth.secret
    return secret
  }
  checkAuth(userName, password){
    var auth = this.db.data.auth
    if(!auth || !auth.secret){
      return {code:-1, msg:"secret为空无法派发token"}
    }
    var secret = this.db.data.auth.secret
    var token = jwt.sign({ sub: userName}, secret,{ expiresIn: 60 * 60 * 24 * 180 })
    if(!auth.userName || !auth.password){
      return {code:0, msg:"系统未设置登录信息，直接进入",token: token}
    }else if(userName === auth.userName && password === auth.password){
      return {code:0, msg:"登录成功",token:token}
    }else{
      return {code:-1, msg:"用户名密码不匹配"}
    }
  }
  checkToken(token){
    var auth = this.db.data.auth
    if(!auth || !auth.secret){
      return {code:-1, msg:"token不合法"}
    }
    var secret = auth.secret
    var decodedJwt = null
    try {
      decodedJwt = jwt.verify(token, secret)
    } catch(err) {
      console.log(`${moment().format()} WARN token invalid,token:${token}`)
    }
    if(decodedJwt){
      return true
    }else {
      return false
    }
  }
  allData() {
    var res = this.db.data
    res = lodash.cloneDeep(res)
    delete res.auth
    return res
  }
  updateTabs(data) {
    this.db.data.tabs = data
    this.db.write()
  }
  addTab(tabData) {
    this.db.data.tabs.push(tabData)
    this.db.write()
  }
  removeTab(tabIndex) {
    this.db.chain.get('tabs').remove((value, index, array) => {
      return index === tabIndex
    }).value()
    this.db.write()
  }
  getDbInstance() {
    return this.db
  }
}

var appDao = new AppDao()
export default appDao