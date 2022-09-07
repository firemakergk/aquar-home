import * as _ from 'lodash'
import light from '@/assets/themes/light.json'
import dark from '@/assets/themes/dark.json'
import lightPurple from '@/assets/themes/light_purple.json'
import lightTeal from '@/assets/themes/light_teal.json'
import darkCyan from '@/assets/themes/dark_cyan.json'
import darkGreen from '@/assets/themes/dark_green.json'
import defaultBg from '@/assets/bg_images/bg.jpg'
import axios from '@/service/axios.js'
import colors from 'vuetify/lib/util/colors'

class ThemeService {
  static defaultThemes = {
    light:ThemeService.compile(light), 
    light_purple:ThemeService.compile(lightPurple),
    light_teal:ThemeService.compile(lightTeal),
    dark:ThemeService.compile(dark), 
    dark_cyan:ThemeService.compile(darkCyan),
    dark_green:ThemeService.compile(darkGreen)
  }
  static defaultConfig = {
    current_index: 0,
    appearance:{
      bgImg:defaultBg,
      bgColor:'#42433E',
      blurNum:'0',
      theme:'light',
      themes:[],
      cacheSerial: '0'
    }
  }
  static setupVuetifyTheme(vue, theme){
    if (!('vuetify' in theme) || !('ui' in theme) || !('name' in theme) || !('dark' in theme)){
      console.error('theme object is in wrong format.')
      return
    }
    vue.$vuetify.theme.dark = theme.dark 
    vue.$vuetify.theme.themes[theme.name] = theme.vuetify
    vue.$vuetify.theme.current = theme.ui
  }
  
  static fetchDefault(name){
    if(name){
      let config = _.cloneDeep(ThemeService.defaultConfig)
      config.theme = name
      return {config:config, theme:ThemeService.defaultThemes[name]}
    }else{
      return {config:ThemeService.defaultConfig, theme:ThemeService.defaultThemes.light}
    }
  }

  static fetchFromCache(){
    let res = localStorage.getItem('theme')
    if(!res){
      return null
    }
    res = JSON.parse(res)
    if (!('config' in res) || !('theme' in res)){
      console.error('theme object is in wrong format.')
      return null
    }
    return res
  }

  static updateCache(cacheData){
    console.log('updateCache'+JSON.stringify(cacheData))
    if(!cacheData.theme){
      if(cacheData.config && cacheData.config.appearance && (cacheData.config.appearance.theme in ThemeService.defaultThemes)){
        cacheData.theme = ThemeService.defaultThemes[cacheData.config.appearance.theme]
      }else{
        cacheData.theme = ThemeService.defaultThemes.light
      }
    }
    localStorage.setItem('theme',JSON.stringify(cacheData))
  }
  static async fetchFromServer(){
    let res = null
    await axios
      .get('/api/config')
      .then(response => {
        this.configData = response.data.config
        res = response.data.themeDetail
      })
    return ThemeService.compile(res)
  }

  static validTheme(data){
    if(!data.theme){
      if(data.config && data.config.appearance && (data.config.appearance.theme in ThemeService.defaultThemes)){
        data.theme = ThemeService.defaultThemes[data.config.appearance.theme]
      }else{
        data.theme = ThemeService.defaultThemes.light
      }
    }
    return data
  }
  static compile(sourceJson){
    if (!('vuetify' in sourceJson) || !('ui' in sourceJson) ||  !('name' in sourceJson)){
      console.error('theme object is in wrong format.')
      return
    }
    let res = _.cloneDeep(sourceJson)
    // let res = JSON.parse(JSON.stringify(sourceJson))
    //将vuetify部分的变量解析为色值对象
    let vuetifyColorMap = {}
    for(let key in sourceJson.vuetify){
      let value = sourceJson.vuetify[key]
      if(typeof value === 'string'){
        let match = /\$\{colors\.(\w+?)\}/g.exec(value)
        if(!match || !match[1]){
          continue
        }
        vuetifyColorMap[key] = colors[match[1]]
        
      }else if(typeof value === 'object' && value !== null){
        vuetifyColorMap[key] = {}
        for(let subKey in value){
          let subValue = value[subKey]
          if(typeof subValue !== 'string'){
            continue
          }
          let subMatch = /\$\{colors\.(\w+?)\.?(\w+?)?\}/g.exec(subValue)
          if(!subMatch || !subMatch[1] || !subMatch[2]){
            vuetifyColorMap[key][subKey] = subValue
            continue
          }
          vuetifyColorMap[key][subKey] = colors[subMatch[1]][subMatch[2]]
        }
      }
    }
    res.vuetify = vuetifyColorMap 

    //将ui部分的变量解析为色值
    for(let key in sourceJson.ui){
      let value = res.ui[key]
      let matchV = /\$\{vuetify\.(\w+?)\.?(\w+?)?\}/g.exec(value)
      let matchC = /\$\{colors\.(\w+?)\.?(\w+?)?\}/g.exec(value)
      let match = null
      let flag = null
      if(!(matchV && matchV[1] && matchV[2]) && !(matchC && matchC[1] && matchC[2])){
        continue
      }else if(matchV && matchV[1] && matchV[2]){
        flag = 'V'
        match = matchV
      }else if(matchC && matchC[1] && matchC[2]){
        flag = 'C'
        match = matchC
      }
      if(match === null){
        continue
      }
      // res.ui[key] = `\$\{${vuetifySet[matchV[1]].substring(2,matchStr.length-1)}.${matchV[2]}`
      let start = match.index
      let end = start + match[0].length
      let preStr = value.slice(0, start)
      let postStr = value.slice(end, value.length)
      if(flag === 'V'){
        res.ui[key] = vuetifyColorMap[match[1]][match[2]]+postStr
      }else if(flag === 'C'){
        res.ui[key] = colors[match[1]][match[2]]+postStr
      }
    }

    return res

  }
  
}
console.log(ThemeService.compile(light))
export default ThemeService