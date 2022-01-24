<template>
  <div class="widget_box">
    <div class="widget_header vue-draggable-handle">
      <span style="height:20px; " class="iconfont icon-communityfill icon tcolor_sub"></span>
      <span style="padding: 0 10px;">{{ configData.name }}</span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
      <div v-show="showErrorInfo" class="error_info tbgcolor_mask_error">
        <div style="width: 100%; height: 80px;  display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span  class="iconfont icon-times-circle-fill icon tcolor_sub" style="font-size: 24px;"></span>
          <span  style="font-size: 24px;">连接失败</span>
        </div>
        <div style="padding: 0 2px; word-wrap:break-word; display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span>{{ errorInfo }}</span>
        </div>
      </div>
      <div :class="[showWordsList? 'words_info': 'words_info_hide', 'tbgcolor_mask_error']" style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start;">
        <div v-for="(w,index) in wordsList" :key="'localcam_'+index">{{`${w.name}: ${w.content}`}}</div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <a style="padding:0 4px; " @click="toggleConfig()" class="tcolor_reverse"> x </a>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" name="name" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">server：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.server" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px;" />
            <div style="flex-grow: 5;">
              <button @click="updateConfig" >确定</button>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showLocalConfig" class="local_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">本地参数设置</span>
          <a style="padding:0 4px; " @click="toggleLocalConfig()" class="tcolor_reverse"> x </a>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div style="width:60px; text-align: right; padding: 0 2px;">昵称：</div>
            <div style="flex-grow: 1;">
              <input v-model="localData.name" type="text" name="name" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:60px; text-align: right; padding: 0 2px;">视频源：</div>
            <div style="flex-grow: 1;">
              <select v-model="localCamSelect">
                <option value ="-1">未选择</option>
                <option v-for="(cam,index) in localCameras" :key="'localcam_'+index" :value="cam.index" >{{cam.label}}</option>
              </select>
            </div>
          </div>
          <div class="config_row">
            <div style="width:60px; text-align: right; padding: 0 2px;">音频源：</div>
            <div style="flex-grow: 1;">
              <select v-model="localMicSelect">
                <option value ="-1">未选择</option>
                <option v-for="(mic,index) in localMics" :key="'localmic_'+index" :value="mic.index" >{{mic.label}}</option>
              </select>
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px;" />
            <div style="flex-grow: 5;">
              <button @click="updateLocalConfig" >确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content" style="position: relative;">
        <div ref="selfViewContainer" class="self_view tbgcolor_main">
          <div v-if="isRecording" class="view_content">
            <div class="view_header"><span class="tcolor_reverse" style="z-index: 3;">{{localData.name}}</span></div>
            <video class="view_video" autoplay muted ref="selfView" ></video>
          </div>
          <div v-else class="self_view_close" >
            <a @click="changeRecordStatus()">开始通话</a>
          </div>
        </div>
        <div class="chat_views" @click="showWordsList = false">
          <!-- <div class="chat_view">
            <div class="chat_view_header" ><span class="tcolor_reverse">remote view</span></div>
            <div class="chat_view_body">
              <video class="self_view_video" autoplay muted ref="remoteView" ></video>
            </div>
          </div> -->
          <div v-for="(member,index) in roomInfo.members" :key="'peer_view_'+index" class="chat_view">
            <div class="view_content">
              <div class="view_header" ><span class="tcolor_reverse">{{member}}</span></div>
              <video class="view_video" autoplay :ref="'view_'+member" ></video>
            </div>
          </div>
        </div>
        <div class="chat_menu">
          <div style="flex-grow: 1;">
            <input v-model="words" type="text" width="50" @focus="showWordsList = true" @keyup.enter="sendWords()" />
          </div>
          <div>
            <a v-if="!isRecording" style="margin: 0 4px;" class="iconfont icon-recordfill icon tcolor_sub" title="开始视频" @click="changeRecordStatus()" />
            <a v-else style="margin: 0 4px;" class="iconfont icon-stopcircle icon tcolor_sub" title="结束视频" @click="changeRecordStatus()" />
            <a style="margin: 0 4px;" class="iconfont icon-cog icon tcolor_sub" title="设置" @click="toggleLocalConfig()" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'
