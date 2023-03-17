import jwt from 'jsonwebtoken'
import appDao from '../../../service/db/app-dao.js'

class TransmissionAdvicer {
  
  async afterWidgetAdded (tabIndex,widgetData) {  
    var id = widgetData.id
    var data = widgetData.data
    var secret = appDao.getAuth().secret
    var token = jwt.sign({ uname: data.userName,pass: data.password}, secret,{})
    data.token = token
    data.password = null 
    var db = appDao.getDbInstance()
    db.chain
    .get('tabs['+tabIndex+'].widgets')
    .find({ 'id': id })
    .get('data')
    .assign(data).value()
    db.write()
  }

  async afterWidgetUpdated (tabIndex,widgetData) {  
    if(widgetData && widgetData.data.userName && widgetData.data.password){
      var id = widgetData.id
      var data = widgetData.data
      var secret = appDao.getAuth().secret
      var token = jwt.sign({ uname: data.userName,pass: data.password}, secret,{})
      data.token = token
      data.password = null
      var db = appDao.getDbInstance()
      db.chain
      .get('tabs['+tabIndex+'].widgets')
      .find({ 'id': id })
      .get('data')
      .assign(data).value()
      db.write()
    }
  }
}
const transmissionAdvicer = new TransmissionAdvicer()
export default transmissionAdvicer