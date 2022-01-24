import appDao from "../../../service/db/app-dao.js"
class ChatRoomSocketController {
  joinRoom(socket, data) {
    socket.join(data.roomId)
    var widget = appDao.findOneById(data.tabIndex, data.roomId)
    var members = Array.from(socket.nsp.sockets.keys())
    socket.to(data.roomId).emit('join', {roomId: data.roomId, name:widget.name, members: members, latestNember: socket.id});
    socket.emit('join', {roomId: data.roomId, name:widget.name, members: members, latestNember: socket.id});
  }
  submitWords(socket, data) {
    socket.to(Array.from(socket.rooms)).emit('distributewords', data);
    socket.emit('distributewords', data);
  }
  call(socket, data) {
    socket.to(Array.from(socket.rooms)).emit('call', data);
    console.log(`call --------callerId:${socket.id},offer:${data.offer.sdp}`)
  }
  answer(socket, data) {
    var peer = socket.nsp.sockets[data.calleeId]
    if(peer){
      peer.emit('answer',data)
      console.log(`answer --------calleeId:${socket.id},answer:${data.answer.sdp}`)
    }
    
  }
  iceCandidate(socket, data){
    var peer = socket.nsp.sockets.get(data.remoteId)
    if(peer){
      peer.emit('icecandidate',{sourceId: data.sourceId, candidate: data.candidate})
      console.log(`icecandidate--------sourceId:${socket.id},remoteId:${peer.id},candidate:${data.candidate}`)
    }
  }
}
  
var chatRoomSocketController = new ChatRoomSocketController()
export default chatRoomSocketController 
/*
将node开发服务器以及vue开发服务器都改成https
使用stun服务器进行公网调试
更换视频源功能开发
对端直接关闭窗口后的断连处理
rtc room的mesh方式实现
rtc room sfu 服务器选型（srs、Pion、Jitsi、mediasoup）
 */