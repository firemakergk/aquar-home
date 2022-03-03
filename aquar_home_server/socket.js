import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'
import SfuEnging from './endpoints/chatroom/service/sfuengine.js'

class SocketServer {
  ioServer = null
  socketMap = {}
  constructor(httpServer){
    console.log("socket.io初始化")
    this.ioServer = new SocketIOServer(httpServer)
    chatRoomSocketController.socketServer = this
    let sfuEngine = new SfuEnging(this)
    chatRoomSocketController.sfuEngine = sfuEngine
    var nameSpace = this.ioServer.of('chatroom')
    nameSpace.on("connection", socket => {
      socket.on("disconnect", (reason) => {sfuEngine.disconnect(socket.id)})
      socket.on('join', (data, callback) => {chatRoomSocketController.joinRoom(socket,data,callback)})
      socket.on('postwords', (data, callback) => {chatRoomSocketController.postWords(socket,data,callback)})
      socket.on('createwebrtctransport', (data, callback) => {chatRoomSocketController.createWebRtcTransport(socket,data,callback)})
      socket.on('connecttransport', (data, callback) => {chatRoomSocketController.connectTransport(socket,data,callback)})
      socket.on('produce', (data, callback) => {chatRoomSocketController.produce(socket,data,callback)})
      socket.on('pullstream', (data, callback) => {chatRoomSocketController.pullStream(socket,data,callback)})
      socket.on('call', (data, callback) => {chatRoomSocketController.call(socket,data,callback)})
      socket.on('answer', (data, callback) => {chatRoomSocketController.answer(socket,data,callback)})
      socket.on('icecandidate', (data,callback) => {chatRoomSocketController.iceCandidate(socket,data,callback)})
    })
    
  }
}

export default SocketServer 