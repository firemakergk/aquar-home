<template>
  <div id="app" :style="{'--bgUrl': bgUrl,'--bgColor': bgColor,'--blurNum':blurNum}" class="app-main" >
    <div>
      <grid-table />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import GridTable from './views/Gridtable.vue'
import defaultBgImg from '@/assets/bg_images/bg2.jpg'
export default {
  name: 'App',
  components: {
    GridTable
  },
  data() {
    return {
      configData: {},
      bgUrl: null,
      blurNum: "blur(0px)",
      bgColor: '#42433E'
    }
  },
  created: function() {
    this.$bus.on('renderBg', this.renderBg)
  },
  mounted: function() {
    axios
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
a:hover {
  cursor: pointer;
  color: inherit;
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
    z-index:-1;
}
</style>
