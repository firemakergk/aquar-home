<template>
  <div class="batch_panel">
    <div class="param_form">
      <div style="display: flex; flex-direction: row; align-items:stretch;">
        <div style="width: 0; flex-grow: 1; display: flex; flex-direction: column; margin: 0 4px;">
          <v-container class="pa-0">
            <v-row align="end" dense class="py-2 ">
              <v-col cols="4">
                <v-text-field  hide-details="true" label="主题名称" height="30" v-model="customTheme.name" class="py-0 my-0" ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-select hide-details="true" dense :items="themeList" label="重置为" ></v-select>
              </v-col>
              <v-col cols="2">
                <v-btn depressed small outlined @click="resetBase()" style="margin:0 2px; width: 100%;">重置</v-btn>
              </v-col>
              <v-col cols="2">
                <v-btn depressed small color="primary" @click="submitTheme()" style="margin:0 2px; width: 100%;">提交</v-btn>
              </v-col>
              <v-col cols="1">
                <v-btn icon small color="primary" @click="back()" style="margin:0 2px; width: 100%;" title="返回" ><v-icon>mdi-arrow-left-top-bold</v-icon></v-btn>
              </v-col>
            </v-row>
          </v-container>
          <!-- <div style="display: flex; flex-direction: row; align-items: center; margin: 4px 0;">
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
          </div> -->
          <div>
            <!-- <code-mirror v-model="importText" :options="cmOptions" /> -->
            <textarea ref="mycode" class="code_editor" v-model="themeText" style="height:200px;width:600px;"></textarea>
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

// import light from '@/assets/themes/light.json'
// import dark from '@/assets/themes/dark.json'

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
      themeInitList: [
        {text:"light", value: "light"},
        {text:"dark", value: "dark"}
      ],
      themeList: [],
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
    this.themeList = []
    for(let theme of this.themeInitList){
      this.themeList.push(theme)
    }
    if(this.configData.themes){
      for(let theme of this.configData.themes){
        this.themeList.push({text:theme, value:theme})
      }
    }
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
        return null
      }else {
        let res = await this.$axios
        .get('/api/theme/findOne?name=' + name)
        return res.data.detail
      }
    },
    back(){
      this.$bus.emit('toggleCustomTheme')
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
