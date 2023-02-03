<template>
  <div class="grid_container">
    <div class="dashboard_header tbgcolor_head">
      <div class="logo">
        <img style="height: 20px;" :src="logo_aquar">
      </div>
      <div style="flex-grow: 1">
        <v-tabs :value="curTabIndex">
          <v-tabs-slider ></v-tabs-slider>
          <v-tab v-for="(tab,index) in tabs" :disabled="editing"  :key="'tab_'+index" @click="toTab(index)">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </div>
      <!-- <a style="margin: 0 4px; padding: 0 4px; border-right: solid thin #ccc;" class="iconfont icon-question-circle icon tcolor_disable" title="帮助" target="_blank" href="https://gitee.com/firemaker/aquar-home-helper" />
      <a v-if="!editing && curViewSize==='lg'" style="margin: 0 4px;" class="iconfont icon-gallery-view icon tcolor_reserve" title="设置布局" @click="editing=true" />
      <a v-else-if="editing" style="margin: 0 4px;" class="iconfont icon-check icon tcolor_reserve" title="确定布局" @click="confirmLayout()" />
      <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon tcolor_reserve" title="设置" @click="toggleConfigPanel()" /> -->
      <div>
        <v-btn icon small target="_blank" href="https://github.com/firemakergk/aquar-home-helper" title="帮助">
        <v-icon class="tcolor_sub" style="font-size:20px;" >mdi-help-circle-outline</v-icon>
        </v-btn>
        <v-divider class="mx-1" vertical></v-divider>
        <v-btn v-if="!editing && curViewSize==='lg'" icon small  @click="editing=true" title="设置布局">
          <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-view-dashboard</v-icon>
        </v-btn>
        <v-btn v-else-if="editing" icon small @click="confirmLayout()" title="确定布局">
          <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-check-bold</v-icon>
        </v-btn>
        <v-btn icon small @click="toggleConfigPanel()" title="设置">
          <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
        </v-btn>
      </div>
    </div>
    <grid-layout
      :layout.sync="layout"
      :responsive="!editing"
      :col-num="12"
      :col-width="20"
      :row-height="60"
      :is-draggable="editing"
      :is-resizable="editing"
      :vertical-compact="false"
      :use-css-transforms="false"
      :margin="[6, 6]"
      @breakpoint-changed="breakpointChangedEvent"
    >
      <grid-item
        v-for="widget in widgets"
        :key="widget.id"
        :x="widget.layout.x"
        :y="widget.layout.y"
        :w="widget.layout.w"
        :h="widget.layout.h"
        :i="widget.id"
        drag-allow-from=".vue-draggable-handle"
        drag-ignore-from=".no-drag"
        class="relative"
        @move="moveEvent"
        @resize="resizeEvent"
      >
        <div v-show="editing" class="vue-draggable-handle tbgcolor_mask_error">
          <span style="font-size: 14px; margin: 1px 0px; flex-grow: 1;" class="tcolor_reverse">点此拖动</span>
          <a @click="preMoveWidget(widget.id)" ><v-icon class="tcolor_reverse" style="font-size: 14px;  margin: 2px;">mdi-arrow-right-top-bold</v-icon></a>
          <a @click="removeWidget(widget.id)" ><v-icon class="tcolor_reverse" style="font-size: 14px;  margin: 2px;">mdi-delete</v-icon></a>
          <!-- TODO 二次确认 -->
        </div>
        <keep-alive>
          <component v-if="show" v-bind:is="widget.widget" :tab-index="curTabIndex" :config-data="widget" class="no-drag" style="position: relative;"></component>
        </keep-alive>
      </grid-item>
    </grid-layout>
    <v-dialog eager v-model="showConfigPanel" width="800px">
        <config />
    </v-dialog>
    <v-dialog eager v-model="showWidgetConfig" width="800px">
      <widget-config />
    </v-dialog>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import { mapGetters } from 'vuex'
