<template>
  <div class="content">
    <v-container class="lighten-5">
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-select hide-details dense :items="tabs" label="移动至页面" v-model="selectedTab" ></v-select>
        </v-col>
      </v-row>
      <v-row justify="end" align="center" dense class="py-2">
        <v-col cols="3">
          <v-btn depressed small color="primary" @click="moveWidget()" style="margin:0 4px; width: 100%;">
            <v-icon small>mdi-check</v-icon>
            提交
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import * as _ from 'lodash'
export default {
  name: 'WidgetMove',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      tabs: [],
      selectedTab: null
    }
  },
  computed: {
  },
  created: function() {
    this.$axios
      .get('/api/allData')
      .then(response => {
        let tmpTabs =  _.cloneDeep(response.data.tabs)
        tmpTabs = tmpTabs.map((tab, index) => {return {text:tab.title,value:index}})
        tmpTabs.splice(this.tabIndex, 1)
        this.tabs = tmpTabs
        this.$forceUpdate()
      })
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    moveWidget() {
      this.$axios
      .post('/api/moveWidget', {fromTab: this.tabIndex, widgetId: this.configData.id, toTab: this.selectedTab})
      .then(response => {
        console.log(response.data)
      })
      this.$bus.emit('refresh', null)
      this.$bus.emit('closeWidgetConfig', null)
    },
  }
}
</script>

<style lang="scss" scoped>
.image {
  width: 100%;
  display: block;
}
.config_header {
  display: flex;
  align-items: center;
  height: 24px;
  background-color: rgb(44,44,44);
  color: white;
}
.content {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.param_panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // border-top: solid #ccc thin;
  font-size: 14px;
}

.param_row {
  display: flex;
  align-items: center;
  width: 100%;
}
.param_name {
  flex-basis: 100px;
  margin: 10px;
  text-align: right;
}
.param_form {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
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
}
.img_span {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  // width: 40px;
  height: 40px;
}
.submit_panel {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.submit_button {
  background-color: rgb(44,44,44);
  color: rgb(243,243,243);
  font-size: 14px;
}
</style>
