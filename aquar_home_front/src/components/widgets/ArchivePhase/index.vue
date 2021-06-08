<template>
  <div class="widget_box">
    <div class="clearfix widget_header">
      <img style="height:20px; " src="./img/rsync.jpg">
      <span style="padding: 0 10px;">{{ configData.name }}</span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-plus icon" title="新增" @click="toggleAddItem()" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
      <div v-show="showAddItem" class="float_config">
        <div class="config_top">
          <span style="float:left;">设置</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleAddItem()"> x </a>
        </div>
        <div style="flex-grow: 1;">
          <div class="config_row">
            <div style="width:80px; text-align: right; margin: 0 4px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="newItem.name" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; margin: 0 4px;">归档源：</div>
            <div style="flex-grow: 1;">
              <input v-model="newItem.source" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; margin: 0 4px;">输出路径：</div>
            <div style="flex-grow: 1;">
              <input v-model="newItem.archive_dir_name" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; margin: 0 4px;">归档名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="newItem.phase_name" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
        </div>
        <div style="width: 90px; text-align: right;">
          <a style=" display:block; margin: 0 10px; padding:8px 0; width: 32px; color: #67C23A; float: right;" @click="submitAddItem()">确定</a>
        </div>
      </div>
      <div v-show="showConsole" class="float_console">
        <div class="console_top">
          <span style="float:left;">控制台</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleConsole()"> x </a>
          <a style="float:right; padding:0 8px;" :class="[executeEnable?'exec_enabled':'exec_disabled', 'iconfont icon-paper-plane icon']" title="执行" @click="startArchive()" />
        </div>
        <div class="console_body">
          <textarea v-model="console" class="console_area" />
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top">
          <span style="float:left;">设置</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleConfig()"> x </a>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div style="width:120px; text-align: right; padding: 0 4px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" name="name" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <!-- <div class="config_row">
            <div style="width:120px; text-align: right; padding: 0 4px;">脚本位置：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.script_path" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div> -->
          <div class="config_row">
            <div style="width:120px;" />
            <div style="flex-grow: 5;">
              <button @click="updateConfig">确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div v-for="(item,index) in configData.data.items" :key="'archive_item_'+ index" class="clearfix raw_base" style="width: 100%;">
          <div class="bar_base">
            <span style="padding: 0 4px;">{{ item.name }}</span>
            <span class="text_overflow" style="color:#aaa; font-size:12px; width: 120px;">{{ item.source }}</span>
            <span style="color:#ccc; padding: 0 4px;"> >> </span>
            <span class="text_overflow" style="color:#aaa; font-size:12px; width: 160px;">
              {{ item.archive_dir_name+ ":" +[item.phase_name?item.phase_name:nowDate] }}
            </span>
            <span style="flex-grow: 1;" />
            <a style="margin: 0 4px;" class="iconfont icon-cog icon" title="设置" @click="toggleConfigSingle(index)" />
            <!-- <a style="margin: 0 6px; width: 32px;" @click="prepareArchive(index)">启动</a> -->
            <a style="margin: 0 4px;" class="iconfont icon-sync-alt icon" title="启动" @click="prepareArchive(index)" />
          </div>
          <div v-show="configBarTable[index]" class="bar_config animate__animated animate__fadeIn">
            <div style="flex-grow: 1;">
              <div class="config_row">
                <div style="width:80px; text-align: right; margin: 0 4px;">名称：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">归档源：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.source" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">输出路径：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.archive_dir_name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">归档名称：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.phase_name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
            </div>
            <div style="width: 90px; text-align: right;">
              <a style=" display:block; margin: 0 10px; padding:8px 0; width: 32px; color: #67C23A; float: right;" class="iconfont icon-check icon" title="确定" @click="submitConfigSingle(index)" />
              <a style=" display:block; margin: 0 10px; padding:8px 0; width: 32px; color: red; float: right;" class="iconfont icon-delete icon" title="移除" @click="removeItem(index)" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import * as _ from 'lodash'
import dateFormat from 'dateformat'

