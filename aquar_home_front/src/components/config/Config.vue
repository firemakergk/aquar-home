<template>
  <div class="aq_container tbgcolor_main tcolor_main">
    <div class="widget_header">
      <span style="flex-grow: 1; margin: 0 10px;">设置</span>
      <a style="margin: 0 4px;" class="iconfont icon-times icon tcolor_primary" @click="close" />
    </div>
    <div class="config_container tbgcolor_main">
      <div class="config_sidebar">
        <v-list dense class="pa-0">
          <v-list-item-group v-model="curMenu" color="primary">
            <v-list-item v-for="(menu,index) in menus" :key="'menu_'+index">
              <v-list-item-content>
                <v-list-item-title v-text="menu.name" ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
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
import ConfigData from './ConfigData.vue'
import ConfigAbout from './ConfigAbout.vue'

export default {
  name: 'Config',
  components: {
    AddWidget,
    ConfigAppearance,
    ConfigTabs,
    ConfigAccount,
    ConfigData,
    ConfigAbout
  },
  data: function() {
    return {
      menus:[
        {'name':'外观设置',component:'ConfigAppearance'},
        {'name':'添加组件',component:'AddWidget'},
        {'name':'分页设置',component:'ConfigTabs'},
        {'name':'帐户设置',component:'ConfigAccount'},
        {'name':'数据设置',component:'ConfigData'},
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

.aq_container {
  border-radius: 2px;
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
  height: 600px;
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
  box-shadow: 4px -2px 4px -4px rgba(0, 0, 0, .3);
}
.menu_item {
  padding: 8px 4px;
}
.config_panel {
  margin: 0;
  margin-left: 6px;
  flex-grow: 1;
  flex-shrink: 1;
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
