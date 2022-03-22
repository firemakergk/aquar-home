import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'
// import socketRouter from "./routes/socket-router.js"


class SocketServer {
  io = null
  constructor(httpServer){
    console.log("socket.io初始化")
    this.io = new SocketIOServer(httpServer)
    let chatRoomIo = this.io.of('/chatroom')
    chatRoomSocketController.io = chatRoomIo
    chatRoomSocketController.init()
    chatRoomIo.on('connection', (socket) => {
      // for(let routerKey in socketRouter){
      //   let router = socketRouter[routerKey]
      //   for(let k in router){
      //     (function(k) {
      //       socket.on(k, async (data, callback) => {router[k](socket,data,callback)})
      //       console.log(k)
      //     })(k)
      //   }
      // }
      socket.on('disconnect', async (reason) => {try{ await chatRoomSocketController.exitRoom(socket,reason,() => {})} catch(e){console.error(e)}})
      socket.on('createRoom', async (data, callback) => {try{ await chatRoomSocketController.createRoom(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('join', async (data, callback) => {try{ await chatRoomSocketController.join(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('updateName', async (data, callback) => {try{ await chatRoomSocketController.updateName(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('getProducers', async (data, callback) => {try{ await chatRoomSocketController.getProducers(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('getRouterRtpCapabilities', async (data, callback) => {try{ await chatRoomSocketController.getRouterRtpCapabilities(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('createWebRtcTransport', async (data, callback) => {try{ await chatRoomSocketController.createWebRtcTransport(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('connectTransport', async (data, callback) => {try{ await chatRoomSocketController.connectTransport(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('produce', async (data, callback) => {try{ await chatRoomSocketController.produce(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('consume', async (data, callback) => {try{ await chatRoomSocketController.consume(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('resume', async (data, callback) => {try{ await chatRoomSocketController.resume(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('getMyRoomInfo', async (data, callback) => {try{ await chatRoomSocketController.getMyRoomInfo(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('producerClosed', async (data, callback) => {try{ await chatRoomSocketController.producerClosed(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('exitRoom', async (data, callback) => {try{ await chatRoomSocketController.exitRoom(socket,data,callback)} catch(e){console.error(e)}})
      socket.on('postwords', (data, callback) => {try{ chatRoomSocketController.postWords(socket,data,callback)}  catch(e){console.error(e)}})
    })
  }
}

export default SocketServer 