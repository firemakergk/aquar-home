import chatRoomSocketController from '../endpoints/chatroom/controller/socket-controller.js'

export default {
  'chatroom': {
    "createRoom":chatRoomSocketController.createRoom,
    "join":chatRoomSocketController.join,
    "getProducers":chatRoomSocketController.getProducers,
    "getRouterRtpCapabilities":chatRoomSocketController.getRouterRtpCapabilities,
    "createWebRtcTransport":chatRoomSocketController.createWebRtcTransport,
    "connectTransport":chatRoomSocketController.connectTransport,
    "produce":chatRoomSocketController.produce,
    "consume":chatRoomSocketController.consume,
    "resume":chatRoomSocketController.resume,
    "getMyRoomInfo":chatRoomSocketController.getMyRoomInfo,
    "disconnect":chatRoomSocketController.disconnect,
    "producerClosed":chatRoomSocketController.producerClosed,
    "exitRoom":chatRoomSocketController.exitRoom,
    "postwords":chatRoomSocketController.postWords
  }
}