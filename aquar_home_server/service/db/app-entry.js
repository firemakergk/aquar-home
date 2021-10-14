import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import fs from 'fs'


class AppDao {
  DB_PATH = '/var/aquardata/db/'
  db = null
  constructor() {
    if (!fs.existsSync(this.DB_PATH+'db.json')){
      var defaultConfig = fs.readFileSync('./db.json','utf8')
      fs.mkdirSync(this.DB_PATH, { recursive: true });
      fs.writeFileSync(this.DB_PATH+'db.json',defaultConfig)
    }
    this.db = new LowSync(new JSONFileSync(this.DB_PATH+'db.json'))
    this.db.read()
    this.db.chain = lodash.chain(this.db.data)
  }

  saveAppEntry(tabIndex,entry) {
    this.db.data.tabs[tabIndex].widgets.push(entry)
    this.db.write()
  }
  findOneById(tabIndex,id) {
    var res = this.db.chain.get('tabs['+tabIndex+'].widgets')
      .find({ 'id': id }).value()
    return res
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
  allData() {
    var res = this.db.data
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
  getDbInstance() {
    return this.db
  }
}

var appDao = new AppDao()
export default appDao