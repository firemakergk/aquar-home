import config from './config.js'
class Room {
  constructor(roomId, name, sfuEngine, router, io) {
    this.id = roomId
    this.name = name
    this.sfuEngine = sfuEngine
    this.router = router
    this.peers = new Map()
    this.io = io
  }

  join(peer) {
    peer.setRoom(this)
    this.peers.set(peer.id, peer)
    this.sfuEngine.addPeer(peer)
    let members = []
    for (let i  of this.peers.keys()) {
      members.push(i)
   }
    let eventData = this.info()
    eventData['latestMember'] = peer.id
    this.io.to(this.id).emit('join', eventData)
    eventData['capabilities'] = this.router.rtpCapabilities
    eventData['producers'] = this.getProducerListForPeer()
    return eventData
  }

  info(){
    let members = []
    for (let i of this.peers.keys()) {
      members.push(i)
    }
    return {roomId: this.id, name:this.name, members:members}
  }

  emit(eventName, eventData){
    this.io.to(this.id).emit(eventName, eventData);
  }

  getProducerListForPeer() {
    let producerList = []
    this.peers.forEach((peer) => {
      peer.producers.forEach((producer) => {
        producerList.push({
          producerId: producer.id
        })
      })
    })
    return producerList
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities
  }

  async createWebRtcTransport(peer) {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

    const transport = await this.router.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate
    })
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate)
      } catch (error) {}
    }

    transport.on(
      'dtlsstatechange',
      function (dtlsState) {
        if (dtlsState === 'closed') {
          console.log('Transport close', { name: peer.name })
          transport.close()
        }
      }.bind(this)
    )

    transport.on('close', () => {
      console.log('Transport close', { name: peer.name })
    })

    console.log('Adding transport', { transportId: transport.id })
    peer.addTransport(transport)
    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    }
  }

  async connectPeerTransport(socket_id, transport_id, dtlsParameters) {
    if (!this.peers.has(socket_id)) return

    await this.peers.get(socket_id).connectTransport(transport_id, dtlsParameters)
  }

  async produce(socketId, producerTransportId, rtpParameters, kind) {
    // handle undefined errors
    return new Promise(
      async function (resolve, reject) {
        let producer = await this.peers.get(socketId).createProducer(producerTransportId, rtpParameters, kind)
        resolve(producer.id)
        this.broadCast(socketId, 'newProducers', [
          {
            producerId: producer.id,
            producer_socket_id: socketId
          }
        ])
      }.bind(this)
    )
  }

  async removePeer(socket_id) {
    this.peers.get(socket_id).close()
    this.peers.delete(socket_id)
  }

  closeProducer(socket_id, producer_id) {
    this.peers.get(socket_id).closeProducer(producer_id)
  }

  // broadCast(socket_id, name, data) {
  //   for (let otherID of Array.from(this.peers.keys()).filter((id) => id !== socket_id)) {
  //     this.send(otherID, name, data)
  //   }
  // }

  broadCast(name, data) {
    this.io.to(this.id).emit(name, data)
  }

  send(socket_id, name, data) {
    this.io.to(socket_id).emit(name, data)
  }

  getPeers() {
    return this.peers
  }

  toJson() {
    return {
      id: this.id,
      peers: JSON.stringify([...this.peers])
    }
  }
}

export default Room