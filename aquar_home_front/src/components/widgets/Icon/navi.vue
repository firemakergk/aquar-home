<template>
  <div class="widget_container"  @mouseover="showConfigIcon=true" @mouseleave="showConfigIcon=false">
    <div style="position:absolute; right:12px; width: 8px; top: 0;">
      <!-- <a v-show="showConfigIcon" class="iconfont icon-cog-fill icon tcolor_main" style=" font-size: 6px; opacity:0.2;" title="设置" @click="toggleConfig" /> -->
      <v-btn v-show="showConfigIcon" icon x-small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:8px; opacity: 40%;" >mdi-cog</v-icon>
      </v-btn>
    </div>
    <div class="navi_panel" :style="'background-color:'+bgColor">
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
const BG_TYPE_NONE = "0"
const BG_TYPE_THEME = "1"
const BG_TYPE_CUST = "2" 
const BG_TYPE_AUTO = "3"
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
      previewStyle1: {},
      bgColor: '#0000',
      textColor: '#ffff'
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
    let bgType = this.configData.data.bg_type
    if(!bgType || bgType === BG_TYPE_THEME){
      this.bgColor = this.$vuetify.theme.current['--tbgcolor_main']
      this.textColor = this.$vuetify.theme.current['--tcolor_main']
    }else if(bgType === BG_TYPE_NONE){
      this.bgColor = '#0000'
    }else if(bgType === BG_TYPE_CUST){
      if(this.configData.data.bg_color){
        this.bgColor = this.configData.data.bg_color
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

.widget_container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.navi_panel {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 2px;
  height: 60px;
  white-space:nowrap; word-break:break-all; text-overflow:ellipsis; -o-text-overflow:ellipsis; overflow: hidden;
}
.img_span {
  margin: 0 16px;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}
.icon_label {
  flex-grow: 1;
  text-align: left;
  font-size: 16px;
}

</style>
