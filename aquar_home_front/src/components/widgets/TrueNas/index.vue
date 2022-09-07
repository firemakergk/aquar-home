<template>
  <div class="widget_box">
    <div class="widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/truenas.png">
      <span style="padding: 0 10px;"><a target="_blank" :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_sub" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
    </div>
    <div class="widget_body">
      <div v-show="showErrorInfo" class="error_info">
        <span v-show="isError">
          <span  class="iconfont icon-times-circle-fill icon tcolor_sub" style="font-size: 12px;"></span>
          <span  style=" margin: 0 4px; font-size: 12px;">连接失败</span>
        </span>
        <span>{{ errorInfo }}</span>
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
            <div style="width:80px; text-align: right; padding: 0 2px;">apiKey：</div>
            <div style="flex-grow: 5;">
              <input v-model="configData.data.api_key" type="text" name="app_key" style="display: inline-block; width: 100%;">
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
        <div v-for="(item,index) in poolInfo" :key="'pool_item_'+index" class="item_row" :class="index != poolInfo.length-1? 'border_bt':''">
          <div style="flex-grow: 1;" class="tcolor_main">{{ item.name }}</div>
          <div style="width: 140px; position: relative; ">
            <div style="position: absolute; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
            <div class="process_bar tpcolor_idle">
              <div class="process tpcolor_info" :style="{width: (item.usedBytes * 100/item.totalBytes).toFixed(1).toString() + '%'}" />
              <!-- <div style="z-index: 2;">{{ item.used + "/" + item.total }}</div> -->
            </div>
          </div>
          <div>{{ item.used + "/" + item.total }}</div>
          <!-- <div style="margin: 0 2px; padding: 0 2px;" :class="item.healthClass">{{ item.healthy? "HEALTHY" : "ERROR" }}</div> -->
          <!-- <div style="margin: 0 2px; padding: 0 2px" :class="item.statusClass">{{ item.status }}</div> -->
          <v-chip small label :class="item.statusClass" class="mx-1" >{{ item.status }}</v-chip>
          <v-chip small label :class="item.healthClass" class="mx-1">{{ item.healthy? "HEALTHY" : "ERROR" }}</v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrueNasWidget',
  props: {
    // name: { type: String, default: '文件同步' },
    // data: { type: Object, default: () => {} }
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      poolInfoTimer: null,
      showConfig: false,
      showErrorInfo: false,
      isError: false,
      errorInfo: null,
      poolInfo: []
    }
  },
  created: function() {
    this.getPoolInfo()
    clearInterval(this.poolInfoTimer)
    this.poolInfoTimer = null
    this.setPoolInfoTimer()
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.poolInfoTimer)
    this.poolInfoTimer = null
  },
  methods: {
    setPoolInfoTimer() {
      if (this.poolInfoTimer == null) {
        this.timer = setInterval(() => {
          this.getPoolInfo()
        }, 100000)
      }
    },
    getPoolInfo() {
      this.$axios
        .get('/api/endpoints/truenas/queryPools?server=' + this.configData.data.server + '&apiKey=' + this.configData.data.api_key)
        .then(response => {
          const resData = response.data
          this.poolInfo = resData.data
          if(this.poolInfo){
            this.showErrorInfo = false
            for (var i = 0; i < this.poolInfo.length; i++) {
              var item = this.poolInfo[i]
              if (item.healthy === true) {
                item.healthClass = 'tbgcolor_active'
              } else {
                item.healthClass = 'tbgcolor_error'
              }
              if (item.status === 'ONLINE') {
                item.statusClass = 'tbgcolor_active'
              } else {
                item.statusClass = 'tbgcolor_error'
              }
            }
          }else{
            this.showErrorInfo = true
            this.errorInfo = "无信息"
            this.isError = false
          }
        })
        .catch(error => {
          this.isError = false
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

// trueNasWidget
.item_row {
  margin: 2px 0px;
  padding: 4px 2px;
  display: flex;
  align-items: center;
}
.process_bar {
  margin: 4px 0;
  width: 100%;
  height: 8px;
}
.process {
  // margin: 4px;
  height: 100%;
  // border-right: 2px solid var(--v-primary-lighten4,#99CCFF) !important;;
}

</style>
