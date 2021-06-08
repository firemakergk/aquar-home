<template>
  <div id="app" class="app-main">
    <div>
      <grid-table />
    </div>
  </div>
</template>

<script>
import GridTable from './views/Gridtable.vue'

export default {
  name: 'App',
  components: {
    GridTable
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
  overflow: hidden;
}
.app-main::before{
    content:'';
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:transparent url("~@/assets/bg_images/bg1.jpg") center center no-repeat fixed;
    overflow:hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    filter:blur(80px);
    z-index:-1;
    background-size: 100% 100%;
}
</style>
