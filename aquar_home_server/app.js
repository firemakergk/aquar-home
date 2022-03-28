import Koa from 'koa'
import views from 'koa-views'
import json from 'koa-json'
import koajwt from 'koa-jwt'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'
// import logger from 'koa-logger'
import koastatic from 'koa-static'
import path from 'path';
import index from './routes/index.js'
import users from './routes/users.js'
import axios from 'axios'
import moment from 'moment'
import appDao from './service/db/app-dao.js'
import jobService from './service/job-service.js'
import fs from 'fs'

const DB_PATH = '/var/aquardata/db/'
const __dirname = path.resolve();
if (!fs.existsSync(DB_PATH+'db.json')){
  let defaultConfig = fs.readFileSync('./db.json','utf8')
  fs.mkdirSync(DB_PATH, { recursive: true });
  fs.writeFileSync(DB_PATH+'db.json',defaultConfig)
}
if (!fs.existsSync(DB_PATH+'themes.json')){
  let defaultConfig = '{"themes":[]}'
  fs.mkdirSync(DB_PATH, { recursive: true });
  fs.writeFileSync(DB_PATH+'themes.json',defaultConfig)
}
if (!fs.existsSync('./public/assets/bg.jpg')){
  fs.mkdirSync('./public/assets/', { recursive: true });
  fs.copyFileSync('./assets/bg.jpg','./public/assets/bg.jpg')
} 

const app = new Koa()
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())
console.log(__dirname)
app.use(koastatic(__dirname + '/public'))
app.use(koastatic('/var/aquardata'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  console.log(`${moment().format()} request: ${ctx.method} ${ctx.url}, body:${JSON.stringify(ctx.request.body)}`)
  await next()
  const end = new Date() 
  const ms = end - start
  console.log(`${moment().format()} response: ${ctx.method} ${ctx.url}, body:${JSON.stringify(ctx.body)} - duration:${ms}`)
})

if(process.env.NODE_ENV != 'dev'){
  console.log('token校验开启'+process.env.NODE_ENV)
  app.use(koajwt({
    secret: appDao.getSecret()
  }).unless({ // 配置白名单
    path: [ /\/assets/, /\/api\/login/, /\/api\/config/]
  }))
}else{
  console.log('开发环境关闭token校验')
}


// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())


// error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// });

axios.prototype.AXIOS_LOG_CONTENT_TYPES = [
  'text/html',
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded'
]
axios.prototype.ifLogDetail = function(contentType) {
  if(!contentType){
    return false
  }
  for(var i=0;i<axios.prototype.AXIOS_LOG_CONTENT_TYPES.length;i++){
    var c = axios.prototype.AXIOS_LOG_CONTENT_TYPES[i]
    if(contentType.indexOf(c) >= 0){
      return true
    }
  }
  return false
}
axios.interceptors.request.use(function (config) {
  
  var logStr = `${moment().format()} axios request-- url:[${config.method}] ${config.url}`
  if(axios.prototype.ifLogDetail(config.headers.common.Accept)){
    var body = JSON.stringify(config.data)
    var params = JSON.stringify(config.params)
    var auth = JSON.stringify(config.auth)
    if(auth){
      logStr = logStr + `,auth:${auth}`
    }
    if(params){
      logStr = logStr + `,params:${params}`
    }
    if(body){
      logStr = logStr + `,body:${body}`
    }
  }else{
    logStr = logStr + `content-type: ${config.headers.Accept}`
  }
  console.log(logStr)
  return config
}, null, { synchronous: true })
axios.interceptors.response.use(function (response) {
  if(axios.prototype.ifLogDetail(response.headers['content-type'])){
    console.log(`${moment().format()} axios response-- status:${response.status} url:[${response.config.method}] ${response.config.url},data:${JSON.stringify(response.data)}`)
  }else{
    console.log(`${moment().format()} axios response-- status:${response.status} url:[${response.config.method}] ${response.config.url},content-type:${response.headers['content-type']}`)
  }
  return response
}, function (error) {
  if(!error.response){
    console.log(`${moment().format()} axios response error-- url:[${error.config.method}] ${error.config.url},code:${error.status},message:${error.message}`)
    return Promise.reject(error)
  }
  if(axios.prototype.ifLogDetail(error.response.headers['Content-Type'])){
    console.log(`${moment().format()} axios response error-- status:${error.response.status} url:[${error.response.config.method}] ${error.response.config.url},data:${JSON.stringify(error.response.data)}`)
  }else{
    console.log(`${moment().format()} axios response error-- status:${error.response.status} url:[${error.response.config.method}] ${error.response.config.url},content-type:${error.response.headers['content-type']}`)
  }
  return Promise.reject(error);
});

// jobService.start()

export default app
