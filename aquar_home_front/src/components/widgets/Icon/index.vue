<template>
  <div class="container">
    <div class="icon_panel">
      <div class="img_span" @mouseover="showConfigIcon=true" @mouseleave="showConfigIcon=false">
        <div style="flex-grow: 1; width: 8px;" />
        <a target="_blank" :href="configData.href">
          <img v-if="configData.data.img_path" :src="configData.data.img_path" style=" flex-grow: 1; width: 40px;">
          <img v-else :src="logo_icon" style=" flex-grow: 1; width: 40px;">
        </a>
        <div style="flex-grow: 1; width: 8px;">
          <a v-show="showConfigIcon" class="iconfont icon-cog-fill icon" style="color: rgba(255,255,255,0.3); font-size: 6px; " title="设置" @click="toggleConfig" />
        </div>
      </div>
      <a target="_blank" :href="configData.href" style="text-align: center; color: white;">{{ configData.name }}</a>
    </div>
    <div v-show="showConfig" :class="['float_config', {high_height:(showCropper)}]">
      <div class="config_top">
        <span style="float:left; flex-grow: 1;">设置</span>
        <a class="iconfont icon-times icon" @click="toggleConfig" />
      </div>
      <div class="config_row">
        <div class="config_name">
          图标图片：
        </div>
        <div class="config_form">
          <div class="icon_warp" @mouseover="showUpload=true" @mouseleave="showUpload=false">
            <div v-show="showUpload" class="icon_cover">
              <label class="iconfont icon-upload icon" title="重新上传" style="font-size: 30px;" :for="'upload_icon_'+configData.id" />
              <input :id="'upload_icon_'+configData.id" :ref="'upload_icon_'+configData.id" type="file" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="clipImg($event, 1)">
            </div>
            <img style="width: 100px; height: 100px;" :src="configData.data.img_path">
          </div>
          <!-- <input v-model="curWidget.name" type="text" style="width: 100%;"> -->
          <div v-show="showCropper" style="width: 200px; height: 240px; display: flex; flex-direction: column;">
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
            <div style="margin: 10px; color: white;"><a @click="comfirmIcon">确定</a></div>
          </div>
        </div>
      </div>
      <div class="config_row">
        <div class="config_name">
          名称：
        </div>
        <div class="config_form">
          <input v-model="configData.name" style="width: 100%;">
        </div>
      </div>
      <div class="config_row">
        <div class="config_name">
          链接地址：
        </div>
        <div class="config_form">
          <input v-model="configData.href" style="width: 100%;">
        </div>
      </div>
      <div class="config_row">
        <div class="config_name" />
        <div class="config_form">
          <a class="iconfont icon-check icon" style="color: white;" title="确定" @click="updateConfig" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import logo_icon from './img/aquar.png'
export default {
  name: 'IconWidget',
  components: {
    VueCropper
  },
  props: {
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      logo_icon,
      showConfigIcon: false,
      showConfig: false,
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
        limitMinSize: [100, 120]
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
    toggleConfig() {
      this.showConfig = !this.showConfig
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
        axios({
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
      this.$bus.emit('update', this.configData)
      this.showConfig = false
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
.container {
  width: 100%;
  height: 100%;
}
.float_config {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  height: 240px;
  width: 300px;
  background-color: rgba(44,44,44,1);
  border: solid thin white;
  display: flex;
  flex-direction: column;
  z-index: 99;
}

.high_height {
  height: 480px;
}
.config_top {
  display: flex;
  align-items: center;
  background-color: #000;
  color: #FFF;
  padding: 4px;
  height: 24px;
  top: 0;
}
.config_row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 4px 2px;

}
.config_name {
  width: 120px;
  margin: 4px;
  text-align: right;
  color: white;
}
.config_form {
  width: 100%;
  margin:0 4px;
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
.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}

</style>
