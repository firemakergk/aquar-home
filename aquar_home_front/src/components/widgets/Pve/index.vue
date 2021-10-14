<template>
  <div class="widget_box">
    <div class="clearfix widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/pve.png">
      <span style="padding: 0 10px;"><a :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" />
    </div>
    <div v-if="queryData" class="widget_body">
      <div v-show="showConfig" class="float_config">
        <div class="config_top">
          <span style="float:left;">设置</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleConfig()"> x </a>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">链接地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.href" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">server：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.server" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">node：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.node" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">api token：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.api_token" type="text" name="app_key" disabled="disabled" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px;" />
            <div style="flex-grow: 1;">
              <button @click="updateConfig">确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div class="node_info">
          <div class="node_info_left">
            <div class="node_info_left_top">
              <div style="font-size: 32px;">{{ configData.data.node }}</div>
              <div>已运行{{ queryData.pveStatus?secondsFormat(queryData.pveStatus.uptime):"" }}</div>
              <div>
                <span>load 1/5/15min: </span>
                <span>{{ queryData.pveStatus.loadavg[0] }},</span>
                <span>{{ queryData.pveStatus.loadavg[1] }},</span>
                <span>{{ queryData.pveStatus.loadavg[2] }}</span>
              </div>
            </div>
          </div>
          <div class="node_info_right">
            <div class="node_info_right_row">
              <div>
                <span style="margin:0 2px;">CPU：</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.sockets }}路</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.cores }}核</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.cpus }}线程</span>
              </div>
              <div class="process_bar">
                <div class="process" :style="{width: (queryData.pveStatus.cpu * 100).toFixed(1).toString() + '%'}" />
              </div>
              <div>
                <span>内存:</span>
                <span>{{ (queryData.pveStatus.memory.used*100/queryData.pveStatus.memory.total).toFixed(1) }}%&nbsp;
                  {{ fileSize(queryData.pveStatus.memory.used) }}/{{ fileSize(queryData.pveStatus.memory.total) }}</span>
              </div>
              <div class="process_bar">
                <div class="process" :style="{width: (queryData.pveStatus.memory.used*100/queryData.pveStatus.memory.total).toFixed(1).toString() + '%'}" />
              </div>
            </div>
            <div class="node_info_right_row">
              <div>
                <span>系统盘:</span>
                <span>{{ (queryData.pveStatus.rootfs.used*100/queryData.pveStatus.rootfs.total).toFixed(1) }}%&nbsp;
                  ({{ fileSize(queryData.pveStatus.rootfs.used) }}/{{ fileSize(queryData.pveStatus.rootfs.total) }})</span>
              </div>
              <div class="process_bar">
                <div class="process" :style="{width: (queryData.pveStatus.rootfs.used*100/queryData.pveStatus.rootfs.total).toFixed(1).toString() + '%'}" />
              </div>
            </div>
          </div>
        </div>
        <div v-for="item in queryData.vmList" :key="item.id" class="item_list">
          <div v-if="item.type==='qemu'" class="item_row">
            <div style="flex-grow: 1;"><span style="margin:0 4px 0 0;">{{ item.name }}</span><span style="color: #90a4ae;">({{ item.id }})</span></div>
            <div style="width: 80px; text-align: right;">{{ item.maxcpu }}C {{ fileSize(item.maxmem, 0) }} {{ fileSize(item.maxdisk, 0) }}</div>
            <!-- <div style="margin: 0 2px; padding: 0 2px;" :class="item.statusClass">{{ item.healthy? "HEALTHY" : "ERROR" }}</div> -->
            <div style="margin:0 0 0 8px; padding: 0 2px" :class="item.statusClass">{{ item.status.toUpperCase() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'PveWidget',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      pveTimer: null,
      showConfig: false,
      queryData: null
    }
  },
  created: function() {
    this.getPveInfo()
    clearInterval(this.pveTimer)
    this.pveTimer = null
    this.setPveTimer()
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.pveTimer)
    this.pveTimer = null
  },
  methods: {
    setPveTimer() {
      if (this.pveTimer == null) {
        this.timer = setInterval(() => {
          this.getPveInfo()
        }, 61000)
      }
    },
    getPveInfo() {
      axios
        .get('/api/endpoints/pve/queryStatus?server=' + this.configData.data.server + '&node=' + this.configData.data.node + '&apiToken=' + this.configData.data.api_token)
        .then(response => {
          const resData = response.data
          this.queryData = resData.data
          for (var i = 0; i < this.queryData.vmList.length; i++) {
            var item = this.queryData.vmList[i]
            if (item.status === 'running') {
              item.statusClass = 'stat_ok'
            } else {
              item.statusClass = 'stat_cancel'
            }
          }
        })
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    secondsFormat(s) {
      var day = Math.floor(s / (24 * 3600))
      var hour = Math.floor((s - day * 24 * 3600) / 3600)
      var minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60)
      // var second = s - day * 24 * 3600 - hour * 3600 - minute * 60
      return day + '天' + hour + '时' + minute + '分'
    },
    fileSize(byteSize, fixNum) {
      if (!byteSize) {
        return 'DIR'
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
      } else if (byteSize > 1073741824 && byteSize <= 1099511627776) {
        resNum = byteSize / 1073741824
        postfix = 'G'
      } else if (byteSize > 1099511627776) {
        resNum = byteSize / 1099511627776
        postfix = 'T'
      } else {
        resNum = 0
        postfix = 'NaN'
      }
      return resNum.toFixed(fixNum != null ? fixNum : 2) + postfix
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
.item_list {
  overflow-y: auto;
  overflow-x: hidden;
}
.item_list::-webkit-scrollbar {
  width: 1px;
}
.item_list::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
.item_list::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 0.5px solid slategrey;
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
.node_info {
  display: flex;
  flex-direction: row;
  margin: 2px;
}
.node_info_left {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-around;
  padding: 4px;
  border-right: solid thin #455a64;
  border-bottom: solid thin #455a64;
}
.node_info_left_top {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 2px;
  justify-content: space-around;
}
.node_info_left_bottom {
  display: flex;
  flex-direction: column;
}
.node_info_right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-around;
  padding: 4px;
  // border-left: solid thin #455a64;
  border-bottom: solid thin #455a64;
}
.node_info_right_row {
  display: flex;
  flex-direction: column;
}
.process_bar {
  margin: 4px 0;
  width: 100%;
  height: 8px;
  background-color: #455a64;
}
.process {
  // margin: 4px;
  height: 100%;
  background-color: #90a4ae;
}
.item_row {
  margin: 2px 0px;
  padding: 4px 2px;
  color: white;
  display: flex;
}

.stat_ok {
  background-color: #2baf2b;
}
.stat_cancel {
  background-color: #455a64;
}
</style>
