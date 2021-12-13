<template>
  <div class="widget_box">
    <div class=" widget_header">
      <img style="height:20px; " src="./img/rsync.jpg">
      <span style="padding: 0 10px;">{{ configData.name }}</span>
      <span style="flex-grow: 1;" />
      <a style="margin: 0 4px;" class="iconfont icon-plus icon" title="新增" @click="toggleAddItem()" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
      <div v-show="showAddItem" class="float_config tbgcolor_config tcolor_main">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <a style="padding:0 4px; " @click="toggleAddItem()"> x </a>
        </div>
        <div style="flex-grow: 1;" class="config_body tbgcolor_config">
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
          <div class="config_row">
            <div style="width:80px; height: 32px; text-align: right; margin: 0 4px;"></div>
            <div style="flex-grow: 1;">
              <button @click="submitAddItem()">确定</button>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showConsole" class="float_console">
        <div class="console_top">
          <span style="float:left;">控制台</span>
          <a style="float:right; padding:0 4px; color: white;" @click="toggleConsole()"> x </a>
          <a style="float:right; padding:0 8px;" :class="[executeEnable?'tcolor_active':'tcolor_disable', 'iconfont icon-paper-plane icon']" title="执行" @click="startArchive()" />
        </div>
        <div class="console_body">
          <textarea v-model="console" class="console_area" />
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <a style="padding:0 4px; " @click="toggleConfig()" class="tcolor_reverse"> x </a>
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
        <div v-for="(item,index) in configData.data.items" :key="'archive_item_'+ index" class="row_base">
          <div class="bar_base">
            <div class="item_info">
              <span style="padding: 0 4px;" class="tcolor_main">{{ item.name }}</span>
              <span class="tcolor_sub" style="font-size:12px; width: 120px;">{{ item.source }}</span>
              <span style="padding: 0 4px;" class="tcolor_sub"> >> </span>
              <span class="tcolor_sub" style=" font-size:12px; width: 160px;">
                {{ item.archive_dir_name+ "/" +[item.phase_name?item.phase_name:nowDate] }}
              </span>
            </div>
            <a style="margin: 0 4px;flex-shrink: 0;" class="iconfont icon-cog icon" title="设置" @click="toggleConfigSingle(index)" />
            <!-- <a style="margin: 0 6px; width: 32px;" @click="prepareArchive(index)">启动</a> -->
            <a style="margin: 0 4px;flex-shrink: 0;" class="iconfont icon-sync-alt icon" title="启动" @click="prepareArchive(index)" />
          </div>
          <div v-show="configBarTable[index]" class="bar_config tcolor_main animate__animated animate__fadeIn">
            <div style="flex-grow: 1;">
              <div class="config_row">
                <div class="config_left">名称：</div>
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
              <a style=" display:block; margin: 0 10px; padding:8px 0; width: 32px; float: right;" class="iconfont icon-check icon tcolor_active" title="确定" @click="submitConfigSingle(index)" />
              <a style=" display:block; margin: 0 10px; padding:8px 0; width: 32px; float: right;" class="iconfont icon-delete icon tcolor_error" title="移除" @click="removeItem(index)" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'
import dateFormat from 'dateformat'

export default {
  name: 'ArchivePhaseWidget',
  props: {
    tabIndex: {type: Number,default: 0},
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
      this.$axios
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
      this.$axios
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
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, index: index, item: this.configData.data.items[index] }
      this.$axios.post('/api/endpoints/archive_phase/updateItem', reqData)
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
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, item: this.newItem }
      this.$axios.post('/api/endpoints/archive_phase/addNewItem', reqData)
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
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, index: index }
      this.$axios.post('/api/endpoints/archive_phase/removeItem', reqData)
        .then(response => {
          console.log(response.data)
          var items = response.data.data
          this.refreshItems(items)
        })
      this.configBarTable[index] = false
    },
    updateConfig() {
      this.$bus.emit('update', {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    }
  }
}
</script>

<style lang="scss" scoped>

.row_base {
  margin: 2px;
  border: 1px solid transparent;
  border-color: #e5e6e7;
  border-radius: 4px;
}
.bar_base {
  display: flex;
  padding: 4px 4px;
  align-items:center;
  overflow: hidden;
}
.item_info {
  flex-grow: 1;
  flex-shrink: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.float_console {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0px;
  position: absolute;
  background-color: rgb(0,0,0);
  z-index: 2;
  display: flex;
  flex-direction: column;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0px;
  position: absolute;
  outline: none;
  border: none;
  overflow-y: auto;
  appearance: none;
  text-align: inherit;
  font-size: 10px;
  color: white;
  background-color: rgb(0,0,0);
  top: 20px;
  position: absolute;
}
.exec_enabled {
  color: #67C23A;
}
.exec_disabled {
  pointer-events:none;
  color: #ccc;
}

.config_left {
  width:80px;
  text-align: right;
  margin: 0 2px;
}
</style>
