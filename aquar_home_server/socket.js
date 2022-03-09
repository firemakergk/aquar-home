import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'

class SocketServer {
  io = null
  constructor(httpServer){
    console.log("socket.io初始化")
    this.io = new SocketIOServer(httpServer)
    let chatRoomIo = this.io.of('/chatroom')
    chatRoomSocketController.io = chatRoomIo
    chatRoomSocketController.init()
    chatRoomIo.on('connection', (socket) => {
      socket.on('createRoom', (data, callback) => {chatRoomSocketController.createRoom(socket,data,callback)})
      socket.on('join', (data, callback) => {chatRoomSocketController.join(socket,data,callback)})
      socket.on('getProducers', (data, callback) => {chatRoomSocketController.getProducers(socket,data,callback)})
      socket.on('getRouterRtpCapabilities', (data, callback) => {chatRoomSocketController.getRouterRtpCapabilities(socket,data,callback)})
      socket.on('createWebRtcTransport', (data, callback) => {chatRoomSocketController.createWebRtcTransport(socket,data,callback)})
      socket.on('connectTransport', (data, callback) => {chatRoomSocketController.connectTransport(socket,data,callback)})
      socket.on('produce', (data, callback) => {chatRoomSocketController.produce(socket,data,callback)})
      socket.on('consume', (data, callback) => {chatRoomSocketController.consume(socket,data,callback)})
      socket.on('resume', (data, callback) => {chatRoomSocketController.resume(socket,data,callback)})
      socket.on('getMyRoomInfo', (data, callback) => {chatRoomSocketController.getMyRoomInfo(socket,data,callback)})
      socket.on('disconnect', (data, callback) => {chatRoomSocketController.disconnect(socket,data,callback)})
      socket.on('producerClosed', (data, callback) => {chatRoomSocketController.producerClosed(socket,data,callback)})
      socket.on('exitRoom', (data, callback) => {chatRoomSocketController.exitRoom(socket,data,callback)})
      socket.on('postwords', (data, callback) => {chatRoomSocketController.postWords(socket,data,callback)})
    })
  }
}

export default SocketServer 