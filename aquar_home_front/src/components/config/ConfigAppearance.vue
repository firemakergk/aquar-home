<template>
  <div class="config_content">
    <!-- <div class="demo-card__primary">
      <div style="height: 24px; margin: 0 20px; display: flex;">
        <span style="flex-grow: 1;">外观设置:</span>
        <a v-if="configTheme" class="color_main" @click="toggleCustomTheme()" >X</a>
      </div>
    </div> -->
    <div :class="{'hide':!configTheme, 'config_panel':true}" style="width: 100%;">
      <config-theme :config-data="configData.appearance"></config-theme>
    </div>
    <div :class="{'hide':configTheme, 'config_panel':true}">
      <div  class="mdc-layout-grid" style="width: 100%;">
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-12">
            <div class="aq-textfield mdc-text-field mdc-text-field--outlined " style="width: 100%">
              <div class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading" ></span>
                <!-- <span class="mdc-notched-outline__leading"></span> -->
                <div class="mdc-notched-outline__notch">
                  <label for="背景色：" class="mdc-floating-label">背景色</label>
                </div>
                <span class="mdc-notched-outline__trailing"></span>
                <!-- <span class="mdc-notched-outline__trailing"></span> -->
              </div>
              <input type="text" id="firstname" class="mdc-text-field__input" v-model="configData.appearance.bgColor">
            </div>
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
            <div class="aq-textfield mdc-text-field mdc-text-field--outlined " style="width: 100%">
              <div class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading" ></span>
                <!-- <span class="mdc-notched-outline__leading"></span> -->
                <div class="mdc-notched-outline__notch" >
                  <label for="背景模糊" class="mdc-floating-label">背景模糊</label>
                </div>
                <span class="mdc-notched-outline__trailing"></span>
                <!-- <span class="mdc-notched-outline__trailing"></span> -->
              </div>
              <input type="text" id="bgBlur" class="mdc-text-field__input" v-model="configData.appearance.bgBlur">
            </div>
          </div>
        </div>
        <div class="mdc-layout-grid__inner param_row">
          <div class="mdc-layout-grid__cell--span-6" style="width: 100%">
            <div class="aq-select mdc-select mdc-select--outlined">
              <div class="mdc-select__anchor" aria-labelledby="outlined-select-label">
                <span class="mdc-notched-outline">
                  <span class="mdc-notched-outline__leading" ></span>
                  <!-- <span class="mdc-notched-outline__leading"></span> -->
                  <span class="mdc-notched-outline__notch"  >
                    <span id="outlined-select-label" class="mdc-floating-label">主题</span>
                  </span>
                  <span class="mdc-notched-outline__trailing" ></span>
                  <!-- <span class="mdc-notched-outline__trailing"></span> -->
                </span>
                <span class="mdc-select__selected-text-container">
                  <span id="demo-selected-text" class="mdc-select__selected-text"></span>
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
                  <li class="mdc-list-item" data-value="defaultLight" @click="selectTheme('defaultLight')">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">defaultLight</span>
                  </li>
                  <li class="mdc-list-item" data-value="dark" @click="selectTheme('dark')">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">dark</span>
                  </li>
                <li class="mdc-list-item" v-for="(themeName,index) in configData.appearance.themes" :key="'theme_'+ index" :data-value="themeName" @click="selectTheme(themeName)">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">{{themeName}}</span>
                  </li> 
                </ul>
              </div>
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
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';


var textField = null;

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
    this.initmdc()
  },
  beforeDestroy() {
    this.$bus.off('refreshAppearance', this.refreshAppearance)
  },
  methods: {
    initmdc(){
      let textFields = document.querySelectorAll('.mdc-text-field');
      for (let textField of textFields) {
        MDCTextField.attachTo(textField);
      }
      let selects = document.querySelectorAll('.mdc-select');
      for (let select of selects) {
        MDCSelect.attachTo(select);
      }
    },
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
      this.$nextTick(() => {
        this.configTheme = !this.configTheme
        this.initmdc()
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

//https://material-components.github.io/material-components-web-catalog/#/component/text-field?type=filled
//https://material.io/develop/web/supporting/layout-grid
@use "@material/layout-grid/mdc-layout-grid";
@use '@material/button/mdc-button';
@use '@material/button';
@use "@material/floating-label/mdc-floating-label";
@use "@material/line-ripple/mdc-line-ripple";
@use "@material/notched-outline/mdc-notched-outline";
@use "@material/textfield";
@use "@material/card";
@use "@material/list/mdc-list";
@use "@material/menu-surface/mdc-menu-surface";
@use "@material/menu/mdc-menu";
@use "@material/select/styles";
@use "@material/select";


.demo-width-class {
  width: 400px;
}

@include card.core-styles;
@include textfield.core-styles;

.aq-button {
  @include button.height(32px);
}

.aq-textfield {
  @include textfield.outlined-height(32px);
  @include textfield.outline-shape-radius(0px);
}

.aq-textfield .mdc-notched-outline__leading {
  border-top: none;
  border-left: none;
}

.aq-textfield .mdc-notched-outline__notch {
  border-top: none;
}

.aq-textfield .mdc-notched-outline__trailing {
  border-top: none;
  border-right: none;
}

.aq-select {
  @include select.outlined-height(32px);
  @include select.outline-shape-radius(0px);
}

.aq-select .mdc-notched-outline__leading {
  border-top: none;
  border-left: none;
}

.aq-select .mdc-notched-outline__notch {
  border-top: none;
}

.aq-select .mdc-notched-outline__trailing {
  border-top: none;
  border-right: none;
}

.filled-textfield {
  // @include textfield.height(40px);
  @include textfield.density(-2);
} 

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
