import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
import fs from 'fs'
import _ from 'lodash'

class ThemeDao {
  DB_PATH = '/var/aquardata/db/'
  db = null
  constructor() {
    this.db = new LowSync(new JSONFileSync(this.DB_PATH+'themes.json'))
    this.db.read()
    this.db.chain = lodash.chain(this.db.data)
  }

  saveOrUpdate(data) {
    if(!data||!data.name){
      console.warn(`ThemeDao saveOrUpdate failed, data:${data} `)
      return null
    }
    let res = this.db.chain.get('themes')
      .find({ 'name': data.name }).value()
    if(res){
      this.db.chain.get('themes').remove({ 'name': data.name }).value()
      this.db.write()
    }
    this.db.data.themes.push(data)
    this.db.write()
  }

  findOneByName(name) {
    let res = this.db.chain.get('themes')
      .find({ 'name': name }).value()
    return res
  }

  deleteByName(name) {
    this.db.chain.get('themes').remove({ 'name': name }).value()
      this.db.write()
  }

  allThemes() {
    var res = this.db.data
    res = lodash.cloneDeep(res)
    return res.themes
  }

  listNames() {
    let res = this.db.chain.get('themes').value()
    if(res && res.length > 0){
      return res.map(i => i.name)
    }else {
      return []
    }
  }
 
  getDbInstance() {
    return this.db
  }
}

var themeDao = new ThemeDao()
export default themeDao