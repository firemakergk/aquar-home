<template>
  <div class="container tbgcolor_main tcolor_main">
    <div class="config_header tbgcolor_sub_head tcolor_reverse">
      <span style="flex-grow: 1; margin: 0 10px;">设置</span>
      <a style="margin: 0 4px;" class="iconfont icon-times icon tcolor_reverse" @click="close" />
    </div>
    <div class="config_container tbgcolor_main">
      <div class="config_sidebar tbgcolor_config_tab">
        <a v-for="(menu,index) in menus" :key="index" class="menu_item tcolor_sub_head" 
        @click="toTab(index)" :class="{'tbgcolor_content tcolor_reverse': index == curMenu}">{{menu.name}}</a>
      </div>
      <div class="config_panel">
        <keep-alive>
          <component v-bind:is="menus[curMenu].component"></component>
        </keep-alive>
      </div>
    </div>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import AddWidget from './AddWidget.vue' 
import ConfigAppearance from './ConfigAppearance.vue'
import ConfigTabs from './ConfigTabs.vue'
import ConfigAccount from './ConfigAccount.vue'
import ConfigCache from './ConfigCache.vue'
import ConfigAbout from './ConfigAbout.vue'

export default {
  name: 'Config',
  components: {
    AddWidget,
    ConfigAppearance,
    ConfigTabs,
    ConfigAccount,
    ConfigCache,
    ConfigAbout
  },
  data: function() {
    return {
      menus:[
        {'name':'外观设置',component:'ConfigAppearance'},
        {'name':'添加组件',component:'AddWidget'},
        {'name':'分页设置',component:'ConfigTabs'},
        {'name':'帐户设置',component:'ConfigAccount'},
        {'name':'缓存设置',component:'ConfigCache'},
        {'name':'关于',component:'ConfigAbout'}
      ],
      curMenu: 0
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    close() {
      this.curWidget = null
      this.configDetail = false
      this.$bus.emit('closeConfigPanel', null)
    },
    toTab(index) {
      this.curMenu = index
    }
  }
}
</script>

<style lang="scss" scoped>

.container {
  border-radius: 2px;
  margin: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);
}
.config_header {
  display: flex;
  align-items: center;
  height: 24px;
  border-radius:2px 2px 0 0 ;
}
.config_container{
  // min-height: 200px;
  height: 400px;
  flex-grow: 1;
  display: flex;
  position: relative;
}
.config_sidebar {
  margin: 0;
  flex: 0 0 80px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
}
.menu_item {
  padding: 8px 4px;
}
.config_panel {
  margin: 0;
  width:100%;
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

</style>
