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

class ChatClient {
  constructor(socket, roomId, name, vueBus) {
    this.name = name
    this.socket = socket
    this.vueBus = vueBus
    this.routerRtpCapabilities = null
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.roomId = roomId 

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()

    /**
     * map that contains a mediatype as key and producer_id as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    this.eventListeners = new Map()

    Object.keys(_EVENTS).forEach(
      function (evt) {
        this.eventListeners.set(evt, [])
      }.bind(this)
    )
    // this.initSockets()

  }

  ////////// INIT /////////

  async joinRoom(tabIndex, roomId){
    this.socket.emit(
      'join',
      {tabIndex: tabIndex, roomId: roomId, memberId: this.socket.id },
      async res =>{
        if(!res){
          console.log(`没有找到与组件对应的房间${this.configData.id}`)
          return null
        }else{
          if(res.capabilities && res.transport){
            await this.initConsumer(res.capabilities, res.transport, res.producers)
            this.pullStreams(this.device)
          }
          return res
        }
    })
  }

  async initAndPullStream(routerRtpCapabilities, transportData, producers){
    try {
      console.log(`join room后得到transportId${transportData.id}`)
      this.remoteConsumerTransportId = transportData.id
      this.routerRtpCapabilities = routerRtpCapabilities
      let device = new Device()
      this.device = device
      await device.load({routerRtpCapabilities})
      await this.initConsumerTransport(transportData)
      let consumerInfoList = []
      for (let { producerId } of producers) {
        let consumerInfo = await this.getConsumeStream(producerId)
        consumerInfoList.push(consumerInfo)
      }
      return consumerInfoList
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
      }
      console.error(error)
    }
  }

  async initConsumerTransport(transportData){
    if (!transportData) {
      console.error('输入流初始化失败，未获取到transport信息')
      return
    }

    this.consumerTransport = this.device.createRecvTransport(transportData)
    console.log(`createRecvTransport transportId${this.consumerTransport.id}`)
    this.consumerTransport.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        let res = await this.request('connecttransport', {
            transportId: transportData.id,
            dtlsParameters: dtlsParameters
          })
        console.log(`consumer connectTransport结果:${res}`)
        if(res === 0){
          callback()
        }else{
          errback()
        }
      }
    )

    this.consumerTransport.on(
      'connectionstatechange',
      async function (state) {
        switch (state) {
          case 'connecting':
            break

          case 'connected':
            this.vueBus.emit("consumeconnected",)
            console.log(`consumer transport连接已建立`)
            break

          case 'failed':
            console.log(`consumer transport连接失败`)
            this.consumerTransport.close()
            break

          default:
            break
        }
      }.bind(this)
    )
  }

  async initProducerTransport(){

    // if(!this.routerRtpCapabilities){
    //   console.error('初始化producerTransport失败,没有routerRtpCapabilities数据')
    //   return null
    // }
    console.log('createwebrtctransport')
    const transportData = await this.request('createwebrtctransport',null)
    this.producerTransport = this.device.createSendTransport(transportData)

    this.producerTransport.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        let res = await this.request('connecttransport', {
            transportId: transportData.id,
            dtlsParameters: dtlsParameters
        })
        console.log(`producer connectTransport结果:${res}`)
        if(res === 0){
          callback()
        }else{
          errback()
        }
      }
    )

    this.producerTransport.on(
      'produce',
      async ({ kind, rtpParameters }) => {
        console.log('produce')
        try {
          const { producerId } = await this.request('produce', {
            producerTransportId: this.producerTransport.id,
            kind,
            rtpParameters
          })
          return{id: producerId}
        } catch (err) {
          console.error('producerTransport produce异常')
          return null
        }
      }
    )

    this.producerTransport.on(
      'connectionstatechange',
      (state) => {
        switch (state) {
          case 'connecting':
            break
          case 'connected':
            console.log(`producer transport连接已建立`)
            break
          case 'failed':
            console.log(`producer transport连接失败`)
            this.producerTransport.close()
            break
          default:
            break
        }
      }
    )
  }

  //////// MAIN FUNCTIONS /////////////

  async pushStream(type, stream) {
    await this.initProducerTransport()
    if (!this.device.canProduce('video')) {
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
    var producer = null
    try{
      producer = await this.producerTransport.produce(params)
    }catch(e){
      console.error(e)
    }
    this.producers.set(producer.id, producer)
    this.producerLabel.set(type, producer.id)

    producer.on('trackended', () => {
      this.closeProducer(type)
    })

    producer.on('transportclose', () => {
      // console.log('Producer transport close')
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

    console.log('Producer', producer)
  }

  async consume(producerId) {
    //let info = await this.roomInfo()

    let { consumer, stream, kind } = await this.getConsumeStream(producerId)
    this.consumers.set(consumer.id, consumer)
    return { consumer, stream, kind }
    //!!!这里已经拿到stream了，返回给vue做渲染
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
  }

  async getConsumeStream(producerId) {
    const { rtpCapabilities } = this.device
    //!!!在服务端加一个consume方法，逻辑参照mesh的answer
    let data = null
    try{
      data = await this.request('pullstream', {
        rtpCapabilities,
        consumerTransportId: this.consumerTransport.id, // might be
        producerId
      })
    }catch(e){
      console.error(e)
    }
    
    let { id, kind, rtpParameters } = data

    let codecOptions = {}
    let consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    })
    consumer.on(
      'trackended',
      () => {
        this.removeConsumer(consumer.id)
      }
    )
    consumer.on(
      'transportclose',
      () => {
        this.removeConsumer(consumer.id)
      }
    )
    this.consumers.set(consumer.id, consumer)

    let stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind,
      producerId
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

    // if (type !== mediaType.audio) {
    //   let elem = document.getElementById(producer_id)
    //   elem.srcObject.getTracks().forEach(function (track) {
    //     track.stop()
    //   })
    //   elem.parentNode.removeChild(elem)
    // }

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

  removeConsumer(consumerId) {
    this.consumers.delete(consumerId)
    // let elem = document.getElementById(consumerId)
    // elem.srcObject.getTracks().forEach(function (track) {
    //   track.stop()
    // })
    // elem.parentNode.removeChild(elem)
    //!!!触发vue中的方法，把画面关闭
  }

  exit(offline = false) {
    let clean = function () {
      this._isOpen = false
      this.consumerTransport.close()
      this.producerTransport.close()
      this.socket.off('disconnect')
      this.socket.off('newproducers')
      this.socket.off('consumerclosed')
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

  event(evt) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt).forEach((callback) => callback())
    }
  }

  on(evt, callback) {
    this.eventListeners.get(evt).push(callback)
  }

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

  async request(event, data){
    return new Promise((resolve, reject) => {
      this.socket.emit(event, data, (data) => {
        if (!data && data!=0) {
          console.error(`request error: event:${event},data:${data}`)
          reject()
        } else {
          resolve(data)
        }
      })
    })
  } 
}

export default ChatClient