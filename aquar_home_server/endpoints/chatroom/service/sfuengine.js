import mediasoup from 'mediasoup'
import config from "./config.js"
import Room from "./room.js"

class SfuEngine {
  ioServer = null
  namespace = null
  nextMediasoupWorkerIdx = 0
  workers = []
  rooms = new Map()
  peers = new Map()

  constructor(socketServer){
    this.ioServer = socketServer.ioServer 
    this.nameSpace = this.ioServer.of('chatroom')
    let { numWorkers } = config.mediasoup
    this.initWorkers(numWorkers)
  }

  async initWorkers(numWorkers){
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

      // log worker resource usage
      /*setInterval(async () => {
              const usage = await worker.getResourceUsage();

              console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
          }, 120000);*/
    }
  }

  getMediasoupWorker() {
    const worker = this.workers[this.nextMediasoupWorkerIdx]
    if (++this.nextMediasoupWorkerIdx === this.workers.length){
      this.nextMediasoupWorkerIdx = 0
    }
    return worker
  }

  getRoom(roomId){
    return this.rooms.get(roomId)
  }

  async createRoom(roomId, name){
    let room = this.rooms.get(roomId)
    if(!room){
      let mediaCodecs = config.mediasoup.router.mediaCodecs
      let worker = this.getMediasoupWorker()
      let router = await worker.createRouter({mediaCodecs})
      room = new Room(roomId, name, this, router, this.nameSpace)
    }
    this.rooms.set(roomId, room)
    return room
  }

  getPeer(peerId){
    return this.peers.get(peerId)
  }

  addPeer(peer){
    this.peers.set(peer.id, peer)
  }

  disconnect(peerId){
    let peer = this.peers.get(peerId)
    if(peer){
      let room = peer.room
      room.removePeer(peerId)
      this.peers.delete(peerId)
      room.emit('roominfo',room.info())
    }
  }

  async createWebRtcTransport(peerId){
    let peer = this.peers.get(peerId)
    if(!peer){
      console.error(`创建transport失败，未找到对应的peer，peerId:${peerId}`)
      return
    }
    console.log('Create webrtc transport', {
      name: `${peer.name}`
    })
    return await peer.room.createWebRtcTransport(peer)
  }

}

export default SfuEngine