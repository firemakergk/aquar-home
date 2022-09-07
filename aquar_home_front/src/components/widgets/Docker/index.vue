<template>
  <div class="widget_box">
    <div class="widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/docker.png">
      <span style="padding: 0 10px;"><a target="_blank" :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
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
      <div class="widget_content">
        <div v-for="(item,index) in containerList" :key="'con_'+index" :class="index != containerList.length-1? 'border_bt':''">
          <div class="row_base" >
            <span style="flex-grow: 1; flex-shrink:1;  overflow: hidden; text-overflow: ellipsis;">{{ item.name }}</span>
            <span style="flex-shrink:0; margin-right:10px; ">{{ item.status }}</span>
            <!-- <span class="state_span" :class="item.statClass">{{ item.state.toUpperCase() }}</span> -->
            <v-chip small label :class="item.statClass" class="mx-1" >{{ item.state.toUpperCase() }}</v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dockerWidget',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      dockerTimer: null,
      showErrorInfo: false,
      showConfig: false,
      containerList: [],
      errorInfo: null
    }
  },
  created: function() {
    this.getContainerList()
    clearInterval(this.dockerTimer)
    this.dockerTimer = null
    this.setDockerTimer()
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.dockerTimer)
    this.dockerTimer = null
  },
  methods: {
    setDockerTimer() {
      if (this.dockerTimer == null) {
        this.timer = setInterval(() => {
          this.getContainerList()
        }, 60000)
      }
    },
    getContainerList() {
      this.$axios
        .get('/api/endpoints/docker/list?server=' + this.configData.data.server ,{timeout:300000})
        .then(response => {
          this.showErrorInfo = false
          const resData = response.data.data
          this.containerList = resData
          for (var i = 0; i < this.containerList.length; i++) {
            var item = this.containerList[i]
            if (!item) {
              item.statClass = 'tbgcolor_disable'
            } else if (item.state === 'exited') {
              item.statClass = 'tbgcolor_info'
            } else if (item.state === 'paused') {
              item.statClass = 'tbgcolor_warn'
            } else if (item.state === 'running') {
              item.statClass = 'tbgcolor_active'
            } else {
              item.statClass = 'tbgcolor_idle'
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
.row_base {
  margin: 2px 0px;
  padding: 0 0 0 4px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.state_span {
  padding: 4px; 
  width:80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink:0;
}
</style>
