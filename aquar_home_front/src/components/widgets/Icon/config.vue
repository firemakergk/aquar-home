<template>
  <div class="content">
    <v-container class="lighten-5">
      <v-row align="center" dense class="py-2">
        <v-col cols="3" class="d-flex flex-row justify-start">
          <span>ico图标：</span>
          <v-img contain height="20px" max-width="20px" :src="configData.data.ico_path" class="mx-2"></v-img>
        </v-col>
        <v-col cols="2">
          <v-btn depressed small outlined @click="clearIco()" style="margin:0 4px; width: 100%;">
            <v-icon small>mdi-delete</v-icon>
            清空
          </v-btn>
        </v-col>
        <v-col cols="2" >
          <v-btn depressed small outlined @click="refreshIco()" style="margin:0 4px; width: 100%;">
            <v-icon small>mdi-refresh</v-icon>
            重新抓取
          </v-btn>
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12" class="d-flex flex-row justify-start align-start">
          <span>图片图标：</span>
          <div style="display: flex; align-items: stretch;">
            <div class="icon_warp" @mouseover="showUpload=true" @mouseleave="showUpload=false">
              <div v-show="showUpload" class="icon_cover">
                <label class="iconfont icon-upload icon" title="重新上传" style="font-size: 30px;" :for="'upload_icon_'+configData.id" />
                <input :id="'upload_icon_'+configData.id" :ref="'upload_icon_'+configData.id" type="file" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="clipImg($event, 1)">
              </div>
              <img style="width: 100px; height: 100px;" :src="configData.data.img_path">
            </div>
            <!-- <input v-model="curWidget.name" type="text" style="width: 100%;"> -->
            <div>
              <div v-show="showCropper" style=" margin: 0 10px; width: 200px; height: 200px; display: flex; flex-direction: column;">
                <vueCropper
                  :ref="'cropper_'+configData.id"
                  :img="option.img"
                  :outputSize="option.size"
                  :outputType="option.outputType"
                  :info="true"
                  :full="option.full"
                  :canMove="option.canMove"
                  :canMoveBox="option.canMoveBox"
                  :fixedBox="option.fixedBox"
                  :original="option.original"
                  :autoCrop="option.autoCrop"
                  :autoCropWidth="option.autoCropWidth"
                  :autoCropHeight="option.autoCropHeight"
                  :centerBox="option.centerBox"
                  :high="option.high"
                  :infoTrue="option.infoTrue"
                  :maxImgSize="option.maxImgSize"
                  @realTime="realTime"
                  @imgLoad="imgLoad"
                  @cropMoving="cropMoving"
                  :enlarge="option.enlarge"
                  :mode="option.mode"
                  :limitMinSize="option.limitMinSize"/>
                <a :ref="'downloadDom'+configData.id" :href="downImg" style="display: none;" download="demo.png" />
              </div>
              <!-- <div v-show="showCropper" style="margin: 10px;" class="tcolor_main"><a @click="comfirmIcon">确定</a></div> -->
              <v-btn depressed small outlined v-show="showCropper" @click="comfirmIcon" style="margin:4px 4px; width: 50px;">
                <v-icon small>mdi-content-cut</v-icon>
                确定
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-text-field dense hide-details label="标题" v-model="configData.name" ></v-text-field> 
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-text-field dense hide-details label="链接地址" v-model="configData.href" ></v-text-field> 
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-select hide-details dense :items="targetTypeList" label="跳转方式" v-model="configData.data.target_type" ></v-select>
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="6">
          <v-select hide-details dense :items="bgTypeList" label="背景类型" @change="bgTypeChanged()" v-model="configData.data.bg_type" ></v-select>
        </v-col>
        <v-col cols="6" style="display: flex; align-items:flex-end">
          <div>
            <v-icon :style="'color:'+configData.data.bg_color" style="position: relative; bottom: -2px;" >mdi-solid</v-icon>
          </div>
          <div style="flex-grow: 1;">
            <v-text-field :disabled='bgColorDisabled' dense hide-details label="背景色" v-model="configData.data.bg_color" ></v-text-field> 
          </div>
          <div>
            <v-btn :disabled='bgColorDisabled' small icon @click="toggleColorPicker(true)" title="选择颜色">
              <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-palette-outline</v-icon>
              <div v-show="showColorPicker"  style="position: absolute; top: -300px; left: -200px;">
                <v-color-picker mode="hexa" dot-size="12" v-model="configData.data.bg_color"></v-color-picker>
              </div>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12" class="d-flex flex-row justify-start align-center">
          <span>内网地址转换:</span>
          <v-switch dense hide-details true-value="1" false-value="0" v-model="configData.data.addr_translate" :label="` ${configData.data.addr_translate === '0'?'关':'开'}`" style="margin: 0px 0px 0px 8px;"></v-switch>
        </v-col>
      </v-row>
      <v-row v-show="configData.data.addr_translate === '1'" align="center" dense class="py-2">
        <v-col cols="12">
          <v-text-field dense hide-details label="内网地址" v-model="configData.data.private_href" ></v-text-field> 
        </v-col>
      </v-row>
      <v-row justify="end" align="center" dense class="py-2">
        <v-col cols="3">
          <v-btn depressed small color="primary" @click="updateConfig()" style="margin:0 4px; width: 100%;">
            <v-icon small>mdi-check</v-icon>
            提交
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import logo_icon from './img/aquar.png'