import * as _ from 'lodash'
import Push from 'push.js'
import logo_aquar from '../assets/app_images/aquar.png'
import SyncthingWidget from '../components/widgets/Syncthing'
import ArchivePhaseWidget from '../components/widgets/ArchivePhase'
import NextCloudWidget from '../components/widgets/NextCloud'
import IconWidget from '../components/widgets/Icon'
import TrueNasWidget from '../components/widgets/TrueNas'
import PveWidget from '../components/widgets/Pve'
import DockerWidget from '../components/widgets/Docker'
import SearchWidget from '../components/widgets/Search'
import TransmissionWidget from '../components/widgets/Transmission'
import ChatRoomWidget from '../components/widgets/ChatRoom'
import Config from '../components/config/Config.vue' 
import WidgetConfig from '../components/WidgetConfig.vue' 

export default {
  name: 'GridTable',
  components: {
    GridLayout,
    GridItem,
    SyncthingWidget,
    ArchivePhaseWidget,
    NextCloudWidget,
    IconWidget,
    TrueNasWidget,
    PveWidget,
    DockerWidget,
    SearchWidget,
    TransmissionWidget,
    ChatRoomWidget,
    Config,
    WidgetConfig
  },
  data() {
    return {
      logo_aquar,
      soundDeleng : new Audio(require('../assets/sounds/deleng.wav')),
      soundBor : new Audio(require('../assets/sounds/bor.ogg')),
      soundDongDeng : new Audio(require('../assets/sounds/dongdeng.wav')),
      lgLayout: [],
      layout: [],
      curViewSize: "lg",
      editing: false,
      curTabIndex: 0,
      eventLog: [],
      tabs: [],
      widgets: [],
      show: true,
      showConfigPanel: false,
      showWidgetConfig: false
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  watch: {
    eventLog: function() {
      const eventsDiv = this.$refs.eventsDiv
      eventsDiv.scrollTop = eventsDiv.scrollHeight
    }
  },
  created: function() {
    this.$bus.on('update', this.updateConfig)
    this.$bus.on('closeConfigPanel', this.toggleConfigPanel)
    this.$bus.on('showWidgetConfig', this.openWidgetConfig)
    this.$bus.on('closeWidgetConfig', this.closeWidgetConfig)
    this.$bus.on('addWidget', this.addWidget)
    this.$bus.on('addWidgetBatch', this.addWidgetBatch)
    this.$bus.on('refresh', this.refreshWidgets)
    this.$bus.on('notify', this.notify)
  },
  mounted: function() {
    this.updateCurViewSize()
    this.$axios
      .get('/api/allData')
      .then(response => {
        this.data = response.data
        var localTabIndex = localStorage.getItem("curTabIndex")
        this.curTabIndex = localTabIndex ? parseInt(localTabIndex) : 0
        this.tabs = this.data.tabs
        if(this.curTabIndex >= this.tabs.length){
          this.curTabIndex = 0
        }
        if(this.tabs && this.tabs.length > 0){
          this.widgets = _.cloneDeep(this.tabs[this.curTabIndex].widgets)
        }else {
          this.widgets = []
        }
        this.layout = []
        for (var i = 0; i < this.widgets.length; i++) {
          this.layout.push(Object.assign(this.widgets[i].layout, { i: this.widgets[i].id }))
        }
        this.lgLayout = this.layout
        this.responseLayout(this.curViewSize)
      })
  },
  beforeDestroy() {
    this.$bus.off('update', this.updateConfig)
    this.$bus.off('closeConfigPanel', this.toggleConfigPanel)
    this.$bus.off('showWidgetConfig', this.openWidgetConfig)
    this.$bus.off('closeWidgetConfig', this.closeWidgetConfig)
    this.$bus.off('addWidget', this.addWidget)
    this.$bus.off('addWidgetBatch', this.addWidgetBatch)
    this.$bus.off('refresh', this.refreshWidgets)
    this.$bus.off('notify', this.notify)
  },
  methods: {
    moveEvent: function(i, newX, newY) {
      var widget = _.find(this.widgets, { 'id': i }) 
      widget.layout.x = newX
      widget.layout.y = newY
    },
    movedEvent: function(i, newX, newY) {
      const msg = 'MOVED i=' + i + ', X=' + newX + ', Y=' + newY
      this.eventLog.push(msg)
      console.log(msg)
      
    },
    resizeEvent: function(i, newH, newW, newHPx, newWPx) {
      var widget = _.find(this.widgets, { 'id': i }) 
      widget.layout.h = newH
      widget.layout.w = newW
      this.$bus.emit('reload_'+widget.id,{tabIndex:this.curTabIndex,configData:widget}) 
    },
    resizedEvent: function(i, newX, newY, newHPx, newWPx) {
      const msg = 'RESIZED i=' + i + ', X=' + newX + ', Y=' + newY + ', H(px)=' + newHPx + ', W(px)=' + newWPx
      this.eventLog.push(msg)
      console.log(msg)
    },
    containerResizedEvent: function(i, newH, newW, newHPx, newWPx) {
      const msg = 'CONTAINER RESIZED i=' + i + ', H=' + newH + ', W=' + newW + ', H(px)=' + newHPx + ', W(px)=' + newWPx
      this.eventLog.push(msg)
      console.log(msg)
    },
    layoutCreatedEvent: function(newLayout) {
      this.eventLog.push('Created layout')
      console.log('Created layout: ', newLayout)
    },
    layoutBeforeMountEvent: function(newLayout) {
      this.eventLog.push('beforeMount layout')
      console.log('beforeMount layout: ', newLayout)
    },
    layoutMountedEvent: function(newLayout) {
      this.eventLog.push('Mounted layout')
      console.log('Mounted layout: ', newLayout)
    },
    layoutReadyEvent: function(newLayout) {
      this.eventLog.push('Ready layout')
      console.log('Ready layout: ', newLayout)
    },
    layoutUpdatedEvent: function(newLayout) {
      this.eventLog.push('Updated layout')
      console.log('Updated layout: ', newLayout)
    },
    breakpointChangedEvent: function(newBreakpoint, newLayout){
      console.log("BREAKPOINT CHANGED breakpoint=", newBreakpoint, ", layout: ", newLayout );
      this.responseLayout(newBreakpoint)
      this.$forceUpdate()
    },
    updateCurViewSize(){
      const viewMap = [
      {name:"xxs",minSize: 0},
      {name:"xs",minSize: 480},
      {name:"sm",minSize: 768},
      {name:"md",minSize: 996},
      {name:"lg",minSize: 1200}]
      var viewWidth = document.body.clientWidth
      for(var i in viewMap){
        if(viewWidth >= viewMap[i].minSize){
          this.curViewSize = viewMap[i].name
        }
      }
    },
    refreshWidgets(curTabIndex) {
      this.$axios
      .get('/api/allData')
      .then(response => {
        this.data = response.data
        if(curTabIndex!=null && curTabIndex!=undefined){
          this.curTabIndex = curTabIndex
        }else{
          var localTabIndex = localStorage.getItem("curTabIndex")
          this.curTabIndex = localTabIndex ? parseInt(localTabIndex) : 0
        }
        if(this.curTabIndex >= this.data.tabs.length ){
          this.curTabIndex = this.data.tabs.length -1
          localStorage.setItem("curTabIndex",this.curTabIndex)
        }
        this.tabs = this.data.tabs
        this.widgets = _.cloneDeep(this.tabs[this.curTabIndex].widgets)
        this.layout = []
        for (var i = 0; i < this.widgets.length; i++) {
          this.layout.push(Object.assign(this.widgets[i].layout, { i: this.widgets[i].id }))
          this.$bus.emit('reload_'+this.widgets[i].id,{tabIndex:this.curTabIndex,configData:this.widgets[i]})
        }
        this.lgLayout = this.layout
        this.updateCurViewSize()
        this.responseLayout(this.curViewSize)
      })
    },
    updateConfig: function(newData) {
      console.log(newData)
      this.$axios.post('/api/updateById', newData)
        .then(response => {
          console.log(response.data)
          this.refreshWidgets(this.curTabIndex)
        })
    },
    async confirmLayout() {
      let widgets = []
      for (let i = 0; i < this.layout.length; i++) {
        let curWidget = _.find(this.widgets, { 'id': this.layout[i].i })
        curWidget.layout = this.layout[i]
        widgets.push({tabIndex: this.curTabIndex, widget:curWidget})
      }
      await this.$axios.post('/api/updateWidgets', widgets)
      this.editing = false
      this.refreshWidgets(this.curTabIndex)
    },
    responseLayout(newBreakpoint) {
      if(!this.layout || this.layout.length===0){
        return
      }
      var resLayout = []
      var colCount = 12
      if(newBreakpoint === "lg"){
        this.refreshGrid(this.lgLayout)
        return
      }
      if(newBreakpoint === "md"){
        this.editing = false
        colCount = 10
      }
      if(newBreakpoint === "sm"){
        this.editing = false
        colCount = 6 
      }
      if(newBreakpoint === "xs"){
        this.editing = false
        colCount = 4
      }
      if(newBreakpoint === "xxs"){
        this.editing = false
        colCount = 2
      }
      var curY = 0
      var nextY = 0
      var yList = _.uniq(_.sortBy(_.map(this.lgLayout,"y")))
      for(var i in yList){
        var y = yList[i]
        var itemList = _.sortBy(_.filter(this.lgLayout,{"y":parseInt(y)}),['x'])
        curY = nextY
        var curW = 0
        for(var j in itemList){
          var it = itemList[j]
          var item = _.cloneDeep(it)
          if(curW + item.w > colCount){
            item.x = 0
            item.y = nextY
            curY = nextY
            nextY = curY + item.h
            curW = item.w
          }else {
            item.y = curY
            item.x = curW
            curW = curW + item.w
            if(curY + item.h > nextY){
              nextY = curY + item.h
            } 
          }
          resLayout.push(item)
        }
      }
      this.refreshGrid(resLayout)
    },
    refreshGrid(layout){
      if(layout){
        this.layout = layout
      }
      for (var i = 0; i < this.layout.length; i++) {
        var curWidget = _.find(this.widgets, { 'id': this.layout[i].i })
        curWidget.layout = this.layout[i]
      }
    },
    toggleConfigPanel() {
      this.showConfigPanel = !this.showConfigPanel
    },
    closeWidgetConfig() {
      this.showWidgetConfig = false
    },
    openWidgetConfig() {
      this.showWidgetConfig = true
    },
    addWidget(widget) {
      var y = 0
      var h = 0
      for (var i = 0; i < this.layout.length; i++) {
        var l = this.layout[i]
        if (l.y > y) {
          y = l.y
          h = l.h
        }
      }
      widget.layout.x = 0
      widget.layout.y = y + h
      this.$axios.post('/api/addWidget', {tabIndex: this.curTabIndex,widget: widget})
        .then(() => {
          this.refreshWidgets(this.curTabIndex)
        })
    },
    addWidgetBatch(widgets) {
      var y = 0
      var h = 0
      for (var i = 0; i < this.layout.length; i++) {
        var l = this.layout[i]
        if (l.y === y) {
          y = l.y
          if(l.h > h){
            h = l.h
          }
        }else if(l.y > y) {
          y = l.y
          h = l.h
        }
      }
      y = y + h
      var nextX = 0
      for(var j=0;j<widgets.length;j++){
        widgets[j].layout.x = nextX
        widgets[j].layout.y = y
        nextX = nextX + widgets[j].layout.w
        if(nextX > 12){
          y += 1
        }
      }
      this.$axios.post('/api/addWidgetBatch', {tabIndex: this.curTabIndex,widgets: widgets})
        .then(() => {
          this.$bus.emit('iconBatchDone', null)
          this.refreshWidgets(this.curTabIndex)
        })
    },
    removeWidget(id) {
      if(!confirm('确认删除该组件？')){
        return
      }
      this.$axios.post('/api/removeWidget', {tabIndex: this.curTabIndex, id: id })
        .then(() => {
          this.refreshWidgets(this.curTabIndex)
        })
    },
     preMoveWidget(id) {
      let tmpWidgets = _.filter(this.widgets, {'id':id})
      if(!tmpWidgets){
        alert("未找到要移动的组件")
        return
      }
      let targetWidget = tmpWidgets[0]
      this.$bus.emit('configWidget',  {'widgetType':'WidgetMove','widgetName':"",'tabIndex':this.curTabIndex,'configData':targetWidget})
    },
    toTab(index) {
      if(this.editing){
        return
      }
      if(index<0 || index >= this.tabs.length){
        return
      }
      this.curTabIndex = index
      localStorage.setItem('curTabIndex',this.curTabIndex)
      this.widgets = _.cloneDeep(this.tabs[index].widgets)
      this.layout = []
      for (var i = 0; i < this.widgets.length; i++) {
        this.layout.push(Object.assign(this.widgets[i].layout, { i: this.widgets[i].id }))
      }
      this.lgLayout = this.layout
      this.updateCurViewSize()
      this.responseLayout(this.curViewSize)
      // this.$forceUpdate()
    },
    notify(data){
      console.log('notify called')
      let {title, body, sound, timeout} = data
      if(sound === 'dongdeng'){
        this.soundDongDeng.play()
      }else if(sound === 'deleng'){
        this.soundDeleng.play()
      }else if(sound === 'bor'){
        this.soundBor.play()
      }
      Push.create(title, {
        body: body,
        icon: this.logo_aquar,
        timeout: timeout
      });
    }
  }
}
</script>

<style scoped>
.dashboard_header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin-bottom: 4px;
  box-shadow: 0px 2px 2px 2px rgba(0, 0, 0, .3);
}
/* .page_tabs {
  padding: 0 20px;
  height: 28px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}
.page_tab {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-top: 0.5px solid rgb(100,100,100);
  border-left: 0.5px solid rgb(100,100,100);
  font-size: 14px;
  height: 24px;
  padding: 0 6px;
}
.add_tab {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-left: 0.5px solid rgb(100,100,100);
  border-top: 0.5px solid rgb(100,100,100);
  border-right: 0.5px solid rgb(100,100,100);
  font-size: 18px;
  height: 24px;
  padding: 0 6px;
} */

.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 40px;
}
.grid_container {
  margin: 0;
  padding: 0;
  position: relative;
}
.config_layer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  background-color: rgba(255,255,255,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index:10;
}
.config_panel {
  width: 600px;
  height: 500px;
}
.vue-grid-layout {
  margin: 0;
  /* background: #eee; */
}
.vue-grid-item {
  margin: 0;
  transition: all .1s ease !important;
}
/* .vue-grid-item:not(.vue-grid-placeholder) {
  background: #ccc;
  border: 1px solid white;
} */
.vue-grid-item .resizing {
  opacity: 0.9;
}
/* .vue-grid-item .static {
  background: #cce;
} */
.vue-grid-item .text {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}
.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}
.vue-grid-item .minMax {
  font-size: 12px
}
.vue-grid-item .add {
  cursor: pointer;
}
.vue-draggable-handle {
  position: absolute;
  display: flex;
  width: 100px;
  height: 20px;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0;
  background-origin: content-box;
  box-sizing: border-box;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-style: dotted;
  border-top-style: none;
  border-width: 0.5px;
  cursor: pointer;
  z-index: 3;
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
</style>
