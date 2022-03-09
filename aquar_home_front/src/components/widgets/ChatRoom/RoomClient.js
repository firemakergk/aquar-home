import { Device } from 'mediasoup-client'
const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType'
}
const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen'
}

class RoomClient {
  constructor(socket, roomId, name, vueBus) {
    socket.request = function request(type, data = {}) {
      return new Promise((resolve, reject) => {
        socket.emit(type, data, (data) => {
          if (data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        })
      })
    }
    this.name = name
    this.socket = socket
    this.vueBus = vueBus
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.room_id = roomId

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()
    this.consumerMap = new Map()
    // console.log('Mediasoup client', mediasoupClient)

    /**
     * map that contains a mediatype as key and producer_id as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    // this.eventListeners = new Map()

    // Object.keys(_EVENTS).forEach(
    //   function (evt) {
    //     this.eventListeners.set(evt, [])
    //   }.bind(this)
    // )

    this.createRoom(this.room_id).then(
      async function () {
        await this.join(this.name, this.room_id)
        this.initSockets()
        this._isOpen = true
      }.bind(this)
    )
  }

  ////////// INIT /////////

  async createRoom(room_id) {
    await this.socket
      .request('createRoom', {
        room_id
      })
      .catch((err) => {
        console.log('Create room error:', err)
      })
  }

  async join(name, room_id) {
    this.socket
      .request('join', {
        name,
        room_id
      })
      .then(
        async function (e) {
          console.log('Joined to room', e)
          this.vueBus.emit("roominfo", {roomId: this.room_id, name:this.room_id, members:e.members})
          const data = await this.socket.request('getRouterRtpCapabilities')
          let device = await this.loadDevice(data)
          this.device = device
          await this.initTransports(device)
          this.socket.emit('getProducers')
        }.bind(this)
      )
      .catch((err) => {
        console.log('Join error:', err)
      })
  }

  async loadDevice(routerRtpCapabilities) {
    let device
    try {
      device = new Device()
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities
    })
    return device
  }

  async initTransports(device) {
    // init producerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      this.producerTransport = device.createSendTransport(data)

      this.producerTransport.on(
        'connect',
        async function ({ dtlsParameters }, callback, errback) {
          this.socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            const { producer_id } = await this.socket.request('produce', {
              producerTransportId: this.producerTransport.id,
              kind,
              rtpParameters
            })
            callback({
              id: producer_id
            })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
      )

      this.producerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //localVideo.srcObject = stream
              break

            case 'failed':
              this.producerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }

    // init consumerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      // only one needed
      this.consumerTransport = device.createRecvTransport(data)
      this.consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          this.socket
            .request('connectTransport', {
              transport_id: this.consumerTransport.id,
              dtlsParameters
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.consumerTransport.on(
        'connectionstatechange',
        async function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //remoteVideo.srcObject = await stream;
              //await socket.request('resume');
              break

            case 'failed':
              this.consumerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }
  }

  initSockets() {
    this.socket.on(
      'consumerClosed',
      function ({ consumer_id }) {
        console.log('Closing consumer:', consumer_id)
        this.removeConsumer(consumer_id)
      }.bind(this)
    )

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    this.socket.on(
      'newProducers',
      async function (data) {
        console.log('New producers', data)
        let {producerList ,producerMap} = data
        this.vueBus.emit('producermap', producerMap)
        for (let { producer_id } of producerList) {
          await this.consume(producer_id)
        }
      }.bind(this)
    )

    this.socket.on(
      'disconnect',
      function () {
        this.exit(true)
      }.bind(this)
    )
  }

  //////// MAIN FUNCTIONS /////////////

  async produce(stream) {
    let audio = false
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }

    if(!this.producerLabel.has(mediaType.video) && stream.getVideoTracks() && stream.getVideoTracks()[0]){
      let videoTrack = stream.getVideoTracks()[0]
      let params = {
        track: videoTrack
      }
      params.encodings = [
        {
          rid: 'r0',
          maxBitrate: 100000,
          //scaleResolutionDownBy: 10.0,
          scalabilityMode: 'S1T3'
        },
        {
          rid: 'r1',
          maxBitrate: 300000,
          scalabilityMode: 'S1T3'
        },
        {
          rid: 'r2',
          maxBitrate: 900000,
          scalabilityMode: 'S1T3'
        }
      ]
      params.codecOptions = {
        videoGoogleStartBitrate: 1000
      }
      let videoProducer = await this.producerTransport.produce(params)
      this.setupProducer(mediaType.video, videoProducer)
    }

    if(!this.producerLabel.has(mediaType.video) && stream.getAudioTracks()&& stream.getAudioTracks()[0]){
      let audioTrack = stream.getAudioTracks()[0]
      let params = {
        track: audioTrack
      }
      let audioProducer = await this.producerTransport.produce(params)
      this.setupProducer(mediaType.audio, audioProducer)
    }
  }

  setupProducer(type, producer){
    console.log(`setup Producer ${type} ${producer.id}`)
    this.producers.set(producer.id, producer)
    producer.on('trackended', () => {
      this.closeProducer()
    })
    producer.on('transportclose', () => {
      console.log('Producer transport close')
      this.producers.delete(producer.id)
    })
    producer.on('close', () => {
      console.log('Closing producer')
      this.producers.delete(producer.id)
    })
    this.producerLabel.set(type, producer.id)
  }

  async consume(producer_id) {
    //let info = await this.roomInfo()

    this.getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }) {
        this.consumers.set(consumer.id, consumer)
        consumer.on(
          'trackended',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )

        consumer.on(
          'transportclose',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )
        this.vueBus.emit("consume", { producerId:producer_id, consumer, stream, kind } )
      }.bind(this)
    )
  }

  async getConsumeStream(producerId) {
    const { rtpCapabilities } = this.device
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id, // might be
      producerId
    })
    const { id, kind, rtpParameters } = data

    let codecOptions = {}
    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    })

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind
    }
  }

  closeProducer() {
    for(let producer of this.producers){
      console.log('Close producer', producer[0].id)
      this.socket.emit('producerClosed' )
    }
    this.producerLabel = new Map()
    this.producers = new Map()
  }

  pauseProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).pause()
  }

  resumeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).resume()
  }

  removeConsumer(consumer_id) {
    this.vueBus.emit('consumerclosed', consumer_id)
    this.consumers.delete(consumer_id)
  }

  exit() {
    let clean = function () {
      this._isOpen = false
      if(this.consumerTransport){
        this.consumerTransport.close()
      }
      if(this.producerTransport){
        this.producerTransport.close()
      }
      this.socket.off('disconnect')
      this.socket.off('newProducers')
      this.socket.off('consumerClosed')
      this.socket.disconnect()
    }.bind(this)

    this.socket
    .request('exitRoom')
    .then((e) => console.log(e))
    .catch((e) => console.warn(e))
    .finally(
      function () {
        clean()
      }.bind(this)
    )
  }

  ///////  HELPERS //////////

  async roomInfo() {
    let info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }


  //////// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

}
export default RoomClient