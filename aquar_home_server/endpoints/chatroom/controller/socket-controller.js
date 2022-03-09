import mediasoup from 'mediasoup'
import appDao from "../../../service/db/app-dao.js"
import Peer from "../service/Peer.js"
import Room from '../service/Room.js'
import config from '../service/config.js'

class ChatRoomSocketController {
  io = null
  workers = []
  nextMediasoupWorkerIdx = 0
  roomList = new Map()
  peers = new Map()
  async init(){
    await this.createWorkers()
  }

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

  async join(socket, data, cb) {
    let { room_id, name } = data
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
    let peer = new Peer(socket, name)
    room.addPeer(peer)
    this.peers.set(socket.id, peer)
    socket.room_id = room_id
    room.peers
    socket.broadcast.emit('join',{id:room.id, members: Array.from( room.peers.keys()) } )
    cb({id:room.id, members: Array.from( room.peers.keys()) })
  }

  async getProducers(socket, data, callback) {
    if (!this.roomList.has(socket.room_id)){
      return
    } 
    console.log('Get producers', { name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}` })
    // send all the current producer to newly joined member
    let producerList = this.roomList.get(socket.room_id).getProducerListForPeer()
    let producerMap = this.roomList.get(socket.room_id).getProducerMapForPeer()
    socket.emit('newProducers', {producerList,producerMap: Object.fromEntries(producerMap)})
  }

  async getRouterRtpCapabilities(socket, data, callback){
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
  }

  async createWebRtcTransport(socket, data, callback) {
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
  }

  async connectTransport(socket, data, callback) {
    let { transport_id, dtlsParameters } = data
    console.log('Connect transport', { name: `${this.roomList.get(socket.room_id).getPeers().get(socket.id).name}` })
    
    if (!this.roomList.has(socket.room_id)) {
      return
    }
    await this.roomList.get(socket.room_id).connectPeerTransport(socket.id, transport_id, dtlsParameters)
    callback('success')
  }
  
  async produce(socket, data, callback) {
    let { kind, rtpParameters, producerTransportId } = data
    console.log(`produce request kind:${kind},producerTransportId:${producerTransportId}`)
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
  }

  async consume(socket, data, callback) {
    let { consumerTransportId, producerId, rtpCapabilities } = data
    let params = await this.roomList.get(socket.room_id).consume(socket.id, consumerTransportId, producerId, rtpCapabilities)
    console.log('Consuming', {
      name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
      producer_id: `${producerId}`,
      consumer_id: `${params.id}`
    })
    callback(params)
  }

  async resume(socket, data, callback) {
    //!!bug here
    await consumer.resume()
    callback()
  }
  async getMyRoomInfo(socket, data, callback) {
    cb(this.roomList.get(socket.room_id).toJson())
  }

  async disconnect(socket, data, callback) {
    console.log('Disconnect', {
      name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
    })

    if (!socket.room_id) return
    this.roomList.get(socket.room_id).removePeer(socket.id)
  }

  async producerClosed(socket, data, callback) {
    console.log('Producer close', {
      name: `${this.roomList.get(socket.room_id) && this.roomList.get(socket.room_id).getPeers().get(socket.id).name}`
    })

    this.roomList.get(socket.room_id).closeProducer(socket.id)
  }

  async exitRoom(socket, data, callback) {
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
    // if (this.roomList.get(socket.room_id).getPeers().size === 0) {
    //   this.roomList.delete(socket.room_id)
    // }
    let room = this.roomList.get(socket.room_id)
    if(room && room.peers && room.peers.size > 0){
      socket.broadcast.emit('join',{id:socket.room_id, members:Array.from( room.peers.keys()) } )
    }
    socket.room_id = null
    callback('successfully exited room')
  }

  postWords(socket, data, callback) {
    let peer = this.peers.get(socket.id)
    if(!peer){
      console.error(`未找到对应的连接信息,socket.id:${socket.id}`)
      return
    }
    peer.postWords(data)
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
  
var chatRoomSocketController = new ChatRoomSocketController()
export default chatRoomSocketController 