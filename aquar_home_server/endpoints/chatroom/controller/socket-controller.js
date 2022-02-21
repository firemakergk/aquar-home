import appDao from "../../../service/db/app-dao.js"
import Peer from "../service/Peer.js"

class ChatRoomSocketController {
  socketServer = null
  sfuEngine = null
  joinRoom(socket, data, callback) {
    socket.join(data.roomId)
    var widget = appDao.findOneById(data.tabIndex, data.roomId)
    if(!widget){
      console.error(`未找到对应的组件信息,widgetId:${data.roomId}`)
      callback(null)
    }
    let room = this.sfuEngine.getRoom(data.roomId)
    if(!room){
      room = this.sfuEngine.createRoom(data.roomId, widget.name)
    }
    room.addPeer(new Peer(socket.id, socket.id))
    var members = Array.from(room.getPeers().keys())
    socket.to(data.roomId).emit('join', {roomId: data.roomId, name:widget.name, members: members, latestNember: socket.id});
    callback({roomId: data.roomId, name:widget.name, members: members, latestNember: socket.id})
  }
  submitWords(socket, data) {
    socket.to(Array.from(socket.rooms)).emit('distributewords', data);
    socket.emit('distributewords', data);
  }
  call(socket, data) {
    //data中存在calleeId说明是在重新协商，需要将信息传给对应的callee而不是整个room
    if(data.calleeId){
      socket.to(data.calleeId).emit('call', data);
      console.log(`[call single] callerId:${socket.id},offer:${data.offer.sdp}`) 
    }else{
      //data中不存在calleeId说明是在通知房间中所有其他用户建立连接，需要将信息传给房间中的所有人
      socket.to(Array.from(socket.rooms)).emit('call', data);
      console.log(`[call room] callerId:${socket.id},offer:${data.offer.sdp}`) 
    }
    
  }
  answer(socket, data) {
    socket.to(data.callerId).emit('answer',data)
    console.log(`[answer] callerId:${data.callerId},answer:${data.answer.sdp}`)
  }
  iceCandidate(socket, data){
    var peer = socket.nsp.sockets.get(data.remoteId)
    if(peer){
      peer.emit('icecandidate',{sourceId: data.sourceId, candidate: data.candidate})
      console.log(`[icecandidate] sourceId:${socket.id},remoteId:${peer.id},candidate:${data.candidate}`)
    }
  }
}
  
var chatRoomSocketController = new ChatRoomSocketController()
export default chatRoomSocketController 
/*
-将node开发服务器以及vue开发服务器都改成https
使用stun服务器进行公网调试
更换视频源功能开发
对端直接关闭窗口后的断连处理
rtc room的mesh方式实现
rtc room sfu 服务器选型（srs、Pion、Jitsi、mediasoup）
 */