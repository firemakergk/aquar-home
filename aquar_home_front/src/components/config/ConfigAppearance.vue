<template>
  <div class="config_content">
    <!-- <div class="demo-card__primary">
      <div style="height: 24px; margin: 0 20px; display: flex;">
        <span style="flex-grow: 1;">外观设置:</span>
        
      </div>
    </div> -->
    <!-- <div :class="{'hide':!configTheme, 'config_panel':true}" style="width: 100%;"> -->
    <div v-if="configTheme" style="width: 100%;">
      <div style="display: flex; ">
        <span style="flex-grow: 1;">自定义主题</span>
        <a class="color_main" style="margin: 0 4px;" @click="toggleCustomTheme()" >X</a>
      </div>
      <config-theme :config-data="configData.appearance"></config-theme>
    </div>
    <div v-else >
    <!-- <div :class="{'hide':configTheme, 'config_panel':true}"> -->
      <div  class="mdc-layout-grid" style="width: 100%;">
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-12">
            <aq-textfield :label="'背景色'" v-model="configData.appearance.bgColor"></aq-textfield>
          </div>
        </div>
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-9">
            <div class="aq-textfield mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon" style="width: 100%;">
              <i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button" @click="selectFile()">attachment</i>
              <!-- <span class="mdc-text-field__affix mdc-text-field__affix--prefix" ><span class="material-icons" style="font-size: 18px; text-align: center;">attachment</span></span> -->
              <input type="file" value="test" class="mdc-text-field__input" name="bgImg" ref="bgImg" @change="uploadImg()" style="display: none; opacity: 0;" />
              <div class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading" ></span>
                <!-- <div class="mdc-notched-outline__leading"></div> -->
                <div class="mdc-notched-outline__notch" >
                  <label :for="selectedImg" class="mdc-floating-label">{{selectedImg}}</label>
                </div>
                <span class="mdc-notched-outline__trailing" ></span>
                <!-- <div class="mdc-notched-outline__trailing"></div> -->
              </div>
            </div>
          </div>
          <div class="mdc-layout-grid__cell--span-3" >
            <button class="aq-button mdc-button mdc-button--outlined" style="width: 100%;" @click="clearImg()">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label">清空</span>
            </button>
          </div>
        </div>
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-12">
            <aq-textfield :label="'背景模糊'" v-model="configData.appearance.bgBlur"></aq-textfield>
          </div>
        </div>
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-6" style="width: 100%">
            <!-- <div class="aq-select mdc-select mdc-select--outlined">
              <div class="mdc-select__anchor" 
                aria-labelledby="outlined-select-label"
                role="button"
                aria-haspopup="listbox"
                aria-expanded="false">
                <span class="mdc-notched-outline">
                  <span class="mdc-notched-outline__leading" ></span>
                  <span class="mdc-notched-outline__notch"  >
                    <span id="outlined-select-label" class="mdc-floating-label">主题</span>
                  </span>
                  <span class="mdc-notched-outline__trailing" ></span>
                </span>
                <span class="mdc-select__selected-text-container">
                  <span class="mdc-select__selected-text">esss{{configData.appearance.theme}}</span>
                </span>
                <span class="mdc-select__dropdown-icon">
                  <svg
                      class="mdc-select__dropdown-icon-graphic"
                      viewBox="7 10 10 5" focusable="false">
                    <polygon
                        class="mdc-select__dropdown-icon-inactive"
                        stroke="none"
                        fill-rule="evenodd"
                        points="7 10 12 15 17 10">
                    </polygon>
                    <polygon
                        class="mdc-select__dropdown-icon-active"
                        stroke="none"
                        fill-rule="evenodd"
                        points="7 15 12 10 17 15">
                    </polygon>
                  </svg>
                </span>
              </div>
              <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth">
                <ul class="mdc-list">
                  <li class="mdc-list-item mdc-list-item--disabled" data-value="disabled">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">未选择</span>
                  </li>
                  <li  :class="[{'mdc-list-item--selected': (configData.appearance.theme === 'defaultLight')}, 'mdc-list-item']"  data-value="defaultLight" @click="selectTheme('defaultLight')" >
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">defaultLight</span>
                  </li>
                  <li :class="[{'mdc-list-item--selected': (configData.appearance.theme === 'dark')}, 'mdc-list-item']" data-value="dark" @click="selectTheme('dark')" >
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">dark</span>
                  </li>
                <li class="mdc-list-item" v-for="(themeName,index) in configData.appearance.themes" 
                  
                  :key="'theme_'+ index" @click="selectTheme(themeName)"
                  :class="[{'mdc-list-item--selected': (configData.appearance.theme === themeName)}, 'mdc-list-item']">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">{{themeName}}</span>
                  </li> 
                </ul>
              </div>
            </div> -->
            <div class="mdc-select">
              <i class="mdc-select__dropdown-icon"></i>
              <select class="mdc-select__native-control">
                <option value="" disabled selected></option>
                <option value="grains">
                  Bread, Cereal, Rice, and Pasta
                </option>
                <option value="vegetables">
                  Vegetables
                </option>
                <option value="fruit">
                  Fruit
                </option>
              </select>
              <label class="mdc-floating-label">Pick a Food Group</label>
              <div class="mdc-line-ripple"></div>
            </div>
          </div>
          <div class="mdc-layout-grid__cell--span-3" >
            <button class="aq-button mdc-button mdc-button--outlined" style="width: 100%;" @click="removeTheme()">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label">删除主题</span>
            </button>
          </div>
          <div class="mdc-layout-grid__cell--span-3" >
            <button class="aq-button mdc-button mdc-button--outlined" style="width: 100%;" @click="toggleCustomTheme()">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label">自定义</span>
            </button>
          </div>
        </div>
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-8" style="width: 100%"></div>
          <div class="mdc-layout-grid__cell--span-4" style="width: 100%">
            <button class="aq-button mdc-button mdc-button--raised" style="width: 100%;" @click="updateConfig()">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label">提交</span>
            </button>
          </div>
        </div>
      </div>
    </div>
        
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ConfigTheme from './ConfigTheme.vue'
import AqTextfield from '../form/AqTextfield.vue'

export default {
  name: 'ConfigAppearance',
  components: {
    ConfigTheme,
    AqTextfield
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
      selectedImg: "选择背景图"
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
  },
  mounted: function() {
    this.$nextTick(() => {
        this.$bus.emit('renderMdc',null)
      });
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
      this.$nextTick(() => {
        this.$bus.emit('renderMdc',null)
      });
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
    selectFile() {
      this.$refs.bgImg.click()
    },
    uploadImg() {
      var imgFile = this.$refs.bgImg.files[0];
      var formData = new FormData()
      this.selectedImg = imgFile.name
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
    selectTheme(theme) {
      this.configData.appearance.theme = theme
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
.config_panel {
  margin: 0;
}

.param_panel {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-top: solid #ccc thin;
  font-size: 14px;
}

.hide {
  display: none;
}
.param_row {
  align-items: center;
  width: 100%;
  padding: 8px 0px;
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
