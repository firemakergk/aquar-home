import chatRoomSocketController from '../endpoints/chatroom/controller/socket-controller.js'

export default {
  'chatroom': {
    'join': chatRoomSocketController.joinRoom,
    'test11': chatRoomSocketController.test,
    'submitwords':chatRoomSocketController.submitWords
  }
}