class ChatRoomSocketController {
  joinRoom(socket, data) {
    socket.join(data.roomId)
  }
  submitWords(socket, data) {
    socket.nsp.to(Array.from(socket.rooms)).emit('distributewords', data);
    console.log(socket.nsp.sockets.size)
    var peerId = null
    for (let sid of socket.nsp.sockets.keys()) {
      if(sid != socket.id){
        peerId = sid
        break
      }
    }
    console.log(peerId)
  }
  call(socket, data) {
    var peer = null
    for (let sid of socket.nsp.sockets.keys()) {
      if(sid != socket.id){
        peer = socket.nsp.sockets.get(sid)
        break
      }
    }
    if(peer){
      peer.emit('call',{callerId: socket.id,offer: data.offer})
      console.log(`call --------callerId:${socket.id},calleeId:${peer.id},offer:${data.offer.sdp}`)
    }
  }
  answer(socket, data) {
    var peer = null
    for (let sid of socket.nsp.sockets.keys()) {
      if(sid != socket.id){
        peer = socket.nsp.sockets.get(sid)
        break
      }
    }
    if(peer){
      peer.emit('answer',{answer: data.answer})
      console.log(`answer --------calleeId:${socket.id},answer:${data.answer.sdp}`)
    }
    
  }
  iceCandidate(socket, data){
    var peer = null
    for (let sid of socket.nsp.sockets.keys()) {
      if(sid != socket.id){
        peer = socket.nsp.sockets.get(sid)
        break
      }
    }
    if(peer){
      peer.emit('icecandidate',{candidate: data.candidate})
      console.log(`icecandidate--------callerId:${socket.id},calleeId:${peer.id},candidate:${data.candidate}`)
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