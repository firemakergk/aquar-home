import fs from 'fs'
import path from 'path'

function listFilesRecursive(directory,resList ){
  var files = fs.readdirSync(directory)
  for(var i=0;i<files.length;i++){
    var fullPath = path.join(directory,files[i]);
    var pathInfo = fs.statSync(fullPath)
    if (pathInfo.isDirectory()) {
      console.log('目录：'+fullPath)
      listFilesRecursive(fullPath,resList)
    } else {
      console.log('文件'+fullPath)
      resList.push(fullPath)
    }
  }
}

export default {
  listFilesRecursive:listFilesRecursive
}