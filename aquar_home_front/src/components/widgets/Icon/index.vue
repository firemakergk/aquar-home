<template>
  <keep-alive>
    <component v-bind:is="showType" :tab-index="tIndex" :config-data="data" class="no-drag absolute"></component>
  </keep-alive>
</template>

<script>
import icon from './icon.vue'
import navi from './navi.vue'
export default {
  name: 'IconWidget',
  components: {
    icon,
    navi
  },
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      showType: 'icon',
      tIndex: null,
      data: null
    }
  },
  computed: {
  },
  created: function() {
    this.tIndex = this.tabIndex
    this.data = this.configData
    this.$bus.on('reload_'+this.data.id, this.reload)
  },
  mounted: function() {
    if(this.data.layout.h > 1){
      this.showType = 'icon'
    }else{
      this.showType = 'navi'
    }
  },
  beforeDestroy() {
    this.$bus.off('reload_'+this.data.id, this.reload)
  },
  methods: {
    toggleConfig() {
      // this.showConfig = !this.showConfig
      this.$bus.emit('configWidget',  {'widgetType':'IconWidgetConfig','widgetName':'图标','tabIndex':this.tIndex,'configData':this.data})
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tIndex,'widget':this.data})
      this.showConfig = false
    },
    reload(data){
      this.tIndex = parseInt(data.tabIndex)
      this.data = data.configData
      if(this.data.layout.h > 1){
        this.showType = 'icon'
      }else{
        this.showType = 'navi'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}

</style>