import { io } from "socket.io-client";
const { RTCPeerConnection, RTCSessionDescription } = window
export default {
  name: 'chatRoomWidget',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      showErrorInfo: false,
      showConfig: false,
      showLocalConfig: false,
      showWordsList: false,
      isRecording: false,
      roomInfo: {members:[]},
      socket: null,
      peers: {},
      selfStream: null,
      wordsList: [
        {name: '系统',content: 'enjoy it'}
      ],
      words: null,
      localData: {name: '',device: {}},
      localCameras: [],
      localMics: [],
      localCamSelect: -1,
      localMicSelect: -1,
      viewList: [
        {name:"test1"}
      ],
      errorInfo: null
    }
  },
  created: function() {
    this.init()
  },
  destroyed: function() {
  },
  methods: {
    init() {
      this.socket = io('/chatroom')
      this.socket.on("connect", () => {
        this.localData.name = this.socket.id.substring(8)
        this.socket.emit('join',{tabIndex: this.tabIndex, roomId:this.configData.id,memberId: this.socket.id})
      })
      this.socket.on("join", data => {
        console.log(data.members)
        this.roomInfo = data
      })
      this.socket.on("distributewords", data => {
        this.wordsList.push(data)
      })
      this.socket.on("call", data => {
        console.log("call data")
        console.log(new RTCSessionDescription(data.offer))
        var peer = this.peers[data.callerId]
        if(!peer){
          peer = this.initPeer(data.callerId)
        }
        peer.setRemoteDescription(new RTCSessionDescription(data.offer)).then(() => {
          this.handleMediaForAnswer(peer)
        })
      })
      this.socket.on("answer", data => {
        console.log("get answer")
        console.log(data.answer)
        var peer = this.peers[data.calleeId]
        if(!peer){
          console.warn(`接收到一个answer，但并没有找到对应的offer,remoteId:${data.calleeId}`)
          return
        }
        peer.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        ).then(() => {console.log('answer handle success')})
        .catch((error) => {
          console.log(`answer handel error: ${error},${data}`)
        })
      })
      this.socket.on('icecandidate', data => {
        const remoteId = data.sourceId
        var peer = this.peers[remoteId]
        if(!peer){
          console.warn(`接收到一个候选地址，但并没有找到对应的peer,remoteId:${remoteId}`)
          return
        }
        const iceCandidate = data.candidate
        const newIceCandidate = new RTCIceCandidate(iceCandidate);
        console.log(`添加候选：${newIceCandidate.address}`)
        peer.addIceCandidate(newIceCandidate)
        .then(() => {
          console.log('添加候选成功')
          console.log(peer)
        }).catch((error) => {
          console.log(`添加候选失败${error},${data}`)
          console.log(peer)
        })
      })
      if(localStorage.getItem('localCamera')){
        this.localData.device.camera = JSON.parse(localStorage.getItem('localCamera'))
        this.localCamSelect = this.localData.device.camera.index
      }
      if(localStorage.getItem('localMic')){
        this.localData.device.mic = JSON.parse(localStorage.getItem('localMic'))
        this.localMicSelect = this.localData.device.mic.index
      }
      navigator.mediaDevices.enumerateDevices().then(devices => {
        var tmp = devices.map(d => {return {deviceId: d.deviceId,groupId: d.groupId,kind: d.kind,label: d.label}})
        var index = 0
        tmp.forEach(d => d.index = index++)
        this.localCameras = _.filter(tmp,{'kind':'videoinput'})
        this.localMics = _.filter(tmp,{'kind':'audioinput'})
      })
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    toggleLocalConfig() {
      this.showLocalConfig = !this.showLocalConfig
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    updateLocalConfig() {
      this.localData.device.camera = _.filter(this.localCameras,{'index':this.localCamSelect})[0]
      this.localData.device.mic = _.filter(this.localMics,{'index':this.localMicSelect})[0]
      this.updateSelfStream()
      this.showLocalConfig = false
      // this.openMediaForOffer()
    },
    changeRecordStatus(){
      this.isRecording = !this.isRecording
      this.openMediaForOffer()
    },
    updateSelfStream() {
      this.selfStream.getVideoTracks()[0].stop()
      var params = this.validStatusForParams()
      navigator.mediaDevices.getUserMedia(params)
      .then(
        stream => {
          this.selfStream = stream
          if(this.$refs.selfView){
            this.$refs.selfView.srcObject = stream 
          }
          this.$refs['view_'+this.socket.id][0].srcObject = stream
          var videoSettings = stream.getVideoTracks()[0].getSettings()
          this.reSizeVideoView('selfViewContainer', videoSettings.width, videoSettings.height, 120, null)
          this.syncLocalData(stream)
        }
        ,error => {
          console.warn(error.message);
        }
      )
    },
    openMediaForOffer() {
      var params = this.validStatusForParams()
      navigator.mediaDevices.getUserMedia(params)
      .then(
        stream => {
          this.selfStream = stream
          if(this.$refs.selfView){
            this.$refs.selfView.srcObject = stream 
          }
          this.$refs['view_'+this.socket.id][0].srcObject = stream
          for(var i=0;i<this.roomInfo.members.length;i++){
            var member = this.roomInfo.members[i]
            if(member === this.socket.id){
              continue
            }
            this.handleLocalStreamOffer(member, stream)
          }
          var videoSettings = stream.getVideoTracks()[0].getSettings()
          this.reSizeVideoView('selfViewContainer', videoSettings.width, videoSettings.height, 120, null)
          this.syncLocalData(stream)
        }
        ,error => {
          console.warn(error.message);
        }
      )
    },
    handleMediaForAnswer(peer) {
      this.isRecording = true
      if(this.selfStream){
        this.handleLocalStreamAnswer(peer, this.selfStream)
      }
      var params = this.validStatusForParams()
      navigator.mediaDevices.getUserMedia(params)
      .then(
        stream => {
          this.selfStream = stream
          if(this.$refs.selfView){
            this.$refs.selfView.srcObject = stream 
          }
          this.$refs['view_'+this.socket.id][0].srcObject = stream
          this.handleLocalStreamAnswer(peer, stream)
          this.syncLocalData(stream)
        }
        ,error => {
          console.warn(error.message);
        }
      )
    },
    validStatusForParams(){
      if(!this.isRecording){
        console.warn('开关未打开')
        if(this.selfStream) {
          this.selfStream.getTracks().forEach(track => {
            track.stop()
          })
          this.selfStream = null
          this.$refs.selfView.srcObject = null
        }
        return
      }
      if(!this.localCameras) {
        console.warn('未找到视频源')
        if(this.selfStream){
          this.selfStream.getTracks().forEach(track => {
          track.stop()
          })
        }
        return
      }
      var videoParam = true
      if(this.localData.device.camera){
        videoParam = { deviceId: this.localData.device.camera.deviceId,groupId: this.localData.device.camera.groupId }
      }
      var micParam = true 
      if(this.localData.device.mic){
        micParam = { deviceId: this.localData.device.mic.deviceId ,groupId: this.localData.device.mic.groupId } 
      }
      console.log({ 
        video:  videoParam, 
        audio:  micParam})
      return { video:  videoParam, audio:  micParam}
    },
    syncLocalData(stream){
      if(!stream){
        return
      }
      // stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      stream.getTracks().forEach(track => {
        if(track.kind === 'audio'){
          var res = _.filter(this.localMics,{'deviceId':track.getSettings().deviceId,'groupId':track.getSettings().groupId})
          if(!res){
            console.warn("未匹配到音频源:"+track.getSettings().deviceId)
          }else if(res.length > 1){
            console.warn("匹配到多个音频源:"+JSON.stringify(res))
          }else {
            this.localData.device.mic = {deviceId:res[0].deviceId,groupId: res[0].groupId,name: res[0].label,index: res[0].index}
            this.localMicSelect = this.localData.device.mic.index
            localStorage.setItem('localMic',JSON.stringify(this.localData.device.mic))
          }
        }else if(track.kind === 'video'){
          var res1 = _.filter(this.localCameras,{'deviceId':track.getSettings().deviceId,'groupId':track.getSettings().groupId})
          if(!res1){
            console.warn("未匹配到视频源:"+track.getSettings().deviceId)
          }else if(res1.length > 1){
            console.warn("匹配到多个视频源:"+JSON.stringify(res))
          }else {
            this.localData.device.camera = {deviceId:res1[0].deviceId,groupId: res1[0].groupId,name: res1[0].label,index: res1[0].index}
            this.localCamSelect = this.localData.device.camera.index
            localStorage.setItem('localCamera',JSON.stringify(this.localData.device.camera))
          }
        }
      })
    },
    reSizeVideoView(contianerRef, videoWidth, videoHeight, width, height){
      if(width && height){
        this.$refs[contianerRef].style.width = width + 'px'
        this.$refs[contianerRef].style.height = height + 'px' 
      }else if(width) {
        this.$refs[contianerRef].style.width = width + 'px'
        this.$refs[contianerRef].style.height = Math.round(width*videoHeight/videoWidth) + 'px'
      }else if(height) {
        this.$refs[contianerRef].style.height = height + 'px' 
        this.$refs[contianerRef].style.width = Math.round(height*videoWidth/videoHeight) + 'px'
      }
    },
    sendWords(){
      if(this.words){
        // this.socket.emit('join',{roomId:this.configData.id})
        this.socket.emit('submitwords',{name: this.localData.name, content: this.words})
        this.words = ''
      }
    },
    initPeer(remoteId){
      var peer = new RTCPeerConnection({
        iceServers:[{'urls':'stun:stun.voipbuster.com:3478'}]
      })
      peer.ontrack = ({ streams: [stream] }) => {
        console.log('set stream view_'+remoteId)
        this.$refs['view_'+remoteId][0].style.display = 'block'
        this.$refs['view_'+remoteId][0].srcObject = stream
      }
      peer.addEventListener('icecandidate', event => {
        const iceCandidate = event.candidate;
        if (iceCandidate) {
          console.log(event.candidate)
          //!这里的remoteId有可能会有闭包陷阱
          this.socket.emit('icecandidate',{sourceId: this.socket.id, remoteId: remoteId, candidate:event.candidate})
        }
      })
      peer.addEventListener('iceconnectionstatechange',  event => {console.log(event)});
      this.peers[remoteId] = peer
      return peer
    },
    handleLocalStreamOffer(calleeId, stream){
      var peer = this.initPeer(calleeId)
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream)
      })
      var tmpOffer = null
      peer.createOffer().then(offer => {
        tmpOffer = offer
        console.log(peer)
        console.log(offer)
        return peer.setLocalDescription(new RTCSessionDescription(offer))
      }).then(() => {
          this.socket.emit('call',{callerId: this.socket.id, offer:peer.localDescription})
        })
      console.log(tmpOffer)
    },
    handleLocalStreamAnswer(peer, stream){
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream)
      })
      peer.createAnswer().then(answer => {
        console.log(peer)
        console.log(answer)
        return peer.setLocalDescription(new RTCSessionDescription(answer))
      }).then(() => {
          this.socket.emit('answer',{calleeId: this.socket.id, answer:peer.localDescription})
      }).catch(error => {
        console.log('answer error')
        console.log(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat_views {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content:center;
  align-items: stretch;
  flex-grow: 1;
}
.chat_view {
  margin: 8px;
  flex-grow: 1;
  z-index: 3;
  max-width: 400px;
}
.chat_view_header{
  float: left;
}
.chat_view_body{
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 260px;
  height: 100px; 
  background-color:blue;
  flex-grow: 1;
}
.chat_menu {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
}
.self_view {
  position: absolute;
  bottom: 40px;
  right: 40px;
  width: 120px;
  height: 90px;
  z-index: 4;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);
  box-sizing: border-box;
  display: flex;
}
.view_content {
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  flex-grow: 1;
  align-items: stretch;
  background-color: #444444;
}

.view_header {
  position:absolute;
  top:0;
  left:0;
  z-index: 4;
}
.view_video {
  position: relative;
  object-fit: contain;
  z-index: 3;
  width: 100%;
  height: 100%;
}
.self_view_close{
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
.local_config {
  width: 400px;;
  top: 0;
  right: 0;
  bottom: 30px;
  position: absolute;
  font-size: 12px;
  z-index: 6;
  background-color: var(--tbgcolor_config,white);
}
.words_info {
  left: 0;
  right: 0;
  bottom: 30px;
  height: 60%;
  position: absolute;
  z-index: 5;
  word-wrap:break-word;
  -webkit-mask-image: linear-gradient(to top, #fff , transparent);
  background-color: rgba(0,0,0,0.7);
  font-size: 12px;
  color: white;
  display: flex;
  flex-direction:column;
  overflow-y: auto;
  overflow-x: hidden;
}
.words_info_hide {
  left: 0;
  right: 0;
  bottom: 30px;
  height: 32px;
  position: absolute;
  z-index: 5;
  word-wrap:break-word;
  -webkit-mask-image: linear-gradient(to top, #fff, transparent);
  background-color: rgba(0,0,0,0.3);
  font-size: 12px;
  color: white;
  display: flex;
  flex-direction:column;
}
</style>
