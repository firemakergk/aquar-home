class Peer {
  room = null
  constructor(peerId, socket, name) {
    this.id = peerId
    this.name = name
    this.socket = socket
    this.transports = new Map()
    this.consumers = new Map()
    this.producers = new Map()
  }

  setRoom(room){
    this.room = room
  }

  postWords(words){
    let data = {name: this.name, content: words}
    this.room.emit('postwords', data)
    return data
  }

  addTransport(transport) {
    this.transports.set(transport.id, transport)
  }

  async connectTransport(transportId, dtlsParameters) {
    if (!this.transports.has(transportId)){
      return await this.transports.get(transportId).connect({
        dtlsParameters: dtlsParameters
      })
    }
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
      async () => {
        console.log('Consumer transport close', { name: `${this.name}`, consumer_id: `${consumer.id}` })
        this.consumers.delete(consumer.id)
      }
    )

    consumer.on(
      'producerclose',
      async () => {
        console.log('Consumer closed due to producerclose event', {
          name: `${this.name}`,
          consumerId: `${consumer.id}`
        })
        this.consumers.delete(consumer.id)
        // tell client consumer is dead
        this.socket.emit('consumerclosed', {
          consumerId: consumer.id
        })
      }
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

  async consume(consumerTransportId, producerId, rtpCapabilities) {
    // handle nulls
    if (
      !this.room.router.canConsume({
        producerId,
        rtpCapabilities
      })
    ) {
      console.error('can not consume')
      return
    }

    let { consumer, params } = await this.createConsumer(consumerTransportId, producerId, rtpCapabilities)

    return params
  }

  async produce( producerTransportId, rtpParameters, kind) {
    let producer = await this.createProducer(producerTransportId,kind, rtpParameters)
    this.room.broadCast('newproducers', [
      {
        peerId: this.id,
        producerId: producer.id,
        producer_socket_id: this.id
      }
    ])
  }

  closeProducer(producer_id) {
    try {
      this.producers.get(producer_id).close()
    } catch (e) {
      console.warn(e)
    }

    this.producers.delete(producer_id)
  }

  getProducer(producer_id) {
    return this.producers.get(producer_id)
  }

  close() {
    this.transports.forEach((transport) => transport.close())
  }

  removeConsumer(consumer_id) {
    this.consumers.delete(consumer_id)
  }
}

export default Peer