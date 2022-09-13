<template>
  <div class="widget_box">
    <div class="widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/syncthing.png">
      <span style="padding: 0 10px;"><a target="_blank" :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="getSyncthingInfo()" title="刷新">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-reload</v-icon>
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
            <div style="width:80px; text-align: right; padding: 0 2px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" name="name" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">链接地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.href" type="text" name="href" style="display: inline-block; width: 100%;">
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
              <button @click="updateConfig" >确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div v-for="(item,index) in syncthingInfo" :key="'item_'+index">
          <div class="stat_base" :class="index != syncthingInfo.length-1? 'border_bt':''" >
            <span style="flex-grow: 1;flex-shrink: 1;">{{ item.id }}</span>
            <span style="margin-right:10px;">{{ item.localFiles }}/{{ item.globalFiles }}</span>
            <v-chip small label :class="item.statClass" >{{ item.status }}</v-chip>
            <!-- <span :class="item.statClass"  >
              <span style="padding: 6px; color: rgba(0,0,0,0.6);">{{ item.status }}</span>
            </span> -->
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
    this.syncthingTimer = null
  },
  methods: {
    setSyncthingTimer() {
      if (this.syncthingTimer == null) {
        this.timer = setInterval(() => {
          this.getSyncthingInfo()
        }, 40000)
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
              item.statClass = 'tbgcolor_disable'
            } else if (item.puase === true) {
              item.statClass = 'tbgcolor_disable'
            } else if (item.status === 'idle') {
              item.statClass = 'tbgcolor_idle'
            } else if (item.status === 'scanning') {
              item.statClass = 'tbgcolor_info'
            } else if (item.status === 'syncing') {
              item.statClass = 'tbgcolor_active'
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
.stat_base {
  margin: 2px 0px;
  padding: 4px 2px;
  display: flex;
  align-items: center;
}

</style>
