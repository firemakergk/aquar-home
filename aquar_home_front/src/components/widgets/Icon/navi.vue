<template>
  <div class="container" @mouseover="showConfigIcon=true" @mouseleave="showConfigIcon=false">
    <div style="position:absolute; right:4px; width: 8px;">
      <a v-show="showConfigIcon" class="iconfont icon-cog-fill icon tcolor_main" style=" font-size: 6px; opacity:0.2;" title="设置" @click="toggleConfig" />
    </div>
    <div class="navi_panel tbgcolor_main">
      <div class="img_span">
        <img v-if="configData.data.ico_path" :src="configData.data.ico_path" style=" flex-grow: 1; width: 16px;">
        <img v-else-if="configData.data.img_path" :src="configData.data.img_path" style=" flex-grow: 1; width: 16px;">
        <img v-else :src="logo_icon" style=" flex-grow: 1; width: 16px;">
      </div>
      <a :target="configData.data.target_type" :href="href" class="icon_label tcolor_main">{{ configData.name }}</a>
    </div>
  </div>
</template>

<script>
import logo_icon from './img/aquar.png'
export default {
  name: 'IconWidget',
  components: {
  },
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      logo_icon,
      href: '#',
      showConfigIcon: false,
      showConfig: false,
      showCropper: false,
      showUpload: false,
      option: {
        img: '',
        size: 1,
        full: false,
        outputType: 'webp',
        canMove: true,
        fixedBox: false,
        original: false,
        canMoveBox: true,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 100,
        autoCropHeight: 100,
        centerBox: false,
        high: false,
        cropData: {},
        enlarge: 1,
        mode: 'contain',
        maxImgSize: 3000,
        limitMinSize: [100, 120]
      },
      previews: {},
      downImg: '#',
      previewStyle1: {}
    }
  },
  computed: {
  },
  created: function() {
    if(this.configData.data.target_type !== '_blank' && this.configData.data.target_type !== '_self'){
      this.configData.data.target_type = '_blank'
    }
    this.href = this.configData.href
    if(this.configData.data.addr_translate === '1'){
      let domain = window.location.hostname
      if(domain && domain.match(REG_PIP)){
        this.href = this.configData.data.private_href
      }
    }
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    toggleConfig() {
      // this.showConfig = !this.showConfig
      this.$bus.emit('configWidget',  {'widgetType':'IconWidgetConfig','widgetName':'图标','tabIndex':this.tabIndex,'configData':this.configData})
    }
  }
}
</script>

<style lang="scss" scoped>

.container {
  width: 100%;
  height: 100%;
}

.icon_warp {
  position: relative;
  width: 100px;
  height: 100px;
}
.icon_cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(95, 43, 43, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.navi_panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 2px;
  height: 36px;
  white-space:nowrap; word-break:break-all; text-overflow:ellipsis; -o-text-overflow:ellipsis; overflow: hidden;
}
.img_span {
  margin: 0 4px;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}
.icon_label {
  flex-grow: 1;
  text-align: left;
}

</style>
