<template>
  <div class="content">
    <div class="param_panel">
      <div class="param_row">
        <div class="param_name">图标图片：</div>
        <div class="param_form">
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
              <div v-show="showCropper" style="margin: 10px; color: rgb(44,44,44);"><a @click="comfirmIcon">确定</a></div>
            </div>
            
          </div>
        </div>
      </div>
      <div class="param_row">
        <div class="param_name">名称：</div>
        <div class="param_form">
          <input v-model="configData.name" style="width: 100%;">
        </div>
      </div>
      <div class="param_row">
        <div class="param_name">链接地址：</div>
        <div class="param_form">
          <input v-model="configData.href" style="width: 100%;">
        </div>
      </div>
      <div class="param_row">
        <div class="param_name"></div>
        <div class="param_form">
          <a class="iconfont icon-check icon" style="color: white;" title="确定" @click="updateConfig" />
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
</template>

<script>
import { VueCropper } from 'vue-cropper'
import logo_icon from './img/aquar.png'
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
        limitMinSize: [100, 100]
      },
      previews: {},
      downImg: '#',
      previewStyle1: {}
    }
  },
  computed: {
  },
  created: function() {
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
.content {
  padding: 10px;
  display: flex;
  flex-direction: column;
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
