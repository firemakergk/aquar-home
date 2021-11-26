<template>
  <div class="config_content">
    <div style="height: 24px; margin: 0 20px;">缓存设置:</div>
    <div class="config_panel">
      <div class="param_panel">
        <div class="param_row">
          <div class="param_form tcolor_sub" style="margin: 10px 20px;">
            注*：缓存主要包含历史上上传过的图片，自动抓取的ico图标，以及部分应用生成的图片缩略图等。清理缓存不会影响正在使用的图标，但会清空所有缩略图缓存。
          </div>
        </div>
        <div class="param_row">
          <div class="param_name">缓存大小：</div>
          <div class="param_form">
            <span>{{cacheSize}}</span>
          </div>
        </div>
        <div class="param_row">
          <div class="param_name"></div>
          <div class="param_form">
            <button type="button" @click="clearCache()">清空</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  name: 'ConfigCache',
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
  border-top: solid #ccc thin;
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
