<template>
  <div class="widget_box">
    <div class="clearfix widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/truenas.png">
      <span style="padding: 0 10px;"><a :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
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
        <div v-for="item in poolInfo" :key="item.id" class="item_row">
          <div style="flex-grow: 1;">{{ item.name }}</div>
          <div style="width: 140px; position: relative; ">
            <div style="position: absolute; height: 100%; display: flex; align-items: center; justify-content: center;">{{ item.used + "/" + item.total }}</div>
            <div class="process_bar">
              <div class="process" :style="{width: (item.usedBytes * 100/item.totalBytes).toFixed(1).toString() + '%'}" />
              <!-- <div style="z-index: 2;">{{ item.used + "/" + item.total }}</div> -->
            </div>
          </div>
          <div style="margin: 0 2px; padding: 0 2px;" :class="item.healthClass">{{ item.healthy? "HEALTHY" : "ERROR" }}</div>
          <div style="margin: 0 2px; padding: 0 2px" :class="item.statusClass">{{ item.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'TrueNasWidget',
  props: {
    // name: { type: String, default: '文件同步' },
    // data: { type: Object, default: () => {} }
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      poolInfoTimer: null,
      showConfig: false,
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
        }, 60000)
      }
    },
    getPoolInfo() {
      axios
        .get('/api/endpoints/truenas/queryPools?server=' + this.configData.data.server + '&apiKey=' + this.configData.data.api_key)
        .then(response => {
          const resData = response.data
          this.poolInfo = resData.data
          for (var i = 0; i < this.poolInfo.length; i++) {
            var item = this.poolInfo[i]
            if (item.healthy === true) {
              item.healthClass = 'stat_ok'
            } else {
              item.healthClass = 'stat_alert'
            }
            if (item.status === 'ONLINE') {
              item.statusClass = 'stat_ok'
            } else {
              item.statusClass = 'stat_alert'
            }
          }
        })
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    updateConfig() {
      this.$bus.emit('update', this.configData)
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
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
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
// trueNasWidget
.item_row {
  margin: 2px 0px;
  padding: 4px 2px;
  color: white;
  display: flex;
  align-items: center;
}
.process_bar {
  margin: 4px 0;
  width: 100%;
  height: 16px;
  background-color: #455a64;
}
.process {
  // margin: 4px;
  height: 100%;
  background-color: #90a4ae;
}
.stat_ok {
  background-color: #2baf2b;
}
.stat_alert {
  background-color: #e84e40;
}
</style>
