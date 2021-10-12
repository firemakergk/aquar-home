import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'
import fs from 'fs'
const DB_PATH = '/var/aquardata/db/'
var appEntryDao = (function() {
  if (!fs.existsSync(DB_PATH+'db.json')){
    var defaultConfig = fs.readFileSync('./db.json','utf8')
    fs.mkdirSync(DB_PATH, { recursive: true });
    fs.writeFileSync(DB_PATH+'db.json',defaultConfig)
  }
  const adapter = new JSONFile(DB_PATH+'db.json')
  var db = new Low(adapter)
  db.read()
  db.chain = lodash.chain(db.data)

  return {
    saveAppEntry: function(entry) {
      db.widgets.push(entry)
      db.write()
    },
    findOneById: function(id) {
      var res = db.get('widgets')
        .find({ 'id': id }).value()
      return res
    },
    findByCurIndex: function() {
      var index = db.chain.get('config').get('current_index').value
      index = index ? index:0;
      return db.data.tabs[index].widgets
    },
    findByPage: function(pageNo, pagesize, sortByAsc) {
      return db.get('widgets')
        .sortBy('sort')
      // .sortBy(function(item){return item.sort})
        .slice((pageNo - 1) * pagesize, pagesize)
        .value()
    },
    updateById: function(id,item) {
      db.get('widgets')
      .find({ id: id })
      .assign(item)
      .write()
    },
    deleteById: function(id) {
      db.get('widgets').remove({'id':id}).write()
    },
    updateConfig: function(config) {
      db.get('config')
      .assign(config)
      .write()
    },
    getConfig: function() {
      var res = db.data.config
      return res
    },
    getDbInstance: function() {
      return db
    }
  }
})()

export default appEntryDao