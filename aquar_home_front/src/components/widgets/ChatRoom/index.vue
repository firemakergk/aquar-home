<template>
  <div class="widget_box_vuetify">
    <div class="widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/chatroom.png">
      <span style="padding: 0 10px;">{{ configData.name }}</span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" /> -->
      <v-btn v-if="isInRoom" icon small @click="leftRoom()" title="退出">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-logout</v-icon>
      </v-btn>
      <v-btn v-else icon small @click="joinRoom()" title="加入">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-login</v-icon>
      </v-btn>
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
      <!-- <a v-if="isInRoom" style="margin: 0 4px;" class="iconfont icon-poweroff icon tcolor_sub" title="退出" @click="leftRoom()" />
      <a v-else style="margin: 0 4px;" class="iconfont icon-radioboxfill icon tcolor_sub" title="加入" @click="joinRoom()" /> -->
      
    </div>
    <div class="widget_body_noscroll">
      <div v-show="showErrorInfo" class="error_info tbgcolor_mask_error">
        <div style="width: 100%; height: 80px;  display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <v-icon class="tcolor_main" style="font-size: 32px;" >mdi-close-circle</v-icon>
          <span  style="font-size: 24px;">连接失败</span>
        </div>
        <div style="padding: 0 2px; word-wrap:break-word; display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span>{{ errorInfo }}</span>
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <v-icon class="tcolor_sub_head" @click="toggleConfig()" >mdi-close</v-icon>
        </div>
        <div class="config_body">
          <div class="chat_config_row">
            <!-- <div style="width:100px; text-align: right; padding: 0 2px;">名称：</div> -->
            <div style="flex-grow: 1;">
              <!-- <input v-model="configData.name" type="text" name="name" style="display: inline-block; width: 100%;"> -->
              <v-text-field dense hide-details label="名称" v-model="configData.name" ></v-text-field> 
            </div>
          </div>
          <div class="chat_config_row">
            <!-- <div style="width:100px; text-align: right; padding: 0 2px;">自动进入房间：</div> -->
            <div style="flex-grow: 1;">
              <!-- <select v-model="configData.data.auto_join">
                <option value='true'>是</option>
                <option value='false'>否</option>
              </select> -->
              <v-select hide-details dense :items="[{text:'是',value: true},{text:'否',value: false}]" label="自动进入房间" v-model="configData.data.auto_join" ></v-select> 
            </div>
          </div>
          <div class="chat_config_row">
            <!-- <div style="width:100px; text-align: right; padding: 0 2px;">宣告IP列表
              <span class="iconfont icon-question-circle icon tcolor_sub" title="视频连接需要指定服务器的IP地址才可以正常建立，此处可以填写多个IP地址，每行一个地址"></span>：</div> -->
            <div style="flex-grow: 1;">
              <!-- <textarea class="ips_textarea" placeholder="视频连接需要指定服务器的IP地址才可以正常建立，此处可以填写多个IP地址，每行一个地址" v-model="announcedIpsString" name="announcedIps" style="display: inline-block; width: 100%;"></textarea> -->
              <v-textarea dense rows="4" label="宣告IP列表" hide-details class="ips_textarea" 
                placeholder="内网或公网IP" 
                v-model="announcedIpsString" name="announcedIps" ></v-textarea>
            </div>
            <div style="text-align:start;">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                </template>
                <span>视频连接需要指定服务器的IP地址才可以正常建立，此处可以填写多个IP地址，每行一个地址,如：<br/>127.0.0.1<br/>192.168.0.106<br/>192.168.0.107<br/>39.100.XXX.XXX</span>
              </v-tooltip>
            </div>
          </div>
          <div class="chat_config_row">
            <div style="flex-grow: 1;"/>
            <div>
              <!-- <button @click="updateConfig" >确定</button> -->
              <v-btn depressed small color="primary" @click="updateConfig()" style="margin:0 4px;">确定</v-btn>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showLocalConfig" class="local_config tbgcolor_main">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">本地参数设置</span>
          <v-icon class="tcolor_sub_head" @click="toggleLocalConfig()" >mdi-close</v-icon>
        </div>
        <div class="config_body">
          <div class="chat_config_row">
            <!-- <div style="width:60px; text-align: right; padding: 0 2px;">昵称：</div> -->
            <div style="flex-grow: 1; ">
              <!-- <input v-model="localData.name" type="text" name="name" style="display: inline-block; width: 100%;"> -->
              <v-text-field densese hide-details="true" label="昵称" height="24" v-model="localData.name" class="py-0 my-0" ></v-text-field>
            </div>
          </div>
          <div class="chat_config_row">
            <!-- <div style="width:60px; text-align: right; padding: 0 2px;">视频源：</div> -->
            <div style="flex-grow: 1;">
              <v-select hide-details dense :items="localCamerasSelect" label="视频源" v-model="localCamSelect" ></v-select>
              <!-- <select v-model="localCamSelect">
                <option value ="-1">未选择</option>
                <option v-for="(cam,index) in localCameras" :key="'localcam_'+index" :value="cam.index" >{{cam.label}}</option>
              </select> -->
            </div>
          </div>
          <div class="chat_config_row">
            <!-- <div style="width:60px; text-align: right; padding: 0 2px;">音频源：</div> -->
            <div style="flex-grow: 1;">
              <v-select hide-details dense :items="localMicsSelect" label="音频源" v-model="localMicSelect" ></v-select>
              <!-- <select v-model="localMicSelect">
                <option value ="-1">未选择</option>
                <option v-for="(mic,index) in localMics" :key="'localmic_'+index" :value="mic.index" >{{mic.label}}</option>
              </select> -->
            </div>
          </div>
          <div class="chat_config_row">
            <div style="flex-grow: 1;">
              <!-- <button @click="updateLocalConfig" >确定</button> -->
              <v-btn depressed small outlined @click="updateLocalConfig()" class="tcolor_primary" style="margin:0 4px;">确定</v-btn>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content" style="position: relative; overflow-y: auto; height: 0;">
        
        <div class="chat_views" @click="showWordsList = false">
          <div v-for="({videoStream, audioStream, name, peerId},index) in streamList" :key="'peer_view_'+index" class="chat_view">
            <div class="view_content">
              <div class="view_header" ><span class="tcolor_reverse">{{name}}</span></div>
              <div v-if="!videoStream && !audioStream" class="view_place_holder" ><span class="iconfont icon-user-fill icon tcolor_reverse" style="font-size: 36px;"></span></div>
              <div v-else-if="!videoStream && audioStream" class="view_place_holder" ><span class="iconfont icon-notificationfill icon tcolor_reverse" style="font-size: 36px;"></span></div>
              <video class="view_video" autoplay :ref="'view_'+peerId" :id="'view_'+peerId" :srcObject.prop="videoStream"  ></video>
              <audio :ref="'audio_'+peerId" :id="'audio_'+peerId" :srcObject.prop="audioStream" autoplay></audio>
            </div>
          </div>
        </div>
      </div>
      <div ref="selfViewContainer" class="self_view tbgcolor_main">
          <div v-if="isInRoom && isRecording" class="view_content">
            <div class="view_header" style="width: 120px;"><span class="tcolor_reverse" style="overflow-wrap: break-word;">{{localData.name}}</span></div>
            <video class="view_video" autoplay muted ref="selfView" ></video>
          </div>
          <div v-else-if="isInRoom && !isRecording" class="self_view_close" style="padding: 10px;" >
            <div class="view_header" style="width: 120px;"><span class="tcolor_main" style="overflow-wrap: break-word;">{{localData.name}}</span></div>
            <a @click="changeRecordStatus()" class="iconfont icon-recordfill icon" style="font-size: 24px;" ></a>
            <!-- <a @click="changeRecordStatus()" class="iconfont icon-voicefill icon"  style="font-size: 24px;" ></a> -->
          </div>
          <div v-else class="self_view_close" >
            <a @click="joinRoom()">加入房间</a>
          </div>
        </div>
      <div :class="[showWordsList? 'words_info': 'words_info_hide', 'tbgcolor_mask_error']" style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start;">
        <div v-for="(w,index) in wordsList" :key="'localcam_'+index">{{`${w.name}: ${w.content}`}}</div>
      </div>
      <div class="chat_menu">
        <div style="flex-grow: 1; display: flex;">
          <input v-model="words" type="text" width="50" style="flex-grow: 1;" placeholder="发送文字" @focus="showWordsList = true" @keyup.enter="sendWords(null)" />
          <!-- <v-text-field densese single-line outlined  hide-details="true" label="" height="30" v-model="words"  class="py-0 my-0" @focus="showWordsList = true" @keyup.enter="sendWords(null)"  ></v-text-field> -->
          <!-- <v-button class="tcolor_sub" style="margin: 0 4px;" @click="sendWords(null)">发送</v-button> -->
          <v-btn depressed small outlined  @click="sendWords(null)" class="tcolor_primary" style="margin:0 4px;">发送</v-btn>
        </div>
        <div>
          <!-- <a v-if="isInRoom && !isRecording" style="margin: 0 4px;" class="iconfont icon-recordfill icon tcolor_sub" title="开始视频" @click="changeRecordStatus()" />
          <a v-else-if="isInRoom && isRecording" style="margin: 0 4px;" class="iconfont icon-stopcircle icon tcolor_sub" title="结束视频" @click="changeRecordStatus()" />
          <a style="margin: 0 4px;" class="iconfont icon-cog icon tcolor_sub" title="设置" @click="toggleLocalConfig()" /> -->
          <v-btn v-if="isInRoom && !isRecording" icon small @click="changeRecordStatus()" title="开始视频">
            <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-video</v-icon>
          </v-btn>
          <v-btn v-else-if="isInRoom && isRecording" icon small @click="changeRecordStatus()" title="结束视频">
            <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-video-off</v-icon>
          </v-btn>
          <v-btn icon small @click="toggleLocalConfig()" title="设置">
            <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'
