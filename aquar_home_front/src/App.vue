<template>
  <div :style="curTheme" class="app-main">
    <v-app style="background: none;" >
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </div>
</template>

<script>
// import defaultLight from '@/assets/themes/defaultlight.json'
import defaultBg from '@/assets/bg_images/bg.jpg'
import light from '@/assets/themes/light.json'
import dark from '@/assets/themes/dark.json'
import colors from 'vuetify/lib/util/colors'
import ThemeService from '@/service/theme.js'

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      defaultBg,
      colors: colors,
      configData: {},
      theme: null,
      bgImg: null,
      blurStyle: "blur(0px)",
      bgOffset: "0px",
      bgColor: '#42433E',
      themes: {
        "light":light,
        "dark":dark
      },
      curTheme:{}
    }
  },
  created: function() {
    this.$bus.on('refreshPage', this.initTheme)
    this.initTheme()
  },
  mounted: function() {
    console.log(this.$vuetify.theme)
    console.log(JSON.stringify(this.$vuetify.theme.themes))
    
    this.$axios
      .get('/api/config')
      .then(response => {
        let cacheSerial = response.data.config.appearance.cacheSerial
        if(!response.data.config.appearance.theme || this.configData.appearance.cacheSerial === cacheSerial){
          return
        }
        this.configData = response.data.config
        let validData = ThemeService.validTheme(response.data)
        this.renderBg(validData)
        this.$forceUpdate()
        ThemeService.updateCache(validData)
      })
  },
  beforeDestroy() {
    this.$bus.off('refreshPage', this.initTheme)
  },
  methods: {
    initTheme(){
      let cache = ThemeService.fetchFromCache()
      if(cache){
        this.renderBg(cache)
      }else{
        let defaultTheme = ThemeService.fetchDefault()
        this.renderBg(defaultTheme)
        ThemeService.updateCache(defaultTheme)
      }
      this.$forceUpdate() 
    },
    renderBg(data) {
      let {config, theme} = data
      if(config){
        this.configData = config
        if(config.appearance.bgImg){
          this.bgImg = 'url(' + config.appearance.bgImg + ')';
          if(config.appearance.bgBlur){
            this.blurStyle = 'blur(' + config.appearance.bgBlur + 'px)';
            this.bgOffset = 0 - Math.round(parseInt(config.appearance.bgBlur)*1.6) + 'px'
          }
        }else{
          this.bgImg = null;
          this.blurStyle = 'blur(0);'
          this.bgOffset = '0'
          this.bgColor = config.appearance.bgColor? config.appearance.bgColor:"#42433E"
        }
      }
      this.curTheme = {'--bgUrl': this.bgImg,'--bgColor': this.bgColor,'--blurStyle':this.blurStyle, '--bgOffset':this.bgOffset}
      if(theme){
        ThemeService.setupVuetifyTheme(this, theme)
        this.curTheme = Object.assign(this.curTheme,theme.ui)
      }else if(config.appearance.theme === 'light' || config.appearance.theme === 'dark'){
        
      }
      
      // else if(config.appearance.theme && this.themes[config.appearance.theme]){
      //   this.curTheme = Object.assign(this.curTheme,this.themes[config.appearance.theme])
      // }else{
      //   this.curTheme = Object.assign(this.curTheme,defaultLight)
      // }
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
@import '~vuetify/src/components/VTextField/_variables.scss';
$text-field-solo-dense-control-min-height: 20px;
$text-field-line-height: 10px;
@import '~vuetify/src/components/VTextField/VTextField.sass';
body {
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
  font-size: 14px;
}

label {
  font-weight: 700;
}

html {
  height: 100%;
  box-sizing: border-box;
}

#app {
  height: 100%;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

a:focus,
a:active {
  outline: none;
}

a,
a:focus,
a:visited {
  cursor: pointer;
  text-decoration: none;
}

div:focus {
  outline: none;
}
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh);
  width: 100%;
  position: relative;
  /* overflow: hidden; */
}
.app-main::before{
  content:'';
  position:fixed;
  top: var(--bgOffset,0);
  bottom: var(--bgOffset,0);
  left: var(--bgOffset,0);
  right: var(--bgOffset,0);
  background:transparent center center no-repeat fixed;
  background-image: var(--bgUrl);
  background-color: var(--bgColor);
  background-size: cover;
  background-position: center;
  /* overflow:hidden; */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  filter:var(--blurStyle);
  z-index:-2;
}
.widget_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 4px;
  background-color: var(--tbgcolor_main,rgba(255,255,255, 0.2));
  backdrop-filter: blur(24px);
  // box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);
  box-sizing: border-box;
  color: var(--tcolor_main,rgb(44,44,44));
  // border-top: var(--tbtcolor,#ccc) solid thin;
}
.widget_box_vuetify {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 4px;
  background-color: var(--tbgcolor_main,rgba(255,255,255, 0.2));
  backdrop-filter: blur(24px);
  // box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);
  box-sizing: border-box;
  color: var(--tcolor_main,rgb(44,44,44));
  // border-top: var(--tbtcolor,#ccc) solid thin;
}
.widget_header {
  width: 100%;
  padding: 6px 6px;
  height: 36px;
  border-radius: 4px 4px 0 0 ;
  margin: 0 auto;
  display: inline-flex;;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: var(--tcolor_primary,#336666) !important;
  background-color: var(--tbgcolor_sub_head,rgba(255,255,255, 0.2));
}
.widget_body {
  padding: 8px;
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  flex-grow: 1;
}
.widget_content {
  display: flex;
  flex-direction: column;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
}
.widget_content_list {
  margin: 4px;
  padding: 4px;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.widget_box input {
  background-image: none;
  border: 1px solid #e5e6e7;
  border-radius: 1px;
  color: var(--tcolor_main,black);
  // background-color: var(--tbgcolor_config,white);
  display: block;
  padding: 4px 6px;
  // transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
  width: 100%;
  font-size: 10px;
}
// .widget_box button {
//   padding: 2px 4px;
//   font-size: 12px;
//   text-align: center;
//   white-space: nowrap;
//   vertical-align: middle;
//   -ms-touch-action: manipulation;
//   touch-action: manipulation;
//   cursor: pointer;
//   user-select: none;
//   background-image: none;
//   border: 1px solid transparent;
//   border-color: #e5e6e7;
//   border-radius: 4px;
// }
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  /* outline: 0.5px solid slategrey; */
}

.config_content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  // background-color: var(--tbgcolor_config,white);
  color: var(--tcolor_main,black);
  overflow-y: auto;
}

