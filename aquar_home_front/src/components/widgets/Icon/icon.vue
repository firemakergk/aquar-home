<template>
  <div class="container">
    <div class="icon_panel">
      <div class="img_span" @mouseover="showConfigIcon=true" @mouseleave="showConfigIcon=false">
        <div style="flex-grow: 1; width: 8px;" />
        <a :target="configData.data.target_type" :href="configData.href">
          <img v-if="configData.data.img_path" :src="configData.data.img_path" style=" flex-grow: 1; width: 48px;">
          <img v-else-if="configData.data.ico_path" :src="configData.data.ico_path" style=" flex-grow: 1; width: 48px;">
          <img v-else :src="logo_icon" style=" flex-grow: 1; width: 48px;">
        </a>
        <div style="flex-grow: 1; width: 8px;">
          <a v-show="showConfigIcon" class="iconfont icon-cog-fill icon tcolor_reverse" style="color: rgba(255,255,255,0.3); font-size: 6px; " title="设置" @click="toggleConfig" />
        </div>
      </div>
      <a :target="configData.data.target_type" :href="configData.href" class="icon_label tcolor_reverse">{{ configData.name }}</a>
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
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    imgLoad(msg) {
      console.log(msg)
    },
    toggleConfig() {
      // this.showConfig = !this.showConfig
      this.$bus.emit('configWidget',  {'widgetType':'IconWidgetConfig','widgetName':'图标','tabIndex':this.tabIndex,'configData':this.configData})
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
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
.icon_panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4px;
  padding: 2px;
}
.img_span {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 48px;
}
.icon_label {
  text-align: center;
  color: white;
}

</style>
