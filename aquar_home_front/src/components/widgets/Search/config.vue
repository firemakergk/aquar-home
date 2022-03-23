<template>
  <div class="content">
    <div class="param_panel">
      <div class="param_row">
        <div class="param_name">跳转方式：</div>
        <div class="param_form">
          <select v-model="configData.data.target_type">
            <option value='_blank'>新标签页</option>
            <option value='_self'>当前页</option>
          </select>
        </div>
      </div>
      <div class="param_row" style="height: 80px;">
        <div class="param_name"></div>
        <div class="param_form">
          <button type="button" class="submit_button" @click="updateConfig()">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchWidgetConfig',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
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
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
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
