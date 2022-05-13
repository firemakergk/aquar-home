<template>
  <div class="config_content">
    <div style="height: 24px; margin: 0 20px; display: flex;">
      <span style="flex-grow: 1;">外观设置:</span>
      <a v-if="configTheme" class="color_main" @click="toggleCustomTheme()" >X</a>
    </div>
    <div class="config_panel">
      <div v-if="configTheme" class="param_panel">
        <config-theme :config-data="configData.appearance"></config-theme>
      </div>
      <div v-else class="param_panel">
        <div class="param_row">
          <v-text-field dense label="背景色" v-model="configData.appearance.bgColor" ></v-text-field>
        </div>
        <div class="param_row">
          <v-file-input dense accept="image/*" label="背景图" name="bgImg" ref="bgImg" @change="uploadImg()"></v-file-input>
          <v-btn depressed small @click="clearImg()" style="margin:0 6px;">清空</v-btn>
        </div>
        <div class="param_row">
           <v-text-field dense label="背景模糊" v-model="configData.appearance.bgBlur" size="2" name="bgBlur" ></v-text-field>
        </div>
        <div class="param_row">
           <!-- <v-select :items="themeList" item-text="themeName" item-value="themeName" label="主题" ></v-select> -->
           <v-select :items="['aaa','bbb']" label="主题" ></v-select>
          <div class="param_name">主题：</div>
          <div class="param_form">
            <div style="display: flex; align-items: center;">
              <div>
                <select name="theme"  v-model="configData.appearance.theme">
                  <option value ="">未选择</option>
                  <option value ="defaultLight">default light</option>
                  <option value ="dark">dark</option>
                  <option v-for="(themeName,index) in configData.appearance.themes" :key="'theme_'+ index" :value="themeName" >{{themeName}}</option>
                </select>
              </div>
              <div style="margin: 2px;">
                <button @click="removeTheme()">删除当前主题</button>
              </div>
              <div style="margin: 2px;">
                <button @click="toggleCustomTheme()">自定义</button>
              </div>
            </div>
            
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
      themeList: [
        {themeName:"defaultLight"},
        {themeName:"dark"},
      ]
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
    if(this.configData.appearance.themes){
      for(let theme of this.configData.appearance.themes){
        this.themeList.push(theme)
      }
    }
  },
  mounted: function() {
  },
  beforeDestroy() {
    this.$bus.off('refreshAppearance', this.refreshAppearance)
  },
  methods: {
    refreshConfig() {
      this.$axios
        .get('/api/config')
        .then(response => {
          let {config, themeDetail} = response.data
          this.configData = config
          this.themeDetail = themeDetail
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
  padding:16px 4px;
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
