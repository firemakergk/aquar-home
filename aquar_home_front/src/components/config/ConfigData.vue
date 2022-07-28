<template>
  <div class="config_content">
    <v-container class="lighten-5">
      <v-row align="center" dense class="py-2">
        <v-col cols="2">
          <v-btn depressed small color="primary" @click="clearCache()" style="margin:0 4px; width: 100%;">清理缓存</v-btn>
        </v-col>
        <v-col cols="3">
          <span>缓存大小：</span>
          <span>{{cacheSize}}</span>
        </v-col>
        <v-col cols="1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
            </template>
            <span>缓存主要包含历史上上传过的图片，自动抓取的ico图标，以及部分应用生成的图片缩略图等。<br/>清理缓存不会影响正在使用的图标，但会清空所有缩略图缓存。</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="2">
          <v-btn depressed small color="primary" @click="exportData()" style="margin:0 4px; width: 100%;">导出配置</v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn depressed small color="primary" @click="selectFile()" style="margin:0 4px; width: 100%;">导入配置</v-btn>
          <input ref="uploader" style="display: none;" type="file" @change="importData">
        </v-col>
        <v-col cols="1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" >mdi-help-circle-outline</v-icon>
            </template>
            <span>导出功能会将aquarhome存放数据的目录打包为zip，并下载到你手中。<br/>导入功能会将数据压缩包中的图标、组件配置信息增量地导入系统，不会影响帐号信息。</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  name: 'ConfigData',
  components: {
  },
  data: function() {
    return {
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
    this.$axios.get('/api/cache/info')
        .then(response => {
          this.cacheSize = this.fileSize(parseInt(response.data.data))
        })
  },
  beforeDestroy() {
  },
  methods: {
    clearCache() {
      this.$axios.get('/api/cache/clear')
        .then(response => {
          console.log(response.data)
          this.$bus.emit('refresh')
        })
    },
    exportData() {
      this.$axios({
        url: '/api/config/export', //your url
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'aquardata.zip'); //or any other extension
        document.body.appendChild(link);
        link.click();
      });
    },
    selectFile(){
        this.$refs.uploader.click();
    },
    importData(e) {
      if(!e.target.files || !e.target.files[0]){
        return
      }
      let importFile = e.target.files[0];
      var formData = new FormData()
      formData.append('importFile', importFile)
      this.$axios({
        method: 'post',
        url: '/api/config/import',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        console.log(`导入数据：${res.data.msg}`)
        if(res.data.code === 0) {
          alert('数据导入成功！')
          window.location.reload()
        }
      })
    },
    fileSize(byteSize) {
      if (!byteSize) {
        return 'DIR'
      }
      var resNum = 0
      var postfix = 'B'
      if (byteSize < 1024) {
        resNum = byteSize
      } else if (byteSize > 1024 && byteSize <= 1048576) {
        resNum = byteSize / 1024
        postfix = 'K'
      } else if (byteSize > 1048576 && byteSize <= 1073741824) {
        resNum = byteSize / 1048576
        postfix = 'M'
      } else if (byteSize > 1073741824 && byteSize <= 1073741824) {
        resNum = byteSize / 1073741824
        postfix = 'G'
      } else {
        resNum = byteSize / 1073741824
        postfix = 'G'
      }
      return Math.round(resNum).toString() + postfix
    },
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
