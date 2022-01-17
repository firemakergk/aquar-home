import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'

class SocketServer {
  ioServer = null
  socketMap = {}
  constructor(httpServer){
    console.log("socket.io初始化")
    this.ioServer = new SocketIOServer(httpServer)
    var nameSpace = this.ioServer.of('chatroom')
    nameSpace.on("connection", socket => {
      socket.on('join', data => {chatRoomSocketController.joinRoom(socket,data)})
      socket.on('submitwords', data => {chatRoomSocketController.submitWords(socket,data)})
      socket.on('call', data => {chatRoomSocketController.call(socket,data)})
      socket.on('answer', data => {chatRoomSocketController.answer(socket,data)})
      socket.on('icecandidate', data => {chatRoomSocketController.iceCandidate(socket,data)})
    })
  }
}

export default SocketServer 