export default {
  name: 'ArchivePhaseWidget',
  props: {
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      showConsole: false,
      showConfig: false,
      showAddItem: false,
      newItem: {},
      console: '',
      preparedIndex: null,
      executeEnable: true,
      configBarTable: [],
      nowDate: dateFormat(new Date(), 'yyyymmdd')
    }
  },
  created: function() {
    this.configBarTable = Array(this.configData.data.items.length)
    this.configBarTable = _.fill(this.configBarTable, false)
  },
  destroyed: function() {
  },
  methods: {
    toggleConsole() {
      this.showConsole = !this.showConsole
      this.executeEnable = true
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    prepareArchive(index) {
      const items = this.configData.data.items
      const curItem = items[index]
      let paramStr = 'source=' + curItem.source
      if (curItem.archive_dir_name) {
        paramStr += '&archiveDir=' + curItem.archive_dir_name
      }
      if (curItem.phase_name) {
        paramStr += '&archiveName=' + curItem.phase_name
      }
      axios
        .get('/api/endpoints/archive_phase/prepare?' + paramStr)
        .then(response => {
          this.console = '执行命令:\n'
          this.console += response.data.msg
          this.console += '\n点击"执行"按钮开始同步文件。\n'
        })
      this.preparedIndex = index
      this.showConsole = true
    },
    startArchive() {
      if (this.preparedIndex === null) {
        this.console += '\n未指定同步目标'
        return
      }
      this.executeEnable = false
      const items = this.configData.data.items
      const curItem = items[this.preparedIndex]
      let paramStr = 'source=' + curItem.source
      if (curItem.archive_dir_name) {
        paramStr += '&archiveDir=' + curItem.archive_dir_name
      }
      if (curItem.phase_name) {
        paramStr += '&archiveName=' + curItem.phase_name
      }
      axios
        .get('/api/endpoints/archive_phase/start?' + paramStr)
        .then(response => {
          this.console += response.data.msg
        })
      this.showConsole = true
    },
    toggleConfigSingle(index, stat = null) {
      if (stat != null) {
        this.configBarTable[index] = stat
      }
      this.configBarTable[index] = !this.configBarTable[index]
      this.$forceUpdate()
      console.log(this.configBarTable)
    },
    submitConfigSingle(index) {
      const reqData = { id: this.configData.id, index: index, item: this.configData.data.items[index] }
      axios.post('/api/endpoints/archive_phase/updateItem', reqData)
        .then(response => {
          console.log(response.data)
          var items = response.data.data
          this.refreshItems(items)
        })
      this.configBarTable[index] = false
    },
    toggleAddItem() {
      this.showAddItem = !this.showAddItem
    },
    submitAddItem() {
      const reqData = { id: this.configData.id, item: this.newItem }
      axios.post('/api/endpoints/archive_phase/addNewItem', reqData)
        .then(response => {
          console.log(response.data)
          var items = response.data.data
          this.refreshItems(items)
        })
      this.showAddItem = !this.showAddItem
    },
    refreshItems(items) {
      this.configData.data.items = items
      this.$forceUpdate()
    },
    removeItem(index) {
      const reqData = { id: this.configData.id, index: index }
      axios.post('/api/endpoints/archive_phase/removeItem', reqData)
        .then(response => {
          console.log(response.data)
          var items = response.data.data
          this.refreshItems(items)
        })
      this.configBarTable[index] = false
    },
    updateConfig() {
      this.$bus.emit('update', this.configData)
      this.showConfig = false
    }
  }
}
</script>

<style lang="scss" scoped>
// endpoint
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
  min-width: 400px;
  min-height: 140px;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
}
.widget_content::-webkit-scrollbar {
  width: 1px;
}
.widget_content::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
.widget_content::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 0.5px solid slategrey;
}
// rsync endpoint
.relative {
  position: relative;
}
.raw_base {
  margin: 2px 0px;
  border: solid thin #606060;
  font-size: 14px;
}
.bar_base {
  display: flex;
  padding: 4px 4px;
  align-items:center;
}
.text_overflow {
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.bar_config {
  display: flex;
  padding: 10px 8px;
}
.config_row {
  display: flex;
  align-items: center;
  padding: 2px 2px;
}
.float_console {
  top: 0;
  left: 0;
  right: 0;
  bottom: 20px;
  position: absolute;
  background-color: rgb(0,0,0);
  z-index: 2;
}

.console_top {
  background-color: #222;
  color: #fff;
  top: 0;
  height: 20px;
}
.console_body {
  height: 100%;
  overflow: auto;
  overflow-wrap: break-word;
  color: white;
}
.console_area {
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  overflow-y: auto;
  appearance: none;
  text-align: inherit;
  font-size: 10px;
  color: white;
  background-color: rgb(0,0,0);
  top: 20px;
  bottom: 20px;
  position: absolute;
}
.exec_enabled {
  color: #67C23A;
}
.exec_disabled {
  pointer-events:none;
  color: #ccc;
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
  font-size: 14px;
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
  padding: 8px 4px;
}
.config_left {
  width:80px;
  text-align: right;
  margin: 0 2px;
}
</style>
