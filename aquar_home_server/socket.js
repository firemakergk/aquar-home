import { Server as SocketIOServer } from "socket.io"
import chatRoomSocketController from './endpoints/chatroom/controller/socket-controller.js'
import mediasoup from 'mediasoup'
import config from './config.js'
import Room from './Room.js'
import Peer from './Peer.js'

class SocketServer {
  io = null
  socketMap = {}
  workers = []
  nextMediasoupWorkerIdx = 0
  roomList = new Map()
  constructor(httpServer){
    console.log("socket.io初始化")
    this.io = new SocketIOServer(httpServer)
    this.createWorkers()
    // // var nameSpace = this.io.of('chatroom')
    // nameSpace.on("connection", socket => {
    //   socket.on("disconnect", (reason) => {sfuEngine.disconnect(socket.id)})
    //   socket.on('join', (data, callback) => {chatRoomSocketController.joinRoom(socket,data,callback)})
    //   socket.on('postwords', (data, callback) => {chatRoomSocketController.postWords(socket,data,callback)})
    //   socket.on('createwebrtctransport', (data, callback) => {chatRoomSocketController.createWebRtcTransport(socket,data,callback)})
    //   socket.on('connecttransport', (data, callback) => {chatRoomSocketController.connectTransport(socket,data,callback)})
    //   socket.on('produce', (data, callback) => {chatRoomSocketController.produce(socket,data,callback)})
    //   socket.on('pullstream', (data, callback) => {chatRoomSocketController.pullStream(socket,data,callback)})
    //   socket.on('call', (data, callback) => {chatRoomSocketController.call(socket,data,callback)})
    //   socket.on('answer', (data, callback) => {chatRoomSocketController.answer(socket,data,callback)})
    //   socket.on('icecandidate', (data,callback) => {chatRoomSocketController.iceCandidate(socket,data,callback)})
    // })
    this.io.on('connection', (socket) => {
      // socket.on('createRoom', (data, callback) => {chatRoomSocketController.connectTransport(socket,data,callback)})
      socket.on('createRoom', async ({ room_id }, callback) => {
        if (this.roomList.has(room_id)) {
          callback(`room ${room_id} already exists`)
        } else {
          console.log('Created room', { room_id: room_id })
          let worker = await this.getMediasoupWorker()
          this.roomList.set(room_id, new Room(room_id, worker, this.io))
          callback(room_id)
        }
      })
    
      socket.on('join', ({ room_id, name }, cb) => {
        console.log('User joined', {
          room_id: room_id,
          name: name
        })
    
        if (!this.roomList.has(room_id)) {
          return cb({
            error: 'Room does not exist'
          })
        }
    
        let room = this.roomList.get(room_id)
        room.addPeer(new Peer(socket.id, name))
        socket.room_id = room_id
        socket.broadcast.emit('join',{id:room.id, peers:Object.fromEntries(room.peers), members: Array.from( room.peers.keys()) } )
        cb({id:room.id, peers:Object.fromEntries(room.peers), members: Array.from( room.peers.keys()) })
      })
    
      socket.on('getProducers', () => {
        if (!this.roomList.has(socket.room_id)) return
        console.log('Get producers', { name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}` })
    
        // send all the current producer to newly joined member
        let producerList = this.roomList.get(socket.room_id).getProducerListForPeer()
        let producerMap = this.roomList.get(socket.room_id).getProducerMapForPeer()
        socket.emit('newProducers', {producerList,producerMap: Object.fromEntries(producerMap)})
      })
    
      socket.on('getRouterRtpCapabilities', (_, callback) => {
        console.log('Get RouterRtpCapabilities', {
          name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
        })
    
        try {
          callback(this.roomList.get(socket.room_id).getRtpCapabilities())
        } catch (e) {
          callback({
            error: e.message
          })
        }
      })
    
      socket.on('createWebRtcTransport', async (_, callback) => {
        console.log('Create webrtc transport', {
          name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
        })
    
        try {
          const { params } = await this.roomList.get(socket.room_id).createWebRtcTransport(socket.id)
    
          callback(params)
        } catch (err) {
          console.error(err)
          callback({
            error: err.message
          })
        }
      })
    
      socket.on('connectTransport', async ({ transport_id, dtlsParameters }, callback) => {
        console.log('Connect transport', { name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}` })
    
        if (!this.roomList.has(socket.room_id)) return
        await this.roomList.get(socket.room_id).connectPeerTransport(socket.id, transport_id, dtlsParameters)
    
        callback('success')
      })
    
      socket.on('produce', async ({ kind, rtpParameters, producerTransportId }, callback) => {
        if (!this.roomList.has(socket.room_id)) {
          return callback({ error: 'not is a room' })
        }
    
        let producer_id = await this.roomList.get(socket.room_id).produce(socket.id, producerTransportId, rtpParameters, kind)
    
        console.log('Produce', {
          type: `${kind}`,
          name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
          id: `${producer_id}`
        })
    
        callback({
          producer_id
        })
      })
    
      socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities }, callback) => {
        //TODO null handling
        let params = await this.roomList.get(socket.room_id).consume(socket.id, consumerTransportId, producerId, rtpCapabilities)
    
        console.log('Consuming', {
          name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
          producer_id: `${producerId}`,
          consumer_id: `${params.id}`
        })
    
        callback(params)
      })
    
      socket.on('resume', async (data, callback) => {
        await consumer.resume()
        callback()
      })
    
      socket.on('getMyRoomInfo', (_, cb) => {
        cb(this.roomList.get(socket.room_id).toJson())
      })
    
      socket.on('disconnect', () => {
        console.log('Disconnect', {
          name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
        })
    
        if (!socket.room_id) return
        this.roomList.get(socket.room_id).removePeer(socket.id)
      })
    
      socket.on('producerClosed', ({ producer_id }) => {
        console.log('Producer close', {
          name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
        })
    
        this.roomList.get(socket.room_id).closeProducer(socket.id, producer_id)
      })
    
      socket.on('exitRoom', async (_, callback) => {
        console.log('Exit room', {
          name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
        })
    
        if (!this.roomList.has(socket.room_id)) {
          callback({
            error: 'not currently in a room'
          })
          return
        }
        // close transports
        await this.roomList.get(socket.room_id).removePeer(socket.id)
        if (this.roomList.get(socket.room_id).getPeers().size === 0) {
          this.roomList.delete(socket.room_id)
        }
    
        socket.room_id = null
    
        callback('successfully exited room')
      })
    })
  }

  async createWorkers() {
    let { numWorkers } = config.mediasoup
    for (let i = 0; i < numWorkers; i++) {
      let worker = await mediasoup.createWorker({
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort
      })
  
      worker.on('died', () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
        setTimeout(() => process.exit(1), 2000)
      })
      this.workers.push(worker)
    }
  }
  getMediasoupWorker() {
    const worker = this.workers[this.nextMediasoupWorkerIdx]
    if (++this.nextMediasoupWorkerIdx === this.workers.length) this.nextMediasoupWorkerIdx = 0
    return worker
  }
}

export default SocketServer 