.float_config {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  font-size: 14px;
  z-index: 8;
  background-color: var(--tbgcolor_config,white);
  overflow-y: auto;
  overflow-x: hidden;
}
.config_top {
  display: flex;
  align-items: center;
  top: 0;
  height: 24px;
  padding: 0 4px;
  background-color: var(--tbgcolor_sub_head2,white);
}
.config_body {
  padding: 4px;
} 

// .config_body input {
//   // background-color: var(--tbgcolor_config,white);
//   // color: var(--tcolor_main,black);
// }

.config_row {
  display: flex;
  align-items: center;
  padding: 2px 2px;
}

.error_info {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 8;
  word-wrap:break-word;
  font-size: 12px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction:column;
}
.init_config{
  position: relative;
  top: 40%; /*偏移*/
  transform: translateY(-80%);
  text-align: center;
  vertical-align: center;
}

.border_bt{
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--tbcolor,#e5e6e7);
}

.tcolor {
  color: var(--tcolor,#000) !important;
}

.tcolor_reverse {
  color: var(--tcolor_reverse,#FFF) !important;
}

.tcolor_main {
  color: var(--tcolor_main,#336666) !important;
}

.tcolor_primary {
  color: var(--tcolor_primary,#336666) !important;
}

.tcolor_sub {
  color: var(--tcolor_sub,#666666) !important;
}
.tcolor_active {
  color: var(--tcolor_active,#99CC33) !important;
}
.tcolor_error {
  color: var(--tcolor_error,#FF6666) !important;
}
.tcolor_warn {
  color: var(--tcolor_warn,#FF9900) !important;
}
.tcolor_disable {
  color: var(--tcolor_disable,#999) !important;
}
.tbgcolor_main {
  background-color: var(--tbgcolor_main,white) !important;
}
.tbgcolor_head {
  background-color: var(--tbgcolor_head, white) !important;
}
.tbgcolor_sub_head {
  background-color: var(tbgcolor_sub_head,#669999) !important;
}
.tcolor_sub_head {
  color: var(--tcolor_primary,white) !important;
}
.tbgcolor_disable {
  background-color: var(--tbgcolor_disable,#ccc) !important;
}
.tbgcolor_idle {
  background-color: var(--tbgcolor_idle,#669999) !important;
}
.tbgcolor_info {
  background-color: var(--tbgcolor_info,#99CCFF) !important;
}
.tbgcolor_active {
  background-color: var(--tbgcolor_active,#009933) !important;
}
.tbgcolor_warn {
  background-color: var(--tbgcolor_warn,#FF9900) !important;
}
.tbgcolor_error {
  background-color: var(--tbgcolor_error,#FF6666) !important;
}
.tbgcolor_mask_info {
  background-color: var(--tbgcolor_mask_info,rgba(255,255,255, 1));
}
.tbgcolor_mask_error {
  background-color: var(--tbgcolor_mask_error,rgba(0,0,0, 0.75));
}
.tpcolor_idle {
  background-color: var(--tpcolor_idle,#669999) !important;
}
.tpcolor_info {
  background-color: var(--tpcolor_info,#99CCFF) !important;
}
.tbcolor {
  border-color: var(--tbcolor,#e5e6e7);
}

</style>
