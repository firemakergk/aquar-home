<template>
  <div class="config_content">
    <!-- <div style="height: 24px; margin: 0 20px; display: flex;">
      <span style="flex-grow: 1;">外观设置:</span>
      <a v-if="configTheme" class="color_main" @click="toggleCustomTheme()" >X</a>
    </div> -->
    <div class="config_panel">
      <div v-if="configTheme" class="param_panel">
        <config-theme :config-data="configData.appearance"></config-theme>
      </div>
      <div v-else class="param_panel">
        <v-container class="lighten-5">
          <v-row align="center" dense class="py-2">
            <v-col cols="12">
              <v-text-field dense hide-details label="背景色" v-model="configData.appearance.bgColor" ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="center" dense class="py-2">
            <v-col cols="9">
              <v-file-input dense hide-details accept="image/*" prepend-icon="" prepend-inner-icon="mdi-image" label="背景图" name="bgImg" ref="bgImg" @change="uploadImg"></v-file-input>
            </v-col>
            <v-col cols="3">
              <v-btn depressed small outlined @click="clearImg()" style="margin:0 6px; width: 100%;">清空</v-btn>
            </v-col>
          </v-row>
          <v-row align="center" dense class="py-2">
            <v-col cols="12">
              <v-text-field hide-details dense label="背景模糊" v-model="configData.appearance.bgBlur" size="2" name="bgBlur" ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="center" dense class="py-2">
            <v-col cols="6">
              <v-select hide-details dense :items="themeList" label="主题" v-model="configData.appearance.theme" ></v-select>
            </v-col>
            <v-col cols="3">
              <v-btn depressed small outlined @click="removeTheme()" style="margin:0 4px; width: 100%;">删除当前主题</v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn depressed small outlined @click="toggleCustomTheme()" style="margin:0 4px; width: 100%;">自定义</v-btn>
            </v-col>
          </v-row>
          <v-row justify="end" align="center" dense class="py-2">
            <v-col cols="4">
              <v-btn depressed small color="primary" @click="updateConfig()" style="margin:0 4px; width: 100%;">提交</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ConfigTheme from './ConfigTheme.vue'


export default {
  name: 'ConfigAppearance',
  components: {
    ConfigTheme
  },
  data: function() {
    return {
      configTheme: false,
      manageTheme: false,
      themeDetail: null,
      configData: {
        "appearance": {
            "bgColor": "#455A65",
            "bgImg": null,
            "bgBlur": 0,
            "theme": "vscode"
          }
      },
      themeInitList: [
        {text:"defaultLight", value: "defaultLight"},
        {text:"dark", value: "dark"}
      ],
      themeList: []
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
    this.refreshConfig()
    this.$bus.on('refreshAppearance', this.refreshAppearance)
    this.$bus.on('toggleCustomTheme', this.toggleCustomTheme)
  },
  mounted: function() {
  },
  beforeDestroy() {
    this.$bus.off('refreshAppearance', this.refreshAppearance)
    this.$bus.off('toggleCustomTheme')
  },
  methods: {
    refreshConfig() {
      this.$axios
        .get('/api/config')
        .then(response => {
          let {config, themeDetail} = response.data
          this.configData = config
          this.themeDetail = themeDetail
          this.themeList = []
          for(let theme of this.themeInitList){
            this.themeList.push(theme)
          }
          if(this.configData.appearance.themes){
            
            for(let theme of this.configData.appearance.themes){
              this.themeList.push({text:theme, value:theme})
            }
          }
          this.$forceUpdate()
        })
    },
    toggleCustomTheme() {
      this.configTheme = !this.configTheme
    },
    removeTheme() {
      let themeName = this.configData.appearance.theme
      if(!themeName){
        return
      }
      if(themeName === 'defaultLight' || themeName === 'dark') {
        alert('内置主题无法删除')
        return
      }
      if(!confirm(`确认删除主题${themeName}？`)){
        return
      }
      this.$axios.post('/api/theme/remove', {name: themeName})
      .then(response => {
          console.log(response.data)
          this.configData.appearance.theme = 'defaultLight'
          this.updateConfig()
        })
    },
    uploadImg(file) {
      var imgFile = file;
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
          // this.$bus.emit('renderBg', {config: this.configData,themeDetail:this.themeDetail})
          window.location.reload()
        })
    },
    async refreshAppearance(appearance){
      if(appearance){
        Object.assign(this.configData.appearance, appearance)
        await this.$axios.post('/api/config/update', this.configData)
      }
      this.refreshConfig()
      // this.$bus.emit('renderBg', {config: this.configData,themeDetail:this.themeDetail})
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.config_content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
