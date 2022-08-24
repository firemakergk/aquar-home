import dateFormat from "dateformat"


class StringUtil{

  static parseFormatDateString(formatDateString){
    let str = formatDateString
    let nowDate = new Date()
    while(true){
      let match = /\$\{.*?\}/g.exec(str)
      if(!match){
        break
      }
      let matchStr = match[0]
      let start = match.index
      let end = start + match[0].length
      let preStr = str.slice(0, start)
      let postStr = str.slice(end, str.length)
      // let res = "".concat(preStr,'|',postStr)
      let dateStr = ""
      try{
        dateStr = dateFormat(nowDate, matchStr.substring(2,matchStr.length-1))
      }catch(error){
        console.warn(`format date string error:${error.message}`)
      }
      str = "".concat(preStr,dateStr,postStr)
    }
    return str
  }

}

export default StringUtil