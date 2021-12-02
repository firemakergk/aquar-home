<template>
  <div class="config_content">
    <div v-show="!configDetail" class="config_panel">
      <div style="height: 24px; margin: 0 20px;">选择组件(1/2):</div>
      <div class="widget_list">
        <a v-for="(widget,index) in widgets" :key="index" class="icon_panel" @click="toConfigDetail(widget)">
          <div class="img_span">
            <img v-if="widget.widget === 'SyncthingWidget'" :src="logo_syncthing" style="width: 60px;">
            <img v-if="widget.widget === 'ArchivePhaseWidget'" :src="logo_archivephase" style="width: 60px;">
            <img v-if="widget.widget === 'NextCloudWidget'" :src="logo_nextcloud" style="width: 60px;">
            <img v-if="widget.widget === 'IconWidget'" :src="logo_icon" style="width: 60px;">
            <img v-if="widget.widget === 'TrueNasWidget'" :src="logo_truenas" style="width: 60px;">
            <img v-if="widget.widget === 'PveWidget'" :src="logo_pve" style="width: 60px;">
            <img v-if="widget.widget === 'DockerWidget'" :src="logo_docker" style="width: 60px;">
            <img v-if="widget.widget === 'SearchWidget'" :src="logo_search" style="width: 60px;">
          </div>
          <div>{{ widget.name }}</div>
        </a>
      </div>
    </div>
    <div v-show="configDetail" class="config_panel">
      <div style="height: 24px; margin: 0 0 0 20px; display: flex;">
        <span style="flex-grow: 1">设置组件参数(2/2):</span>
        <span v-show="curWidget && curWidget.widget === 'IconWidget'"><button @click="toggleBatch()">批量导入</button></span>
      </div>
      <div class="param_panel" v-if="showBatch">
        <batch-import/>
      </div>
      <div v-else class="param_panel">
        <div v-if="curWidget" class="param_warp">
          <div class="param_row">
            <span class="param_name">
              组件名称：
            </span>
            <div class="param_form">
              <input v-model="curWidget.name" type="text" style="width: 100%;">
            </div>
          </div>
          <div class="param_row">
            <span class="param_name">
              链接地址：
            </span>
            <div class="param_form">
              <input v-model="curWidget.href" type="text" style="width: 100%;">
            </div>
          </div>
          <div v-for="(param,index) in curWidget.required_params" :key="index" class="param_row">
            <span class="param_name">
              <label style="color: red;">*</label>{{ param[0] }}：
            </span>
            <div v-if="param[1]==='text'" class="param_form">
              <input v-model="curWidget.data[param[0]]" type="text" style="width: 100%;">
            </div>
          </div>
          <div class="submit_panel">
            <a class="submit_button iconfont icon-reply icon tcolor_main" title="返回" @click="toChoose" />
            <a class="submit_button iconfont icon-check icon tcolor_active" title="提交" @click="submit" />
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import logo_syncthing from '../widgets/Syncthing/img/syncthing.png'
import logo_archivephase from '../widgets/ArchivePhase/img/rsync.jpg'
import logo_nextcloud from '../widgets/NextCloud/img/nextcloud.png'
import logo_icon from '../widgets/Icon/img/aquar.png'
import logo_truenas from '../widgets/TrueNas/img/truenas.png'
import logo_pve from '../widgets/Pve/img/pve.png'
import logo_docker from '../widgets/Docker/img/docker.png'
import logo_search from '../widgets/Search/img/search.png'

import meta_syncthing from '../widgets/Syncthing/template.json'
import meta_archivephase from '../widgets/ArchivePhase/template.json'
import meta_nextcloud from '../widgets/NextCloud/template.json'
import meta_icon from '../widgets/Icon/template.json'
import meta_truenas from '../widgets/TrueNas/template.json'
import meta_pve from '../widgets/Pve/template.json'
import meta_docker from '../widgets/Docker/template.json'
import meta_search from '../widgets/Search/template.json'

import BatchImport from '../widgets/Icon/batchimport.vue'

export default {
  name: 'AddWidget',
  components: {
    BatchImport,
  },
  data: function() {
    return {
      showBatch: false,
      widgets: [
        meta_syncthing,
        meta_archivephase,
        meta_nextcloud,
        meta_icon,
        meta_truenas,
        meta_pve,
        meta_docker,
        meta_search
      ],
      logo_syncthing,
      logo_archivephase,
      logo_nextcloud,
      logo_icon,
      logo_truenas,
      logo_pve,
      logo_docker,
      logo_search,
      configDetail: false,
      curWidget: null
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
      this.showBatch = false
      // this.$bus.emit('closeAddPanel', null)
    },
    toConfigDetail(widget) {
      this.curWidget = Object.assign({}, widget)
      this.configDetail = true
    },
    toChoose() {
      this.curWidget = null
      this.configDetail = false
      this.showBatch = false
    },
    submit() {
      this.$bus.emit('addWidget', this.curWidget)
      this.configDetail = false
      this.close()
    },
    toggleBatch() {
      this.showBatch = !this.showBatch
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
    padding: 0;
    float: right;
  }

.image {
  width: 100%;
  display: block;
}
.config_panel {
  margin: 0;
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
  justify-content: center;
  width: 120px;
  height: 120px;
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
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: solid #ccc thin;
}
.param_warp {
  width: 400px;
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
.submit_panel {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.submit_button {
  font-size: 30px;
  margin: 0 40px;
}
.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}

</style>
