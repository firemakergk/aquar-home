
function findLocationFitable(layoutList){
  let y = 0
  let h = 0
  for (let i = 0; i < layoutList.length; i++) {
    let l = layoutList[i]
    if (l.y === y) {
      y = l.y
      if(l.h > h){
        h = l.h
      }
    }else if(l.y > y) {
      y = l.y
      h = l.h
    }
  }
  y = y + h
  return {x:0,y}
}

export default {
  findLocationFitable:findLocationFitable
}