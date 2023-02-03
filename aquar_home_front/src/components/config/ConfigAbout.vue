<template>
  <div class="config_content">
    <div class="config_panel">
      <div class="param_panel">
        <img style="height: 60px;" :src="logo_aquar">
        <div class="tcolor_main" style="font-size:20px; margin: 8px;">AquarHome</div>
        <div class="tcolor_sub">高度可定制的个人Home页，同时是强大的NAS服务控制台。</div>
        <div class="tcolor_sub" style="margin-top: 60px; width: 100%;">
          <div>
            开发者：
            <span class="tcolor_main">firemaker</span>
            <span class="tcolor_main" style="margin: 0 10px;">sklxz@qq.com</span></div>
          <div>系统说明文档：<a href="https://github.com/firemakergk/aquar-home-helper" target="_blank">https://github.com/firemakergk/aquar-home-helper</a></div>
          <div>GitHub地址：<a href="https://github.com/firemakergk/aquar-home" target="_blank">https://github.com/firemakergk/aquar-home</a></div>
          <div>码云地址：<a href="https://gitee.com/firemaker/aquar-home" target="_blank">https://gitee.com/firemaker/aquar-home</a></div>
          <div>本项目旨在让各种优秀的服务更好的融合在一起，造福各位NAS爱好者和极客，感谢你的支持。</div>
          <div>项目目前由作者个人维护，能力有限，难免有一些bug，若你在使用中发现问题或有任何建议，欢迎通过邮箱联系，或者在开源平台上提交issue。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import logo_aquar from '@/assets/app_images/aquar.png'


export default {
  name: 'ConfigAbout',
  components: {
  },
  data: function() {
    return {
      logo_aquar,
      cacheSize: null
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
  }
}
</script>

<style lang="scss" scoped>
.config_content {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.config_panel {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.param_panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
}
</style>
