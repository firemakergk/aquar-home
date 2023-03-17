<template>
  <div class="config_content">
    <div v-show="!configDetail" class="config_panel" transition="scroll-x-transition" >
      <div style="height: 24px; margin: 0 0 0 32px;" >选择组件(1/2):</div>
      <div class="widget_list">
        <a v-for="(widget,index) in widgets" :key="index" class="icon_panel" @click="toConfigDetail(widget)">
          <div class="img_span">
            <img v-if="widget.widget === 'SyncthingWidget'" :src="logo_syncthing" style="width: 60px;" >
            <img v-if="widget.widget === 'ArchivePhaseWidget'" :src="logo_archivephase" style="width: 60px;">
            <img v-if="widget.widget === 'NextCloudWidget'" :src="logo_nextcloud" style="width: 60px;">
            <img v-if="widget.widget === 'IconWidget'" :src="logo_icon" style="width: 60px;">
            <img v-if="widget.widget === 'TrueNasWidget'" :src="logo_truenas" style="width: 60px;">
            <img v-if="widget.widget === 'PveWidget'" :src="logo_pve" style="width: 60px;">
            <img v-if="widget.widget === 'DockerWidget'" :src="logo_docker" style="width: 60px;">
            <img v-if="widget.widget === 'SearchWidget'" :src="logo_search" style="width: 60px;">
            <img v-if="widget.widget === 'TransmissionWidget'" :src="logo_transmission" style="width: 60px;">
            <img v-if="widget.widget === 'ChatRoomWidget'" :src="logo_chatroom" style="width: 60px;">
            <img v-if="widget.widget === 'QBittorrentWidget'" :src="logo_qbittorrent" style="width: 60px;">
          </div>
          <div>{{ widget.name }}</div>
        </a>
      </div>
    </div>
    <div v-show="configDetail" class="config_panel" >
      <div style="height: 24px; margin: 0; display: flex; border-bottom: solid #ccc thin;">
        <span style="flex-grow: 1; margin: 0 0 0 32px;">设置组件参数(2/2):</span>
        <span v-show="curWidget && curWidget.widget === 'IconWidget'"><button @click="toggleBatch()">批量导入</button></span>
      </div>
      <div class="config_panel" v-if="showBatch">
        <batch-import/>
      </div>
      <div v-else class="pa-4">
        <v-container v-if="curWidget" class="pa-0" transition="scroll-x-transition">
          <v-row align="end" dense class="py-2 ">
            <v-col cols="12">
              <v-text-field  hide-details="true" label="组件名称" height="30" v-model="curWidget.name" class="py-0 my-0" ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="end" dense class="py-2 ">
            <v-col cols="12">
              <v-text-field  hide-details="true" label="链接地址" height="30" v-model="curWidget.href" class="py-0 my-0" ></v-text-field>
            </v-col>
          </v-row>
          <v-row  v-for="(param,index) in curWidget.required_params" :key="index" align="end" dense class="py-2" >
            <v-col cols="12">
              <v-text-field  hide-details="true" :label="param[0]" height="30" v-model="curWidget.data[param[0]]" class="py-0 my-0" ></v-text-field>
            </v-col>
          </v-row>
          <v-row  align="center" justify="center" dense class="py-2" >
            <v-col cols="4">
              <v-btn small outlined @click="toChoose" style="margin:0 2px; width: 100%;" title="返回" ><v-icon left>mdi-arrow-left-top-bold</v-icon>返回</v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn small color="primary" @click="submit" style="margin:0 2px; width: 100%;" title="提交" ><v-icon left>mdi-check-bold</v-icon>提交</v-btn>
            </v-col>
          </v-row>
        </v-container>
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
import logo_transmission from '../widgets/Transmission/img/transmission.png'
import logo_chatroom from '../widgets/ChatRoom/img/chatroom.png'
import logo_qbittorrent from '../widgets/QBittorrent/img/qbittorrent.png'

import meta_syncthing from '../widgets/Syncthing/template.json'
import meta_archivephase from '../widgets/ArchivePhase/template.json'
import meta_nextcloud from '../widgets/NextCloud/template.json'
import meta_icon from '../widgets/Icon/template.json'
import meta_truenas from '../widgets/TrueNas/template.json'
import meta_pve from '../widgets/Pve/template.json'
import meta_docker from '../widgets/Docker/template.json'
import meta_search from '../widgets/Search/template.json'
import meta_transmission from '../widgets/Transmission/template.json'
import meta_chatroom from '../widgets/ChatRoom/template.json'
import meta_qbittorrent from '../widgets/QBittorrent/template.json'

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
        meta_search,
        meta_transmission,
        meta_chatroom,
        meta_qbittorrent
      ],
      logo_syncthing,
      logo_archivephase,
      logo_nextcloud,
      logo_icon,
      logo_truenas,
      logo_pve,
      logo_docker,
      logo_search,
      logo_transmission,
      logo_chatroom,
      logo_qbittorrent,
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
  top: 36px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 0;
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
