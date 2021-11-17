<template>
  <div class="widget_box">
    <div class="clearfix widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/syncthing.png">
      <span style="padding: 0 10px;"><a :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
      <div v-show="showErrorInfo" class="error_info">
        <div style="width: 100%; height: 80px;  display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span  class="iconfont icon-times-circle-fill icon" style="font-size: 24px;"></span>
          <span  style="font-size: 24px;">连接失败</span>
        </div>
        <div style="padding: 0 2px; word-wrap:break-word; display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span>{{ errorInfo }}</span>
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top">
          <span style="float:left;">设置</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleConfig()"> x </a>
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
            <div style="width:80px; text-align: right; padding: 0 2px;">appKey：</div>
            <div style="flex-grow: 5;">
              <input v-model="configData.data.app_key" type="text" name="app_key" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px;" />
            <div style="flex-grow: 5;">
              <button @click="updateConfig">确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div v-for="item in syncthingInfo" :key="item.id">
          <div class="clearfix stat_base" :class="item.statClass">
            <span style="flex-grow: 1;">{{ item.id }}</span>
            <span style="margin-right:10px;">{{ item.localFiles }}/{{ item.globalFiles }}</span>
            <span style="span: 6px; margin-right:6px; color: rgba(255,255,255,0.6);">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SyncthingWidget',
  props: {
    // name: { type: String, default: '文件同步' },
    // data: { type: Object, default: () => {} }
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      syncthingTimer: null,
      showErrorInfo: false,
      showConfig: false,
      syncthingInfo: [],
      errorInfo: null
    }
  },
  created: function() {
    this.getSyncthingInfo()
    clearInterval(this.syncthingTimer)
    this.syncthingTimer = null
    this.setSyncthingTimer()
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.syncthingTimer)
    this.syncthingtimer = null
  },
  methods: {
    setSyncthingTimer() {
      if (this.syncthingTimer == null) {
        this.timer = setInterval(() => {
          this.getSyncthingInfo()
        }, 5000)
      }
    },
    getSyncthingInfo() {
      this.$axios
        .get('/api/endpoints/syncthing/info?server=' + this.configData.data.server + '&appKey=' + this.configData.data.app_key,{timeout:300000})
        .then(response => {
          this.showErrorInfo = false
          const resData = response.data
          this.syncthingInfo = resData
          for (var i = 0; i < this.syncthingInfo.length; i++) {
            var item = this.syncthingInfo[i]
            if (item == null || item === 'undifined') {
              item.statClass = 'stat_pause'
            } else if (item.puase === true) {
              item.statClass = 'stat_pause'
            } else if (item.status === 'idle') {
              item.statClass = 'stat_idle'
            } else if (item.status === 'scanning') {
              item.statClass = 'stat_scanning'
            } else if (item.status === 'syncing') {
              item.statClass = 'stat_syncing'
            }
          }
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('url:'+error.request.responseURL+',message:'+error.message)
        })
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    }
  }
}
</script>

<style lang="scss" scoped>
//widget
a {
    color: white;
  }
input {
  font-size:1em;
  height:2em;
  border:1px solid;
  // color:#6a6f77;
  background-color: #2c2c2c;
  color: white;
  border-color: #606060;
}
.widget_box {
  width: 100%;
  height: 100%;
  min-height: 140px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  float: left;
  padding: 4px 4px;
  border-radius: 2px;
  background-color: rgba(44, 44, 44, 1);
  box-sizing: border-box;
  color: white;
}
.widget_header {
  width: 100%;
  padding: 4px 4px;
  margin: 0 auto;
  display: inline-flex;;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.widget_body {
  width: 100%;
  height: 100%;
  position: relative;
}
.widget_content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100px;
  font-size: 14px;
}
.float_config {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 3;
  overflow-y: auto;
  background-color: rgba(0,0,0,0.75);
  font-size: 12px;
  color: white;
}
.float_config::-webkit-scrollbar {
  width: 1px;
}
.float_config::-webkit-scrollbar-track {
  box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
}
.float_config::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 0.5px solid slategrey;
}
.config_top {
  background-color: #000;
  color: white;
  top: 0;
  height: 16px;
}
.config_body {
  height: 100%;
}
.config_row {
  display: flex;
  align-items: center;
  padding: 2px 2px;
}

.error_info {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 3;
  word-wrap:break-word;
  background-color: rgba(0,0,0,0.75);
  font-size: 12px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction:column;
}
// syncthingwidget
.stat_base {
  margin: 2px 0px;
  padding: 4px 2px;
  display: flex;
  color: white;
}
.stat_idle {
  background-color: #455a64;
}
.stat_scanning {
  background-color: #1565c0;
}
.stat_syncing {
  background-color: #2e7d32;
}
.stat_pause {
  background-color: #424242;
}

</style>
