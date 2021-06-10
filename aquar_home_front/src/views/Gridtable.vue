<template>
  <div class="grid_container">
    <div class="dashboard_header">
      <div class="logo">
        <img style="height: 20px;" :src="logo_aquar">
        <span style="margin: 4px;">Aquar</span>
      </div>
      <div style="flex-grow: 1" />
      <!-- TODO 多tab页 -->
      <a v-if="!editing" style="margin: 0 4px;" class="iconfont icon-gallery-view icon" title="设置布局" @click="editing=true" />
      <a v-else style="margin: 0 4px;" class="iconfont icon-check icon" title="确定布局" @click="comfirmLayout()" />
      <a style="margin: 0 4px;" class="iconfont icon-plus icon" title="添加组件" @click="toggleAddWidget()" />
    </div>
    <grid-layout
      :layout.sync="layout"
      :col-num="12"
      :col-width="20"
      :row-height="60"
      :is-draggable="editing"
      :is-resizable="editing"
      :vertical-compact="false"
      :use-css-transforms="true"
      :margin="[4, 4]"
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
      >
        <div v-show="editing" class="vue-draggable-handle">
          <span style="font-size: 14px; color: white; margin: 4px 10px; flex-grow: 1;">点此拖动</span>
          <a style="font-size: 10px; color: red; margin: 4px;" class="iconfont icon-delete icon" @click="removeWidget(widget.id)" />
          <!-- TODO 二次确认 -->
        </div>
        <div v-if="widget.widget === 'SyncthingWidget'">
          <syncthing-widget :config-data="widget" class="no-drag absolute" />
        </div>
        <div v-if="widget.widget === 'ArchivePhaseWidget'">
          <archive-phase-widget :config-data="widget" class="no-drag absolute" />
        </div>
        <div v-if="widget.widget === 'NextCloudWidget'">
          <next-cloud-widget :config-data="widget" class="no-drag absolute" />
        </div>
        <div v-if="widget.widget === 'IconWidget'">
          <icon-widget :config-data="widget" class="no-drag absolute" />
        </div>
        <div v-if="widget.widget === 'TrueNasWidget'">
          <true-nas-widget :config-data="widget" class="no-drag absolute" />
        </div>
        <div v-if="widget.widget === 'PveWidget'">
          <pve-widget :config-data="widget" class="no-drag absolute" />
        </div>
      </grid-item>
    </grid-layout>
    <div v-show="showAddPanel" class="add_layer">
      <div class="add_panel">
        <add-widget />
      </div>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import { mapGetters } from 'vuex'
import axios from 'axios'
import * as _ from 'lodash'
import logo_aquar from '../assets/app_images/aquar.png'
import SyncthingWidget from '../components/widgets/Syncthing'
import ArchivePhaseWidget from '../components/widgets/ArchivePhase'
import NextCloudWidget from '../components/widgets/NextCloud'
import IconWidget from '../components/widgets/Icon'
import TrueNasWidget from '../components/widgets/TrueNas'
import PveWidget from '../components/widgets/Pve'
import AddWidget from '../components/AddWidget.vue' 
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
    AddWidget
  },
  data() {
    return {
      logo_aquar,
      layout: [],
      editing: false,
      index: 0,
      eventLog: [],
      widgets: [],
      showAddPanel: false
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
    this.$bus.on('closeAddPanel', this.toggleAddWidget)
    this.$bus.on('addWidget', this.addWidget)
  },
  mounted: function() {
    axios
      .get('/api/list')
      .then(response => {
        this.widgets = response.data
        this.layout = []
        for (var i = 0; i < this.widgets.length; i++) {
          this.layout.push(Object.assign(this.widgets[i].layout, { i: this.widgets[i].id }))
        }
      })
  },
  beforeDestroy() {
    this.$bus.off('update', this.updateConfig)
    this.$bus.off('closeAddPanel', this.toggleAddWidget)
    this.$bus.off('addWidget', this.addWidget)
  },
  methods: {
    moveEvent: function(i, newX, newY) {
      const msg = 'MOVE i=' + i + ', X=' + newX + ', Y=' + newY
      this.eventLog.push(msg)
      console.log(msg)
    },
    movedEvent: function(i, newX, newY) {
      const msg = 'MOVED i=' + i + ', X=' + newX + ', Y=' + newY
      this.eventLog.push(msg)
      console.log(msg)
    },
    resizeEvent: function(i, newH, newW, newHPx, newWPx) {
      const msg = 'RESIZE i=' + i + ', H=' + newH + ', W=' + newW + ', H(px)=' + newHPx + ', W(px)=' + newWPx
      this.eventLog.push(msg)
      console.log(msg)
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
    refreshWidgets() {
      axios
        .get('/api/list')
        .then(response => {
          this.widgets = response.data
          this.layout = []
          for (var i = 0; i < this.widgets.length; i++) {
            this.layout.push(Object.assign(this.widgets[i].layout, { i: this.widgets[i].id }))
          }
        })
    },
    updateConfig: function(newData) {
      console.log(newData)
      axios.post('/api/updateById', newData)
        .then(response => {
          console.log(response.data)
          this.refreshWidgets()
        })
    },
    comfirmLayout() {
      for (var i = 0; i < this.layout.length; i++) {
        var curWidget = _.find(this.widgets, { 'id': this.layout[i].i })
        curWidget.layout = this.layout[i]
        axios.post('/api/updateById', curWidget)
      }
      this.editing = false
      this.refreshWidgets()
    },
    toggleAddWidget() {
      this.showAddPanel = !this.showAddPanel
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
      widget.layout.y = y + h + 1
      axios.post('/api/addWidget', widget)
        .then(() => {
          this.refreshWidgets()
        })
    },
    removeWidget(id) {
      axios.post('/api/removeWidget', { id: id })
        .then(() => {
          this.refreshWidgets()
        })
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
  padding: 0px;
  background-color: rgba(44, 44, 44, 1);
  color: white;
}
.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.grid_container {
  margin: 0;
  padding: 0;
  position: relative;
}
.add_layer {
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
}
.add_panel {
  width: 600px;
  height: 500px;
}
.vue-grid-layout {
  margin: 0;
  /* background: #eee; */
}
.vue-grid-item {
  margin: 0;
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
  background-color: rgba(255,255,255,0.4);
  box-sizing: border-box;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-style: dotted;
  border-top-style: none;
  border-width: 0.5px;
  border-color: white;
  cursor: pointer;
  z-index: 4;
}
.layoutJSON {
  background: #ddd;
  border: 1px solid white;
  margin-top: 10px;
  padding: 10px;
}
.eventsJSON {
  background: #ddd;
  border: 1px solid white;
  margin-top: 10px;
  padding: 10px;
  height: 100px;
  overflow-y: scroll;
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
</style>
