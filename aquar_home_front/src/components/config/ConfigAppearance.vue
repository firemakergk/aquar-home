<template>
  <div class="config_content">
    <div style="height: 24px; margin: 0 20px;">外观设置:</div>
    <div class="config_panel">
      <div class="param_panel">
        <div class="param_row">
          <div class="param_name">背景色：</div>
          <div class="param_form">
            <input type="text" size="4" name="bgColor" v-model="configData.appearance.bgColor" />
          </div>
        </div>
        <div class="param_row">
          <div class="param_name">背景图：</div>
          <div class="param_form">
            <input type="file" value="test" name="bgImg" ref="bgImg" @change="uploadImg()" />
          </div>
        </div>
        <div class="param_row">
          <div class="param_name"></div>
          <div class="param_form">
            <button type="button" @click="clearImg()">清空</button>
          </div>
        </div>
        <div class="param_row">
          <div class="param_name">背景图模糊：</div>
          <div class="param_form">
            <input type="text" size="2" name="bgBlur" v-model="configData.appearance.bgBlur" />px
          </div>
        </div>
        <div class="param_row">
          <div class="param_name">主题：</div>
          <div class="param_form">
            <select name="theme">
              <option value ="">未选择</option>
              <option value ="vscode">vscode</option>
              <option value ="white">white</option>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  name: 'ConfigAppearance',
  components: {
  },
  data: function() {
    return {
      configData: {
        "appearance": {
            "bgColor": "#455A65",
            "bgImg": null,
            "bgBlur": 0,
            "theme": "vscode"
          }
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
    this.refreshConfig()
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    refreshConfig() {
      this.$axios
        .get('/api/config')
        .then(response => {
          console.log("config===:"+response.data)
          this.configData = response.data
          this.$forceUpdate()
        })
    },
    uploadImg() {
      var imgFile = this.$refs.bgImg.files[0];
      var formData = new FormData()
      formData.append('bgImg', imgFile)
      this.$axios({
        method: 'post',
        url: '/api/config/uploadBgImg',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        this.configData.appearance.bgImg = res.data.data.img_path
      })
    },
    clearImg() {
      this.configData.appearance.bgImg = null;
      this.updateConfig()
    },
    updateConfig() {
      this.$axios.post('/api/config/update', this.configData)
        .then(response => {
          console.log(response.data)
          this.refreshConfig()
          this.$bus.emit('renderBg', this.configData)
        })
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
.config_header {
  display: flex;
  align-items: center;
  height: 24px;
  background-color: rgb(44,44,44);
  color: white;
}
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
.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}

</style>
