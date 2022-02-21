import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'
import SfuEnging from './endpoints/chatroom/service/sfuengine.js'

class SocketServer {
  ioServer = null
  socketMap = {}
  constructor(httpServer){
    console.log("socket.io初始化")
    this.ioServer = new SocketIOServer(httpServer)
    var nameSpace = this.ioServer.of('chatroom')
    nameSpace.on("connection", socket => {
      socket.on('join', data => {chatRoomSocketController.joinRoom(socket,data,callback)})
      socket.on('submitwords', data => {chatRoomSocketController.submitWords(socket,data,callback)})
      socket.on('call', data => {chatRoomSocketController.call(socket,data,callback)})
      socket.on('answer', data => {chatRoomSocketController.answer(socket,data,callback)})
      socket.on('icecandidate', (data,callback) => {chatRoomSocketController.iceCandidate(socket,data,callback)})
    })
    chatRoomSocketController.socketServer = this
    chatRoomSocketController.sfuEngine = new SfuEnging(this)
  }
}

export default SocketServer 