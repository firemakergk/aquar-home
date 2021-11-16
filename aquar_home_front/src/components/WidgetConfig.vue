<template>
  <div class="container">
    <div class="config_header">
      <span style="flex-grow: 1; margin: 0 10px;">{{widgetName}}设置</span>
      <a style="margin: 0 4px;" class="iconfont icon-times icon" @click="close" />
    </div>
    <div class="config_content">
      <div class="widget_config_panel">
        <component v-bind:is="widgetType" :tab-index="tabIndex" :config-data="configData"></component>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import IconWidgetConfig from './widgets/Icon/config.vue'
export default {
  name: 'WidgetConfig',
  components: {
    IconWidgetConfig
  },
  data: function() {
    return {
      widgetType: "",
      widgetName: "",
      tabIndex: null,
      configData: {}
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
    this.$bus.on('configWidget', this.initConfig)
  },
  mounted: function() {
  },
  beforeDestroy() {
    this.$bus.off('configWidget', this.initConfig)
  },
  methods: {
    close() {
      this.$bus.emit('closeWidgetConfig', null)
    },
    initConfig(eventData) {
      this.widgetType = eventData.widgetType
      this.widgetName = eventData.widgetName
      this.tabIndex = eventData.tabIndex
      this.configData = eventData.configData
      this.$bus.emit('showWidgetConfig',null)
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
    padding: 0;
    float: right;
  }

.image {
  width: 100%;
  display: block;
}
.container {
  border-radius: 2px;
  margin: 4px;
  background-color: rgba(255,255,255,1);
  color: rgb(44,44,44);
  display: flex;
  flex-direction: column;
}
.config_header {
  display: flex;
  align-items: center;
  height: 24px;
  border-radius:2px 2px 0 0 ;
  background-color: rgb(44,44,44);
  color: white;
}
.config_content {
  // min-height: 200px;
  height: 400px;
  flex-grow: 1;
  display: flex;
  position: relative;
  flex-direction: column;
}
.widget_config_panel {
  margin: 10px 0 0 0;
  padding: 10px;
  // width:100%;
  height: 100%;
  overflow-y: auto;
}
.widget_list {
  margin: 0;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  border-top: solid #ccc thin;
}
.icon_panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 28px;
}
.img_span {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
}
.param_panel {
  display: flex;
  // flex-direction: row;
  justify-content: center;
  align-items: center;
  border-top: solid #ccc thin;
}
.param_warp {
  width: 480px;
}
.param_row {
  display: flex;
  align-items: center;
  width: 100%;
}
.param_name {
  width: 120px;
  margin: 10px;
  text-align: right;
}
.param_form {
  width: 100%;
}
.widget_config_panel::-webkit-scrollbar {
  width: 4px;
}
.widget_config_panel::-webkit-scrollbar-track {
  box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
}
.widget_config_panel::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  // outline: 0.5px solid slategrey;
}

</style>
