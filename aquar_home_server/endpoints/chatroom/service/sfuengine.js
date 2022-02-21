import mediasoup from 'mediasoup'
import config from "./config.js"
import Room from "./room.js"

class SfuEngine {
  ioServer = null
  namespace = =null
  nextMediasoupWorkerIdx = 0
  workers = []
  rooms = new Map()

  constructor(ioServer){
    this.ioServer = ioServer
    this.nameSpace = this.ioServer.of('chatroom')
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
      workers.push(worker)

      // log worker resource usage
      /*setInterval(async () => {
              const usage = await worker.getResourceUsage();

              console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
          }, 120000);*/
    }
  }

  getMediasoupWorker() {
    const worker = workers[nextMediasoupWorkerIdx]
    if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0
    return worker
  }

  getRoom(roomId){
    return rooms.get(roomId)
  }

  createRoom(roomId, name){
    let room = rooms.get(roomId)
    if(!room){
      let mediaCodecs = config.mediasoup.router.mediaCodecs
      let worker = getMediasoupWorker()
      worker.createRouter({mediaCodecs})
      .then(router => {
          room = new Room(roomId, name, router,this.nameSpace)
        }
      )
    }
    return room
  }
}
export default SfuEngine