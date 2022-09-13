<template>
  <div class="widget_box">
    <div class="widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/transmission.png">
      <span style="padding: 0 10px;"><a target="_blank" :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-sync-alt icon tcolor_sub" title="刷新" @click="getTorrentInfo()" />
      <a style="margin: 0 4px;" class="iconfont icon-playcircle icon tcolor_sub" title="全部开始" @click="operateTorrent('torrent-start',null)" />
      <a style="margin: 0 4px;" class="iconfont icon-pausecircle icon tcolor_sub" title="全部停止" @click="operateTorrent('torrent-stop',null)" />
      <a style="margin: 0 4px;" class="iconfont icon-plus icon tcolor_sub" title="新增" @click="toggleAdd()" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="getTorrentInfo()" title="刷新">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon small @click="operateTorrent('torrent-start',null)" title="全部开始">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-play-circle-outline</v-icon>
      </v-btn>
      <v-btn icon small @click="operateTorrent('torrent-stop',null)" title="全部停止">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-pause-circle-outline</v-icon>
      </v-btn>
      <v-btn icon small @click="toggleAdd()" title="新增">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-plus</v-icon>
      </v-btn>
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
    </div>
    <div class="widget_body">
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
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" name="name" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">链接地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.href" type="text" name="href" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">server：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.server" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <!-- <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;"></div>
            <div style="flex-grow: 1;">
              *提示：出于安全考虑，AquarHome将用户名和密码加密后存储在token中。直接输入新用户名及密码并提交即可修改登录信息。
            </div>
          </div> -->
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">
              用户名：
            </div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.userName" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">密码：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.password" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                </template>
                <span>提示：出于安全考虑，AquarHome将用户名和密码加密后存储在token中。直接输入新用户名及密码并提交即可修改登录信息。</span>
              </v-tooltip>
              token：
            </div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.token" type="text" name="token" disabled='disabled' style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px;" />
            <div style="flex-grow: 5;">
              <button @click="updateConfig" >确定</button>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showAdd" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">添加</span>
          <v-icon class="tcolor_sub_head" @click="toggleAdd()" >mdi-close</v-icon>
        </div>
        <div style="display: flex; width: 240px;">
          <label style="width: 100px;"><input type="radio" name="newType" value="torrent" v-model="newType" select style=" display:inline; width: 16px;"/>种子文件</label>
          <label style="width: 100px;"><input type="radio" name="newType" value="magnet" v-model="newType" style=" display:inline; width: 16px;"/>磁力链接</label>
        </div>
        <div v-show="newType==='torrent'" class="config_body">
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">torrent文件:</div>
            <div style="flex-grow: 1;">
              <input type="file" name="newTorrent" ref="newTorrent" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px;" />
            <div style="flex-grow: 5;">
              <button @click="addNewDownload('torrent')" >确定</button>
            </div>
          </div>
        </div>
        <div v-show="newType==='magnet'" class="config_body">
          <div class="config_row">
            <div style="width: 100px; text-align: right; padding: 0 2px;">磁力链接:</div>
            <div style="flex-grow: 1;">
              <input type="text" v-model="newMagnet" name="newMagnet" ref="newMagnet" placeholder="magnet:?xt=urn:btih:..." style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width: 100px;" />
            <div style="flex-grow: 5;">
              <button @click="addNewDownload('magnet')" >确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div v-for="(item,index) in torrentInfo.torrents" :key="'tor_'+configData.id+index"  :class="index != torrentInfo.torrents.length-1? 'border_bt':''">
          <div class="row_base tcolor_main">
            <div class="torrent_info">
              <div class="text_info">
                <div style="" class="torrent_name">{{ item.name }}</div>
                <div style="flex-shrink:0; display: flex; justify-content: flex-end; align-items: center;">
                  <div style="flex-shrink:0; width: 100px;" class="process_bar tpcolor_idle">
                    <div class="process tpcolor_info" :style="{width: (item.percent * 100).toFixed(1).toString() + '%'}" />
                  </div>
                  <div style="flex-shrink:0; width: 50px; text-align: right; ">{{ item.percent*100 }}%</div>
                  <div style="flex-shrink:0; width: 90px; text-align: right; margin-right:10px; ">{{ fileSize(item.downloadedEver)}}/{{ fileSize(item.totalSize)}}</div>
                  <div style="flex-shrink:0; width: 120px;  text-align: center; margin-right:10px; ">↓&nbsp;{{ fileSize(item.rateDownload)}}&nbsp;&nbsp;&nbsp;↑&nbsp;{{ fileSize(item.rateUpload)}}</div>
                  <v-chip small label :class="item.statClass" class="mx-1" >{{ item.statusName }}</v-chip>
                </div>
                
              </div>
              <!-- <div class="state_span" :class="item.statClass">
                <span class="state_span" >{{ item.statusName }}</span>
              </div> -->
              <div class="state_span">
                <!-- <a v-if="item.status === STATUS_STOPPED" class="iconfont icon-playcircle icon" style="margin: 0 4px; font-size: 12px;" @click="operateTorrent('torrent-start',item.id)"></a>
                <a v-else class="iconfont icon-pausecircle icon" style="margin: 0 4px; font-size: 12px;" @click="operateTorrent('torrent-stop',item.id)"></a> -->
                <v-btn v-if="item.status === STATUS_STOPPED" icon x-small  @click="operateTorrent('torrent-start',item.id)" title="开始">
                  <v-icon class="tcolor_primary" style="font-size:16px;" >mdi-play-circle-outline</v-icon>
                </v-btn>
                <v-btn v-else icon x-small @click="operateTorrent('torrent-stop',item.id)" title="停止">
                  <v-icon class="tcolor_primary" style="font-size:16px;" >mdi-pause-circle-outline</v-icon>
                </v-btn>
                <v-btn icon x-small @click="operateTorrent('torrent-remove',item.id)" title="删除">
                  <v-icon class="tcolor_primary" style="font-size:16px;" >mdi-delete</v-icon>
                </v-btn>
                <!-- <a class="iconfont icon-delete icon" style="margin: 0 4px; font-size: 12px;" @click="operateTorrent('torrent-remove',item.id)"></a> -->
              </div>
            </div>
            <!-- <div class="process_bar tbgcolor_disable">
              <div class="process tbgcolor_active" :style="{width: (item.percent * 100).toFixed(1).toString() + '%'}" />
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'TransmissionWidget',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      STATUS_STOPPED: 0,
      STATUS_CHECK_WAIT: 1,
      STATUS_CHECK: 2,
      STATUS_DOWNLOAD_WAIT: 3,
      STATUS_DOWNLOAD: 4,
      STATUS_SEED_WAIT: 5,
      STATUS_SEED: 6,
      RE_MAGNET: /^magnet:\?/i,
      transmissionTimer: null,
      showErrorInfo: false,
      showConfig: false,
      showAdd: false,
      torrentInfo: {},
      errorInfo: null,
      newType: 'torrent',
      newTorrent: null,
      newMagnet: null
    }
  },
  created: function() {
    this.getTorrentInfo()
    clearInterval(this.transmissionTimer)
    this.transmissionTimer = null
    this.setTransmissionTimer()
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.transmissionTimer)
    this.transmissionTimer = null
  },
  methods: {
    setTransmissionTimer() {
      if (this.transmissionTimer == null) {
        this.timer = setInterval(() => {
          this.getTorrentInfo()
        }, 60000)
      }
    },
    getTorrentInfo() {
      this.$axios
        .get(`/api/endpoints/transmission/torrentList?tabIndex=${this.tabIndex}&id=${this.configData.id}&server=${this.configData.data.server}&token=${this.configData.data.token}`,{timeout:300000})
        .then(response => {
          this.showErrorInfo = false
          const resData = response.data
          if(resData.code && resData.code != 0){
            this.showErrorInfo = true
            this.errorInfo = resData
            console.log('url:'+response.responseURL+',message:'+resData)
          }
          this.torrentInfo = resData
          for (var i = 0; i < this.torrentInfo.torrents.length; i++) {
            var item = this.torrentInfo.torrents[i]
            if (!item) {
              item.statClass = 'tbgcolor_disable'
            } else if (item.status === this.STATUS_DOWNLOAD_WAIT || item.status === this.STATUS_DOWNLOAD) {
              item.statClass = 'tbgcolor_info'
            } else if (item.status === this.STATUS_CHECK_WAIT || item.status === this.STATUS_CHECK) {
              item.statClass = 'tbgcolor_warn'
            } else if (item.status === this.STATUS_SEED || item.status === this.STATUS_SEED_WAIT) {
              item.statClass = 'tbgcolor_active'
            } else {
              item.statClass = 'tbgcolor_idle'
            }
          }
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('stack:'+error.stack+',message:'+error.message)
        })
    },
    operateTorrent(method,ids){
      if(method != 'torrent-start' && method != 'torrent-stop' && method != 'torrent-remove'){
        console.log(`method is illeagel:${method}`)
        return
      }
      var options = {}
      if(method === 'torrent-remove'){
        if(!confirm('确认删除该下载任务？')){
          return
        }else if(confirm('是否同时删除本地文件？')){
          options['delete-local-data'] = true
        }
      }
      if(ids && Number.isInteger(ids)){
        ids = [ids]
      }else if(!ids){
        ids = this.torrentInfo.torrents.map(i => i.id)
      }
      if(!ids){
        return null
      }
      this.$axios({
        method: 'post',
        url: '/api/endpoints/transmission/operate',
        data: {
          tabIndex: this.tabIndex,
          id: this.configData.id,
          server: this.configData.data.server,
          token: this.configData.data.token,
          method: method,
          ids: ids,
          options:options
        }
      })
      .then(response => {
        this.showErrorInfo = false
        const resData = response.data
        if(resData.code && resData.code != 0){
          this.showErrorInfo = true
          this.errorInfo = resData
          console.log('url:'+response.responseURL+',message:'+resData)
        }
        this.getTorrentInfo()
      })
      .catch(error => {
        this.showErrorInfo = true
        this.errorInfo = error.message
        console.log('stack:'+error.stack+',message:'+error.message)
      })
    },
    toggleConfig() {
      this.showAdd = false
      this.showConfig = !this.showConfig
    },
    toggleAdd() {
      this.showConfig = false
      this.showAdd = !this.showAdd
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    fileSize(byteSize) {
      if (!byteSize) {
        return '0'
      }
      var resNum = 0
      var postfix = 'B'
      if (byteSize < 1024) {
        resNum = byteSize
      } else if (byteSize > 1024 && byteSize <= 1048576) {
        resNum = byteSize / 1024
        postfix = 'K'
      } else if (byteSize > 1048576 && byteSize <= 1073741824) {
        resNum = byteSize / 1048576
        postfix = 'M'
      } else if (byteSize > 1073741824 && byteSize <= 1073741824) {
        resNum = byteSize / 1073741824
        postfix = 'G'
      } else {
        resNum = byteSize / 1073741824
        postfix = 'G'
      }
      return resNum.toFixed(1).toString() + postfix
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },
    addNewDownload(type) {
      if(type==='torrent'){
        console.log('torrent')
        var torrentFile = this.$refs.newTorrent.files[0];
        console.log(JSON.stringify(torrentFile))
        if(!_.endsWith(torrentFile.name,'.torrent')){
          alert("请选择正确的种子文件!")
          return
        }
        if(torrentFile.size > 1024*1024){
          alert("文件不可大于1M")
          return
        }
        this.getBase64(torrentFile).then(fileData => {
          fileData = fileData.replace(/data:.+?;base64,/g,'')
          this.$axios({
            method: 'post',
            url: '/api/endpoints/transmission/operate',
            data: {
              tabIndex: this.tabIndex,
              id: this.configData.id,
              server: this.configData.data.server,
              token: this.configData.data.token,
              method: 'torrent-add',
              options:{metainfo:fileData}
            }
          })
          .then(response => {
            this.showErrorInfo = false
            const resData = response.data
            if(resData.code && resData.code != 0){
              this.showErrorInfo = true
              this.errorInfo = resData
              console.log('url:'+response.responseURL+',message:'+resData)
            }
            this.showAdd = false
            this.showConfig = false
            this.getTorrentInfo()
          })
          .catch(error => {
            this.showErrorInfo = true
            this.errorInfo = error.message
            console.log('stack:'+error.stack+',message:'+error.message)
          })
        }
        )
      }else if(type==='magnet'){
        console.log('magnet')
        if(!this.newMagnet || !this.newMagnet.match(this.RE_MAGNET)){
          alert('请输入正确的磁力链接!')
          return
        }
        this.$axios({
          method: 'post',
          url: '/api/endpoints/transmission/operate',
          data: {
            tabIndex: this.tabIndex,
            id: this.configData.id,
            server: this.configData.data.server,
            token: this.configData.data.token,
            method: 'torrent-add',
            options:{filename:this.newMagnet}
          }
        })
        .then(response => {
          this.showErrorInfo = false
          this.showAdd = false
          this.showConfig = false
          const resData = response.data
          if(resData.code && resData.code != 0){
            this.showErrorInfo = true
            this.errorInfo = resData
            console.log('url:'+response.responseURL+',message:'+resData)
          }
          this.getTorrentInfo()
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('stack:'+error.stack+',message:'+error.message)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.row_base {
  margin: 2px 0px;
  display: flex;
  flex-direction: column;
}
.torrent_info {
  // margin: 2px 0px;
  display: flex;
  flex-grow: 1;
}
.text_info {
  margin: 2px 0px;
  padding: 0 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-grow: 1;
  overflow: hidden;
}
.torrent_name {
  flex-grow: 1;
  flex-shrink:1; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.state_span {
  padding: 0 4px; 
  width:60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink:0;
}
.process_bar {
  margin: 2px 0 0 0;
  // width: 100%;
  height: 4px;
}
.process {
  // margin: 4px;
  height: 100%;
}
</style>
