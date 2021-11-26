var fs = require('fs');
var path = require('path');
var _ = require('lodash')

var walk = function(directoryName) {
  fs.readdir(directoryName, function(e, files) {
    if (e) {
      console.log('Error: ', e);
      return;
    }
    files.forEach(function(file) {
      var fullPath = path.join(directoryName,file);
      fs.stat(fullPath, function(e, f) {
        if (e) {
          console.log('Error: ', e);
          return;
        }
        if (f.isDirectory()) {
          walk(fullPath);
        } else {
          console.log('- ' + fullPath);
        }
      });
    });
  });
};
// walk("/var/aquardata")
var list = [{a:1},{b:2},{c:3}]
_.remove(list,(value, index, array) => {
  console.log(index+":"+JSON.stringify(value)+"--"+array.length)
  return index
})