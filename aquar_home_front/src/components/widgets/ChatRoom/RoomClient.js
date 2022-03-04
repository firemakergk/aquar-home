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

  async produce(type, stream) {
    let audio = false
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    
    const track = stream.getVideoTracks()[0]
    const params = {
      track
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
    let producer = await this.producerTransport.produce(params)

    console.log('Producer', producer)

    this.producers.set(producer.id, producer)

    // let elem
    // if (!audio) {
    //   elem = document.createElement('video')
    //   elem.srcObject = stream
    //   elem.id = producer.id
    //   elem.playsinline = false
    //   elem.autoplay = true
    //   elem.className = 'vid'
    //   this.localMediaEl.appendChild(elem)
    //   this.handleFS(elem.id)
    // }

    producer.on('trackended', () => {
      this.closeProducer(type)
    })

    producer.on('transportclose', () => {
      console.log('Producer transport close')
      // if (!audio) {
      //   elem.srcObject.getTracks().forEach(function (track) {
      //     track.stop()
      //   })
      //   elem.parentNode.removeChild(elem)
      // }
      this.producers.delete(producer.id)
    })

    producer.on('close', () => {
      console.log('Closing producer')
      // if (!audio) {
      //   elem.srcObject.getTracks().forEach(function (track) {
      //     track.stop()
      //   })
      //   elem.parentNode.removeChild(elem)
      // }
      this.producers.delete(producer.id)
    })

    this.producerLabel.set(type, producer.id)

    // switch (type) {
    //   case mediaType.audio:
    //     this.event(_EVENTS.startAudio)
    //     break
    //   case mediaType.video:
    //     this.event(_EVENTS.startVideo)
    //     break
    //   case mediaType.screen:
    //     this.event(_EVENTS.startScreen)
    //     break
    //   default:
    //     return
    // }
  }

  async consume(producer_id) {
    //let info = await this.roomInfo()

    this.getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }) {
        this.consumers.set(consumer.id, consumer)
        this.vueBus.emit("consume", { producerId:producer_id, consumer, stream, kind } )
        // let elem
        // if (kind === 'video') {
        //   elem = document.createElement('video')
        //   elem.srcObject = stream
        //   elem.id = consumer.id
        //   elem.playsinline = false
        //   elem.autoplay = true
        //   elem.className = 'vid'
        //   this.remoteVideoEl.appendChild(elem)
        //   this.handleFS(elem.id)
        // } else {
        //   elem = document.createElement('audio')
        //   elem.srcObject = stream
        //   elem.id = consumer.id
        //   elem.playsinline = false
        //   elem.autoplay = true
        //   this.remoteAudioEl.appendChild(elem)
        // }

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

  closeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    console.log('Close producer', producer_id)

    this.socket.emit('producerClosed', {
      producer_id
    })

    this.producers.get(producer_id).close()
    this.producers.delete(producer_id)
    this.producerLabel.delete(type)

    if (type !== mediaType.audio) {
      let elem = document.getElementById(producer_id)
      elem.srcObject.getTracks().forEach(function (track) {
        track.stop()
      })
      elem.parentNode.removeChild(elem)
    }

    switch (type) {
      case mediaType.audio:
        this.event(_EVENTS.stopAudio)
        break
      case mediaType.video:
        this.event(_EVENTS.stopVideo)
        break
      case mediaType.screen:
        this.event(_EVENTS.stopScreen)
        break
      default:
        return
    }
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
    let elem = document.getElementById(consumer_id)
    elem.srcObject.getTracks().forEach(function (track) {
      track.stop()
    })
    elem.parentNode.removeChild(elem)

    this.consumers.delete(consumer_id)
  }

  exit(offline = false) {
    let clean = function () {
      this._isOpen = false
      this.consumerTransport.close()
      this.producerTransport.close()
      this.socket.off('disconnect')
      this.socket.off('newProducers')
      this.socket.off('consumerClosed')
    }.bind(this)

    if (!offline) {
      this.socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(
          function () {
            clean()
          }.bind(this)
        )
    } else {
      clean()
    }

    this.event(_EVENTS.exitRoom)
  }

  ///////  HELPERS //////////

  async roomInfo() {
    let info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }

  // event(evt) {
  //   if (this.eventListeners.has(evt)) {
  //     this.eventListeners.get(evt).forEach((callback) => callback())
  //   }
  // }

  // on(evt, callback) {
  //   this.eventListeners.get(evt).push(callback)
  // }

  //////// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

  static get EVENTS() {
    return _EVENTS
  }

  //////// UTILITY ////////

  copyURL() {
    let tmpInput = document.createElement('input')
    document.body.appendChild(tmpInput)
    tmpInput.value = window.location.href
    tmpInput.select()
    document.execCommand('copy')
    document.body.removeChild(tmpInput)
    console.log('URL copied to clipboard 👍')
  }

  showDevices() {
    if (!this.isDevicesVisible) {
      reveal(devicesList)
      this.isDevicesVisible = true
    } else {
      hide(devicesList)
      this.isDevicesVisible = false
    }
  }

  handleFS(id) {
    let videoPlayer = document.getElementById(id)
    videoPlayer.addEventListener('fullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('webkitfullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let webkitIsFullScreen = document.webkitIsFullScreen
      if (!webkitIsFullScreen) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('click', (e) => {
      if (videoPlayer.controls) return
      if (!this.isVideoOnFullScreen) {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen()
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen()
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen()
        }
        this.isVideoOnFullScreen = true
        videoPlayer.style.pointerEvents = 'none'
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.isVideoOnFullScreen = false
        videoPlayer.style.pointerEvents = 'auto'
      }
    })
  }
}
export default RoomClient