<template>
  <div class="widget_box">
    <div class=" widget_header">
      <!-- <img style="height:20px; " src="./img/rsync.jpg"> -->
      <span  style="height:20px; display: flex; align-items: center;" >
        <v-icon style="font-size: 18px;  margin: 2px;">mdi-folder-sync</v-icon>
      </span>
      <span style="padding: 0 10px;" >{{ configData.name }}</span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-plus icon" title="新增" @click="toggleAddItem()" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="toggleConfig()" title="新增">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-plus</v-icon>
      </v-btn>
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
    </div>
    <div class="widget_body">
      <div v-show="showAddItem" class="float_config tcolor_main">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <!-- <a style="padding:0 4px; " @click="toggleAddItem()"> x </a> -->
          <v-icon class="tcolor_sub_head" @click="toggleAddItem()" >mdi-close</v-icon>
        </div>
        <div style="flex-grow: 1;" class="config_body">
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
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                </template>
                <span>
                  留空代表输出路径文件夹完全备份归档源文件夹。<br/>
                  若填写归档名称，则会在输出路径下新建相应的子文件夹，并同步归档源中存在而输出路径下不存在的所有文件。<br/>
                  归档名称支持日期表达式，例如：<br/>
                  "${yyyy-mm-dd_HH:MM:ss}归档"会被解析为"2022-08-24_14:45:32归档"<br/>
                  "yyyy${yyyymmdd}归档"会被解析为"yyyy20220824归档"
                </span>
              </v-tooltip>
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; margin: 0 4px;">定时表达式：</div>
            <div style="flex-grow: 1;">
              <input v-model="newItem.cron" type="text" placeholder='cron表达式,如:"0 0 3 * * *"表示每日3点0分0秒触发' style="display: inline-block; width: 100%;">
            </div>
            <div>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                </template>
                <span>
                  cron表达式从左至右的含义如下：<br/>
                  秒: 0-59<br/>
                  分: 0-59<br/>
                  小时: 0-23<br/>
                  日期号: 1-31<br/>
                  月份号: 0-11<br/>
                  星期号: 0-6<br/>
                  -------------------<br/>
                  举例：<br/>
                  每分钟0秒执行：0 * * * * *<br/>
                  每十分钟执行：0 */10 * * * *<br/>
                  每日3点整执行：0 0 3 * * *<br/>
                  每天9点至17点间每30分钟执行：0 */30 9-17 * * *<br/>
                  周一至周五每天11点30分0秒执行：00 30 11 * * 1-5<br/>
                </span>
              </v-tooltip>
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
          <div style="flex-grow: 1;">
            <span class="mx-2">执行控制台</span>
          </div>
          <div style="display: flex;">
            <v-icon :class="[executeEnable?'tcolor_active':'tcolor_disable', 'mx-2']" title="执行" style="font-size:20px; " @click="startArchive()" >mdi-rocket-launch</v-icon>
            <v-icon class="tcolor_sub_head" @click="toggleConsole()" >mdi-close</v-icon>
            <!-- <a class="tcolor_reverse" style="float:right; padding:0 4px;" @click="toggleConsole()"> x </a> -->
          </div>
        </div>
        <div class="console_body">
          <textarea v-model="console" class="console_area" />
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <v-icon class="tcolor_sub_head" @click="toggleConfig()" >mdi-close</v-icon>
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
              <span class="tcolor_sub" style=" font-size:12px; width: 160px;">
                上次同步时间：{{ item.lastSyncTime? item.lastSyncTime:"---" }}
              </span>
              <!-- <span class="tcolor_sub" style="font-size:12px; width: 120px;">{{ item.source }}</span>
              <span style="padding: 0 4px;" class="tcolor_sub"> >> </span>
              <span class="tcolor_sub" style=" font-size:12px; width: 160px;">
                {{ item.archive_dir_name+ "/" +[item.phase_name?item.phase_name:nowDate] }}
              </span> -->
            </div>
            <a style="margin: 0 4px;flex-shrink: 0;" class="iconfont icon-cog icon" title="设置" @click="toggleConfigSingle(index)" />
            <!-- <a style="margin: 0 6px; width: 32px;" @click="prepareArchive(index)">启动</a> -->
            <a style="margin: 0 4px;flex-shrink: 0;" class="iconfont icon-sync-alt icon" title="启动" @click="prepareArchive(index)" />
          </div>
          <div v-show="configBarTable[index]" class="bar_config tcolor_main animate__animated animate__fadeIn">
            <div style="">
              <div class="config_row">
                <div class="config_left">名称<span style="color:red;">*</span>：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">归档源<span style="color:red;">*</span>：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.source" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">输出路径<span style="color:red;">*</span>：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.archive_dir_name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">归档名称：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.phase_name" type="text" name="name" style="display: inline-block; width: 100%;">
                </div>
                <div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                    </template>
                    <span>
                      留空代表输出路径文件夹完全备份归档源文件夹。<br/>
                      若填写归档名称，则会在输出路径下新建相应的子文件夹，并同步归档源中存在而输出路径下不存在的所有文件。<br/>
                      归档名称支持日期表达式，例如：<br/>
                      "${yyyy-mm-dd_HH:MM:ss}归档"会被解析为"2022-08-24_14:45:32归档"<br/>
                      "yyyy${yyyymmdd}归档"会被解析为"yyyy20220824归档"
                    </span>
                  </v-tooltip>
                </div>
              </div>
              <div class="config_row">
                <div class="config_left">定时表达式：</div>
                <div style="flex-grow: 1;">
                  <input v-model="item.cron" type="text" name="name" placeholder='cron表达式,如:"0 0 3 * * *"表示每日3点0分0秒触发' style="display: inline-block; width: 100%;">
                </div>
                <div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
                    </template>
                    <span>
                      cron表达式从左至右的含义如下：<br/>
                      秒: 0-59<br/>
                      分: 0-59<br/>
                      小时: 0-23<br/>
                      日期号: 1-31<br/>
                      月份号: 0-11<br/>
                      星期号: 0-6<br/>
                      -------------------<br/>
                      举例：<br/>
                      每分钟0秒执行：0 * * * * *<br/>
                      每十分钟执行：0 */10 * * * *<br/>
                      每日3点整执行：0 0 3 * * *<br/>
                      每天9点至17点间每30分钟执行：0 */30 9-17 * * *<br/>
                      周一至周五每天11点30分0秒执行：00 30 11 * * 1-5<br/>
                    </span>
                  </v-tooltip>
                </div>
              </div>
            </div>
            <div style="display: flex; justify-content: end;">
              <v-btn small outlined color="primary" @click="submitConfigSingle(item.id)" style="margin:0 2px; " title="更新" ><v-icon left>mdi-check-bold</v-icon>更新</v-btn>
              <v-btn small outlined @click="removeItem(item.id)" style="margin:0 2px; " title="删除" ><v-icon left>mdi-delete</v-icon>删除</v-btn>
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
      let paramStr = `tabIndex=${this.tabIndex}&id=${this.configData.id}&itemId=${curItem.id}`
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
    submitConfigSingle(itemId) {
      let item = _.find(this.configData.data.items, it => {return it.id === itemId})
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, item: item }
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
    removeItem(itemId) {
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, itemId: itemId }
      this.$axios.post('/api/endpoints/archive_phase/removeItem', reqData)
        .then(response => {
          console.log(response.data)
          if(!response.data || response.data.code != 0){
            return
          }
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
  flex-direction: column;
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
  display: flex;
  align-items: center;
  background-color: #222;
  color: #fff;
  top: 0;
  height: 24px;
}
.console_body {
  height: 100%;
  overflow: auto;
  overflow-wrap: break-word;
}
.console_area {
  width: 100%;
  top: 24px;
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
  color: #fff;
  background-color: #263238;
  padding: 8px;
}
.exec_enabled {
  color: #67C23A;
}
.exec_disabled {
  pointer-events:none;
  color: #ccc;
}

.config_left {
  width:100px;
  text-align: right;
  margin: 0 2px;
}
</style>
