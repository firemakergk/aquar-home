class Peer {
  room = null
  constructor(socket, name) {
    this.id = socket.id
    this.socket = socket
    this.name = name
    this.transports = new Map()
    this.consumers = new Map()
    this.producers = new Map()
  }

  addTransport(transport) {
    this.transports.set(transport.id, transport)
  }

  async connectTransport(transport_id, dtlsParameters) {
    if (!this.transports.has(transport_id)) return

    await this.transports.get(transport_id).connect({
      dtlsParameters: dtlsParameters
    })
  }

  async createProducer(producerTransportId, rtpParameters, kind) {
    //TODO handle null errors
    let producer = await this.transports.get(producerTransportId).produce({
      kind,
      rtpParameters
    })

    this.producers.set(producer.id, producer)

    producer.on(
      'transportclose',
      function () {
        console.log('Producer transport close', { name: `${this.name}`, consumer_id: `${producer.id}` })
        producer.close()
        this.producers.delete(producer.id)
      }.bind(this)
    )

    return producer
  }

  async createConsumer(consumer_transport_id, producer_id, rtpCapabilities) {
    let consumerTransport = this.transports.get(consumer_transport_id)

    let consumer = null
    try {
      consumer = await consumerTransport.consume({
        producerId: producer_id,
        rtpCapabilities,
        paused: false //producer.kind === 'video',
      })
    } catch (error) {
      console.error('Consume failed', error)
      return
    }

    if (consumer.type === 'simulcast') {
      await consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2
      })
    }

    this.consumers.set(consumer.id, consumer)

    consumer.on(
      'transportclose',
      function () {
        console.log('Consumer transport close', { name: `${this.name}`, consumer_id: `${consumer.id}` })
        this.consumers.delete(consumer.id)
      }.bind(this)
    )

    return {
      consumer,
      params: {
        producerId: producer_id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused
      }
    }
  }

  closeProducer() {
    try {
      for(let producer of this.producers){
        console.log(`peer:${this.id}关闭producer:${producer[0]}`)
        producer[1].close()
      }
    } catch (e) {
      console.warn(e)
    }

    this.producers = new Map()
  }

  getProducer(producer_id) {
    return this.producers.get(producer_id)
  }

  close() {
    this.room = null
    this.transports.forEach((transport) => transport.close())
  }

  removeConsumer(consumer_id) {
    this.consumers.delete(consumer_id)
  }

  postWords(data){
    this.socket.to(this.room.id).emit("postwords",data)
    this.socket.emit("postwords",data) 
  }
}

export default Peer