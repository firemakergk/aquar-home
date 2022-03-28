<template>
  <div class="batch_panel">
    <div class="param_row">
      <div class="param_form">
        <div style="display: flex; flex-direction: row; align-items:stretch;">
          <div style="width: 0; flex-grow: 1; display: flex; flex-direction: column; margin: 0 4px;">
            <div style="display: flex; flex-direction: row; align-items: center; margin: 4px 0;">
              <div style="flex-grow:1;">主题名称：<input v-model="customTheme.name" type="text" style="width: 120px;" /></div>
              <div>
                <span>重置为：</span>
                <select name="theme"  v-model="baseThemeName">
                  <option value ="">未选择</option>
                  <option value ="defaultLight">default light</option>
                  <option value ="dark">dark</option>
                  <option v-for="(themeName,index) in configData.themes" :key="'theme_'+ index" :value="themeName" >{{themeName}}</option>
                </select>
                <button @click="resetBase()">重置</button>
              </div>
              <div><button @click="submitTheme()">提交</button></div>
            </div>
            <div>
              <!-- <code-mirror v-model="importText" :options="cmOptions" /> -->
              <textarea ref="mycode" class="code_editor" v-model="themeText" style="height:200px;width:600px;"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import codeMirror from './ThemeEditor.vue'
import { mapGetters } from 'vuex'
import * as _ from 'lodash'
import "codemirror/theme/elegant.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import 'codemirror-colorpicker/dist/codemirror-colorpicker.css'
let CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/selection/active-line");
require('codemirror/mode/javascript/javascript');
require("codemirror/addon/lint/json-lint");
require( 'codemirror-colorpicker' );

import defaultLight from '@/assets/themes/defaultlight.json'
import dark from '@/assets/themes/dark.json'

const RE_DATA = /^.+,.+/i
export default {
  name: 'ConfigTheme',
  props: {
    configData: { type: Object, default: () => {} }
  },
  components: {
  },
  data: function() {
    return {
      baseThemeName: this.configData.theme,
      themeText: "",
      editor: null,
      customTheme: {},
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
    this.baseThemeName = this.configData.theme
    this.resetBase()
    this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
      mode: 'text/javascript',
      indentWithTabs: true,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets: true,
      theme: 'elegant',
      colorpicker : {
        mode : 'view',
        type: 'chromedevtool'
      }
    })
    this.$forceUpdate()
  },
  beforeDestroy() {
  },
  methods: {
    async resetBase() {
      if(this.configData.theme !== "defaultLight" && this.configData.theme !== "dark") {
        this.customTheme.name = this.configData.theme
      }else {
        this.customTheme.name = this.configData.theme + "_copy"
      }
      this.customTheme.detail = await this.getDatail(this.baseThemeName)
      let themeText = JSON.stringify(this.customTheme.detail,null, 2)
      this.editor.getDoc().setValue(themeText)
      this.$forceUpdate()
    },
    async getDatail(name) {
      if(name === "defaultLight") {
        return defaultLight 
      }else if(name === "dark") {
        return dark 
      }else {
        let res = await this.$axios
        .get('/api/theme/findOne?name=' + name)
        return res.data.detail
      }
    },
    submitTheme(){
      this.customTheme.detail = JSON.parse(this.editor.getValue())
      this.$axios
        .post('/api/theme/saveOrUpdate', this.customTheme)
        .then(response => {
          this.$bus.emit('refreshAppearance', {theme: this.customTheme.name})
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('接口异常,url:'+error.request.responseURL+',message:'+error.message)
        }) 
    }
  }
}
</script>

<style lang="scss" scoped>
textarea {
  resize: none;
  outline: none;
  border: 1px solid #888; 
  width: 100%;
  height: 240px;
}
.batch_panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  width: 100%;
}

.param_row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 4px 0;
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
  flex-direction: row;
  align-items: center;
}

.code_editor {
    font-size: 11pt;
    font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
  }
</style>