import { io } from "socket.io-client";
import RoomClient from './RoomClient.js'
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
      isInRoom: false,
      socketLoading: false,
      isRecording: false,
      streamList: [],
      socket: null,
      chatClient: null,
      peers: {},
      producerMap:{},
      consumerMap: {},
      selfStream: null,
      wordsList: [
        // {name: '系统',content: 'enjoy it'}
      ],
      words: null,
      localData: {name: '',device: {}},
      localCameras: [],
      localCamerasSelect:[{text:'未选择',value:'-1'}],
      localMics: [],
      localMicsSelect:[{text:'未选择',value:'-1'}],
      localCamSelect: -1,
      localMicSelect: -1,
      viewList: [
        {name:"test1"}
      ],
      errorInfo: null,
      announcedIpsString: ''
    }
  },
  created: function() {
    this.announcedIpsString = this.configData.data.announced_ips.join('\n')
    this.$bus.on('connectfailed_'+this.configData.id, data =>  {
      console.log('connectfailed')
      this.showErrorInfo = true
      this.errorInfo = data.errorMsg
    })
    this.$bus.on('joinfailed_'+this.configData.id, e => {
      console.log('join failed')
      alert(e.errorMsg)
    })
    this.$bus.on('roominfo_'+this.configData.id, data =>  {
      console.log('roominfo')
      this.updateStreamList(data.members.map( m => {return {peerId:m.id, name:m.name}}), true)
    })
    this.$bus.on('producermap_'+this.configData.id, data => this.producerMap = data)
    this.$bus.on('consume_'+this.configData.id, ({producerId, consumer, stream, kind}) => {
      let peerId = this.producerMap[producerId]
      this.consumerMap[consumer.id] = peerId
      console.log(`consume consumerId: ${consumer.id}, producerId: ${producerId},peerId:${peerId}`)
      if(kind==='video'){
        this.updateStreamList([{peerId, videoStream: stream}],false)
      }else if(kind === 'audio') {
        console.log(`autio comes peerId: ${peerId}`)
        if(this.socket.id != peerId){
          this.updateStreamList([{peerId, audioStream: stream}],false)
        }
      }
    })
    this.$bus.on('consumerclosed_'+this.configData.id, consumerId => {
      if(this.consumerMap[consumerId] && this.$refs['view_'+this.consumerMap[consumerId]] && this.$refs['view_'+this.consumerMap[consumerId]].length > 0){
        this.$refs['view_'+this.consumerMap[consumerId]][0].srcObject = null
      }
    })
    // this.init()
    if(this.configData.data.auto_join === "true"){
      this.joinRoom()
    }
  },
  beforeDestroy: function() {
    this.$bus.off('connectfailed_'+this.configData.id)
    this.$bus.off('roominfo_'+this.configData.id)
    this.$bus.off('producermap_'+this.configData.id)
    this.$bus.off('consume_'+this.configData.id)
    this.$bus.off('consumerclosed_'+this.configData.id)
    this.$bus.off('joinfailed_'+this.configData.id)
  },
  methods: {
    init() {
      if(!this.isInRoom){
        return
      }
      this.socket = io('/chatroom')
      this.socket.on("roominfo", data => {
        this.updateStreamList(data.members.map( m => {return {peerId:m.id, name:m.name}}), true)
      })
      this.socket.on("join", (data) => {
        console.log('join')
        this.updateStreamList(data.members.map( m => {return {peerId:m.id, name:m.name}}), true)
      })
      this.socket.on("postwords", data => {
        console.log('postwords',data)
        this.$bus.emit('notify', {title: '消息', body: `${data.name}: ${data.content}`,sound: 'bor',timeout: 4000})
        this.wordsList.push(data)
      })
      // this.socket.on(
      //   'disconnect',
      //   function () {
      //     this.exit(true)
      //   }.bind(this)
      // )
      this.socket.on("connect", () => {
        if(localStorage.getItem('localCamera_'+this.configData.id)){
          this.localData.device.camera = JSON.parse(localStorage.getItem('localCamera_'+this.configData.id))
          this.localCamSelect = this.localData.device.camera.index
        }
        if(localStorage.getItem('localMic_'+this.configData.id)){
          this.localData.device.mic = JSON.parse(localStorage.getItem('localMic_'+this.configData.id))
          this.localMicSelect = this.localData.device.mic.index
        }
        if(localStorage.getItem('name_'+this.configData.id)){
          this.localData.name = localStorage.getItem('name_'+this.configData.id)
        }else {
          console.log(`init socketId: ${this.socket.id}`) 
          this.localData.name = this.socket.id
        }
        this.chatClient = new RoomClient(this.socket, this.configData.id, this.localData.name, this.$bus)
      });
    },
    joinRoom(){
      this.isInRoom = true
      this.socketLoading = true
      this.init()
    },
    async leftRoom(){
      if(this.isRecording){
        await this.closeMedia()
        this.isRecording = false
      }
      this.chatClient.exit()
      this.isInRoom = false
      this.streamList = []
    },
    updateStreamList(updateList, withDelete){
      let streamMap = {}
      for(let i of this.streamList){
        streamMap[i.peerId] = i
      }
      let resList = []
      if(withDelete){
        for(let i of updateList) {
          if(streamMap[i.peerId]){
            if((i.audioStream || i.videoStream) && (!streamMap[i.peerId].audioStream && !streamMap[i.peerId].videoStream)){
              console.log('通话接通0')
              let name = i.name ? i.name : i.peerId
              this.$bus.emit('notify', {title: '通话接通', body: `聊天室${this.configData.name}-${name}开始通话`,sound: 'deleng',timeout: 4000})
            }
            resList.push(Object.assign(streamMap[i.peerId], i))
          }else{
            resList.push(i)
            if(this.streamList.length > 0) {
              console.log('新成员0')
              let name = i.name ? i.name : i.peerId
              this.$bus.emit('notify', {title: '新成员', body: `${name}进入聊天室${this.configData.name}`,sound:'dongdeng',timeout: 4000})
            }
          }
        }
      }else{
        resList = this.streamList
        for(let i of updateList) {
          if(streamMap[i.peerId]){
            if((i.audioStream || i.videoStream) && (!streamMap[i.peerId].audioStream && !streamMap[i.peerId].videoStream)){
              console.log('通话接通1')
              let name = i.name ? i.name : i.peerId
              this.$bus.emit('notify', {title: '通话接通', body: `聊天室${this.configData.name}-${name}开始通话`,sound: 'deleng',timeout: 4000})
            }
            Object.assign(streamMap[i.peerId], i)
          }else{
            resList.push(i)
            if(this.streamList.length > 0) {
              console.log('新成员1')
              let name = i.name ? i.name : i.peerId
              this.$bus.emit('notify', {title: '新成员', body: `${name}进入聊天室${this.configData.name}`,sound:'dongdeng',timeout: 4000})
            }
          }
        }
      }
      this.streamList = resList
      this.$forceUpdate()
      for(let i of this.streamList){
        if(i.videoStream){
          this.$refs['view_'+i.peerId][0].srcObject = i.videoStream
          if(this.socket.id === i.peerId){
            console.log('设置muted')
            this.$refs['view_'+i.peerId][0].muted = 'muted'
          }
        }
        if(i.audioStream){
          console.log('render audio peerId:'+i.peerId)
          this.$refs['audio_'+i.peerId][0].srcObject = i.audioStream
        }
      }
      this.$forceUpdate()
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    toggleLocalConfig() {
      this.showLocalConfig = !this.showLocalConfig
    },
    updateConfig() {
      if(!this.validIpsString(this.announcedIpsString)){
        alert('宣告IP列表格式不正确，请每行写一个IP地址，不要有空行')
        return
      }
      this.configData.data.announced_ips = this.announcedIpsString.split('\n')
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    validIpsString(str){
      let ips = str.split('\n')
      for(let ip of ips){
        if(!ip.match(/^\d+\.\d+\.\d+\.\d+$/)){
          return false
        }
      }
      return true
    },
    updateLocalConfig() {
      this.socket.emit("updateName", {name:this.localData.name})
      localStorage.setItem('name_'+this.configData.id,this.localData.name)
      if(this.localCamSelect !== -1){
        this.localData.device.camera = _.filter(this.localCameras,{'index':this.localCamSelect})[0]
      }
      if(this.localMicSelect !== -1){
        this.localData.device.mic = _.filter(this.localMics,{'index':this.localMicSelect})[0]
      }
      this.showLocalConfig = false
      if(this.isRecording){
        this.changeProduceDevice()
      }
    },
    async changeRecordStatus(){
      this.isRecording = !this.isRecording
      if(this.isRecording){
        this.mediaLoading = true
        await this.openMedia()
        this.mediaLoading = false
      }else{
        this.closeMedia()
      }
    },
    changeProduceDevice(){
      if(this.isRecording){
        this.closeMedia()
        this.openMedia()
      }
    },
    refreshDeviceData(stream){
      navigator.mediaDevices.enumerateDevices().then(devices => {
        console.log('初始化设备列表')
        var tmp = devices.map(d => {return {deviceId: d.deviceId,groupId: d.groupId,kind: d.kind,label: d.label}})
        console.log('初始化tmp',tmp)
        var index = 0
        tmp.forEach(d => d.index = index++)
        console.log('初始化localCameras',this.localCameras)
        this.localCameras = _.filter(tmp,{'kind':'videoinput'})
        this.localCamerasSelect = this.localCameras.map( c => { return {text: c.label, value: c.index}})
        this.localMics = _.filter(tmp,{'kind':'audioinput'})
        this.localMicsSelect = this.localMics.map( m => { return {text: m.label, value: m.index}})
        this.syncLocalData(stream)
      })
    },
    async openMedia() {
      console.log(`openMedia socketId:${this.socket.id}`)
      var params = this.validStatusForParams()
      let localStream = await navigator.mediaDevices.getUserMedia(params)
      this.refreshDeviceData(localStream)
      this.selfStream = localStream
      if(this.$refs.selfView){
        this.$refs.selfView.srcObject = localStream 
      }
      this.updateStreamList([{peerId: this.socket.id, videoStream: localStream}], false)
      var videoSettings = localStream.getVideoTracks()[0].getSettings()
      this.reSizeVideoView('selfViewContainer', videoSettings.width, videoSettings.height, 120, null)
      this.chatClient.produce(localStream)
    },
    async closeMedia() {
      this.chatClient.closeProducer()
      if(this.selfStream) {
        this.selfStream.getTracks().forEach(track => {
          track.stop()
        })
        this.selfStream = null
        this.$refs.selfView.srcObject = null
        this.$refs['view_'+this.socket.id][0].srcObject = null
      }
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
          if(!res || res.length === 0){
            console.warn("未匹配到音频源:"+track.getSettings().deviceId)
          }else if(res.length > 1){
            console.warn("匹配到多个音频源:"+JSON.stringify(res))
          }else {
            this.localData.device.mic = {deviceId:res[0].deviceId,groupId: res[0].groupId,name: res[0].label,index: res[0].index}
            this.localMicSelect = this.localData.device.mic.index
            localStorage.setItem('localMic_'+this.configData.id,JSON.stringify(this.localData.device.mic))
          }
        }else if(track.kind === 'video'){
          console.log('视频流:',this.localCameras)
          var res1 = _.filter(this.localCameras,{'deviceId':track.getSettings().deviceId,'groupId':track.getSettings().groupId})
          if(!res1 || res1.length === 0){
            console.warn("未匹配到视频源:"+track.getSettings().deviceId)
          }else if(res1.length > 1){
            console.warn("匹配到多个视频源:"+JSON.stringify(res))
          }else {
            this.localData.device.camera = {deviceId:res1[0].deviceId,groupId: res1[0].groupId,name: res1[0].label,index: res1[0].index}
            this.localCamSelect = this.localData.device.camera.index
            localStorage.setItem('localCamera_'+this.configData.id,JSON.stringify(this.localData.device.camera))
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
    sendWords(words){
      let trueWords = words ? words:this.words
      if(trueWords){
        // this.socket.emit('join',{roomId:this.configData.id})
        this.socket.emit('postwords', {name: this.localData.name, content: trueWords})
        if(!words){
          this.words = ''
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.widget_body_noscroll{
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
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
  max-width: 240px;
}

.chat_menu {
  padding: 4px;
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  z-index: 5;
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
  border-radius: 2px;
}

.view_header {
  position:absolute;
  top:0;
  left:0;
  z-index: 2;
  padding: 0 4px;
}
.view_place_holder {
  position:absolute;
  font-size: 36px;
  width: 36px;
  height: 36px;
  left: 50%;
  top: 50%;
  margin-top: -18px;    /* 高度的一半 */
  margin-left: -18px;    /* 宽度的一半 */
  z-index: 2;
}
.view_video {
  position: relative;
  object-fit: contain;
  z-index: 1;
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
  justify-content: space-around;
  align-items: center;
}
.local_config {
  width: 400px;;
  top: 0;
  right: 0;
  bottom: 36px;
  position: absolute;
  font-size: 12px;
  z-index: 6;
}
.words_info {
  left: 0;
  right: 0;
  bottom: 36px;
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
  bottom: 36px;
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
.ips_textarea {
  outline: none;
  width: 100%;
  height: 80px;
}

.chat_config_row {
  display: flex;
  align-items: center;
  padding: 4px;
  margin: 16px 0;
}
.chat_config_row input {
  border: none;
  border-radius: none;
}
</style>
