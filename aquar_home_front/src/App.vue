<template>
  <div id="app" :style="curTheme" class="app-main" >
    <div>
      <!-- <grid-table /> -->
      <router-view />
    </div>
  </div>
</template>

<script>
import defaultLight from '@/assets/themes/defaultlight.json'
import dark from '@/assets/themes/dark.json'
export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      configData: {},
      bgUrl: null,
      blurNum: "blur(0px)",
      bgColor: '#42433E',
      themes: {
        "defaultLight":defaultLight,
        "dark":dark
      },
      curTheme:{}
    }
  },
  created: function() {
    this.$bus.on('renderBg', this.renderBg)
  },
  mounted: function() {
    this.$axios
      .get('/api/config')
      .then(response => {
        this.configData = response.data
        this.renderBg(this.configData)
        this.$forceUpdate()
      })
  },
  beforeDestroy() {
    this.$bus.off('renderBg', this.renderBg)
  },
  methods: {
    renderBg: function(config) {
      this.configData = config
      if(config.appearance.bgImg){
        this.bgUrl = 'url(' + config.appearance.bgImg + ')';
        if(config.appearance.bgBlur){
          this.blurNum = 'blur(' + config.appearance.bgBlur + 'px)';
        }
      }else{
        this.bgUrl = null;
        this.blurNum = 0;
        this.bgColor = config.appearance.bgColor
      }
      this.curTheme = {'--bgUrl': this.bgUrl,'--bgColor': this.bgColor,'--blurNum':this.blurNum}
      if(config.appearance.theme && this.themes[config.appearance.theme]){
        this.curTheme = Object.assign(this.curTheme,this.themes[config.appearance.theme])
      }
    }
  }
}
</script>

<style>
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
  color: var(--a_color,#336666);
  /* color: inherit; */
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
  width:100%;
  height:100%;
  background:transparent center center no-repeat fixed;
  background-image: var(--bgUrl,null);
  background-color: var(--bgColor);
  background-size: cover;
  /* overflow:hidden; */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  filter:var(--blurNum);
  z-index:-2;
}
.widget_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px 4px;
  border-radius: 2px;
  background-color: var(--widget_box_bgcolor,rgba(255,255,255, 0.7));
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);
  box-sizing: border-box;
  color: var(--widget_box_color,rgb(44,44,44));
  border-top: #ccc solid thin;
}
.widget_header {
  width: 100%;
  padding: 4px 4px;
  margin: 0 auto;
  display: inline-flex;;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.widget_body {
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
  overflow-y: auto;
  overflow-x: hidden;
}
.widget_content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
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
  color: inherit;
  display: block;
  padding: 4px 6px;
  transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
  width: 100%;
  font-size: 10px;
}
.widget_box button {
  padding: 2px 4px;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-color: #e5e6e7;
  border-radius: 4px;
}
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

.float_config {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  font-size: 12px;
  z-index: 3;
}
.config_top {
  display: flex;
  align-items: center;
  top: 0;
  height: 16px;
}
.config_body {
  height: 100%;
}
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
  z-index: 3;
  word-wrap:break-word;
  background-color: var(--error_info_gbcolor,rgba(0,0,0,0.75));
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

.tcolor {
  color: var(--tcolor,#000);
}

.tcolor_reverse {
  color: var(--tcolor_reverse,#FFF);
}

.tcolor_main {
  color: var(--tcolor_main,#336666);
}

.tcolor_sub {
  color: var(--tcolor_sub,#666666);
}
.tcolor_active {
  color: var(--tcolor_active,#99CC33);
}
.tcolor_error {
  color: var(--tcolor_error,#FF6666);
}
.tcolor_warn {
  color: var(--tcolor_warn,#FF9900);
}
.tcolor_disable {
  color: var(--tcolor_disable,#999);
}
.tbgcolor_main {
  background-color: var(--tbgcolor_main,white);
}
.tbgcolor_content {
  background-color: var(--tbgcolor_content,#336666);
}
.tbgcolor_head {
  background-color: var(--tbgcolor_head, white);
}
.tbgcolor_tab {
  background-color: var(--tbgcolor_tab,#669999);
}
.tcolor_tab {
  color: var(--tcolor_tab,white);
}
.tbgcolor_tab_selected {
  background-color: var(--tbgcolor_tab_selected,#83b6b6);
}
.tcolor_tab_selected {
  color: var(--tcolor_tab_selected,white);
}
.tbgcolor_sub_head {
  background-color: var(--tbgcolor_sub_head,#669999);
}
.tcolor_sub_head {
  color: var(--tcolor_sub_head,white);
}
.tbgcolor_disable {
  background-color: var(--tbgcolor_disable,#ccc);
}
.tbgcolor_idle {
  background-color: var(--tbgcolor_idle,#669999);
}
.tbgcolor_info {
  background-color: var(--tbgcolor_info,#99CCFF);
}
.tbgcolor_active {
  background-color: var(--tbgcolor_active,#009933);
}
.tbgcolor_error {
  background-color: var(--tbgcolor_error,#FF6666);
}
.tbgcolor_mask_info {
  background-color: var(--tbgcolor_mask_info,rgba(255,255,255, 1));
}
.tbgcolor_mask_error {
  background-color: var(--tbgcolor_mask_error,rgba(0,0,0, 0.75));
}
.tbgcolor_mask_reverse {
  background-color: var(--tbgcolor_mask_reverse,rgba(0,0,0, 0.4));
}
.tbcolor {
  border-color: var(--tbcolor,#e5e6e7);
}
.tbtcolor {
  border-top-color: var(--tbtcolor,#ccc);
}

</style>