const BG_TYPE_NONE = "0"
const BG_TYPE_THEME = "1"
const BG_TYPE_CUST = "2" 
const BG_TYPE_AUTO = "3"

export default {
  name: 'IconWidgetConfig',
  components: {
    VueCropper
  },
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      logo_icon,
      showConfigIcon: false,
      showCropper: false,
      showUpload: false,
      option: {
        img: '',
        size: 1,
        full: false,
        outputType: 'webp',
        canMove: true,
        fixedBox: false,
        original: false,
        canMoveBox: true,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 100,
        autoCropHeight: 100,
        centerBox: false,
        high: false,
        cropData: {},
        enlarge: 1,
        mode: 'contain',
        maxImgSize: 3000,
        limitMinSize: [100, 100],
      },
      previews: {},
      downImg: '#',
      previewStyle1: {},
      targetTypeList: [
        {text:"当前页", value: "_self"},
        {text:"新标签页", value: "_blank"}
      ],
      bgTypeList: [
        {text:"无", value: "0"},
        {text:"跟随主题", value: "1"},
        {text:"自定义", value: "2"}
      ],
      bgColorDisabled: true,
      showColorPicker: false
    }
  },
  computed: {
  },
  created: function() {
    if(this.configData.data.target_type !== '_blank' && this.configData.data.target_type !== '_self'){
      this.configData.data.target_type = '_blank'
    }
    if(!this.configData.data.addr_translate){
      this.configData.data.addr_translate = '0'
    }
    this.bgTypeChanged()
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    imgLoad(msg) {
      console.log(msg)
    },
    // 实时预览函数
    realTime(data) {
      var previews = data
      var h = 0.5
      var w = 0.2
      this.previewStyle1 = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: h
      }
      this.previewStyle2 = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: w
      }
      this.previewStyle3 = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: (100 / previews.w)
      }
      this.previewStyle4 = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: (100 / previews.h)
      }
      this.previews = data
    },
    cropMoving(data) {
      this.option.cropData = data
    },
    clipImg(e) {
      this.showCropper = true
      var file = e.target.files[0]
      if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
        alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
        this.$refs['upload_icon_' + this.configData.id].value = ''
      }
      // 转化为base64
      // reader.readAsDataURL(file)
      // 转化为blob
      reader.readAsArrayBuffer(file)
    },
    comfirmIcon() {
      // event.preventDefault()
      // 输出
      this.$refs['cropper_' + this.configData.id].getCropBlob(data => {
        const formData = new FormData()
        formData.append('icon', data)
        this.$axios({
          method: 'post',
          url: '/api/endpoints/icon/upload',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          this.configData.data.img_path = res.data.data.img_path
          this.$forceUpdate()
          this.showCropper = false
        })
        // this.downImg = window.URL.createObjectURL(data)
        // this.$nextTick(() => {
        //   this.$refs['downloadDom' + this.configData.id].click()
        // })
      })
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.$bus.emit('closeWidgetConfig', null)
      window.location.reload()
      // this.$bus.emit('refreshPage', null)
    },
    clearIco() {
      this.configData.data.ico_path = ''
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
    },
    refreshIco(){
      this.$axios
      .post('/api/endpoints/icon/refreshIco',{tabIndex: this.tabIndex,widget: this.configData})
      .then(response => {
        this.configData.data.ico_path = response.data.data.data.ico_path
      })
    },
    bgTypeChanged(){
      let bgType = this.configData.data.bg_type
      if(!bgType || bgType === BG_TYPE_NONE){
        this.configData.data.bg_color = '#00000000'
        this.bgColorDisabled = true
      }else if(bgType === BG_TYPE_THEME){
        this.configData.data.bg_color = this.$vuetify.theme.current['--tbgcolor_main']
        this.bgColorDisabled = true
      }else if(bgType === BG_TYPE_CUST){
        if(!this.configData.data.bg_color){
          this.configData.data.bg_color = this.$vuetify.theme.current['--tbgcolor_main']
        }
        this.bgColorDisabled = false
      }
    },
    toggleColorPicker(){
      this.showColorPicker = !this.showColorPicker
    }
  }
}
</script>

<style lang="scss" scoped>
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
.content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.param_panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // border-top: solid #ccc thin;
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
  display: flex;
  flex-direction: row;
  align-items: center;
}
.icon_warp {
  position: relative;
  width: 100px;
  height: 100px;
}
.icon_cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(95, 43, 43, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon_panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4px;
}
.img_span {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  // width: 40px;
  height: 40px;
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
</style>
