import appDao from "../../../service/db/app-dao.js"
import Peer from "../service/Peer.js"

class ChatRoomSocketController {
  socketServer = null
  sfuEngine = null

  async createRoom(sokcet, data, callback){
    let {room_id} = data
    if (this.roomList.has(room_id)) {
      callback(`room ${room_id} already exists`)
    } else {
      console.log('Created room', { room_id: room_id })
      let worker = await this.getMediasoupWorker()
      this.roomList.set(room_id, new Room(room_id, worker, this.io))
      callback(room_id)
    }
  }
  async joinRoom(socket, data, callback) {
    socket.join(data.roomId)
    var widget = appDao.findOneById(data.tabIndex, data.roomId)
    if(!widget){
      console.error(`未找到对应的组件信息,widgetId:${data.roomId}`)
      callback(null)
    }
    let room = this.sfuEngine.getRoom(data.roomId)
    if(!room){
      room = await this.sfuEngine.createRoom(data.roomId, widget.name)
    }
    let eventData = await room.join(new Peer(socket.id, socket, socket.id))
    let transport = await this.sfuEngine.createWebRtcTransport(socket.id)
    eventData.transport = transport
    callback(eventData)
  }

  postWords(socket, data, callback) {
    let peer = this.sfuEngine.getPeer(socket.id)
    if(!peer){
      console.error(`未找到对应的连接信息,socket.id:${socket.id}`)
      return
    }
    let eventData = peer.postWords(data.content)
    // callback(eventData)
  }
  async createWebRtcTransport(socket, data, callback) {
    let transport = await this.sfuEngine.createWebRtcTransport(socket.id)
    callback(transport)
  }
  async connectTransport(socket, data, callback) {
    let peer = this.sfuEngine.getPeer(socket.id)
    if(!peer){
      console.error(`未找到对应的连接信息,socket.id:${socket.id}`)
      callback()
      return
    }
    await peer.connectTransport(data.transportId, data.dtlsParameters)
    console.log(`connectTransport成功,peerId:${socket.id},transportId:${data.transportId}`)
    callback(0)
  }

  async produce(socket, data, callback){
    let peer = this.sfuEngine.getPeer(socket.id)
    if(!peer){
      console.error(`未找到对应的连接信息,socket.id:${socket.id}`)
      callback()
      return
    }
    let {producerTransportId, kind, rtpParameters} = data
    await peer.produce(producerTransportId, kind, rtpParameters)
  }

  async pullStream(socket, data, callback){
    let peer = this.sfuEngine.getPeer(socket.id)
    if(!peer){
      console.error(`未找到对应的连接信息,socket.id:${socket.id}`)
      callback()
      return
    }
    callback(await peer.consume(data.consumerTransportId, data.producerId, data.rtpCapabilities))
  }

  call(socket, data) {
    socket.to(Array.from(socket.rooms)).emit('call', data);
    console.log(`[call room] callerId:${socket.id},offer:${data.offer.sdp}`) 
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