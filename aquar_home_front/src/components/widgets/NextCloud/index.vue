<template>
  <div class="widget_box">
    <div class="clearfix widget_header">
      <img style="height:20px; " src="./img/nextcloud.png">
      <a style="padding: 0 10px;" target="_blank" :href="configData.href">{{ configData.name }}</a>
      <span style="flex-grow: 1;" />
      <a style="padding: 0 0px;" class="iconfont icon-cog-fill icon tcolor_sub " title="设置" @click="toggleConfig()" />
    </div>
    <div class="widget_body">
      <div v-show="showInit" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;" >设置</span>
        </div>
        <div class="config_body">
          <div class="init_config">
            <div v-if="!loginData" style="margin: 10px 4px;">
              <a @click="getLoginUrl">授权{{ configData.data.server }}的nextcloud服务</a>
            </div>
            <div v-if="loginData && !showPoll" style="font-size: 10px; width: 100%;">
              <div style="margin: 10px;font-size: 16px;">点击下方链接前往nextcloud进行授权</div>
              <div>
                <a style="word-wrap:break-word;" @click="gotoLogin">{{ loginData.login }}</a>
              </div>
            </div>
            <div v-show="showPoll" style="margin: 10px;">
              <span style="margin: 10px;"><a @click="getLoginUrl" >重新授权</a></span>
              <span style="margin: 10px;"><a style="margin: 10px;" @click="poll" class="tcolor_main">授权成功</a></span>
            </div>
          </div>
        </div>
      </div>
      <div v-show="showErrorInfo" class="error_info tbgcolor_mask_error">
        <div style="width: 100%; height: 80px;  display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span  class="iconfont icon-times-circle-fill icon" style="font-size: 24px;"></span>
          <span  style="font-size: 24px;">连接失败</span>
        </div>
        <div style="padding: 0 2px; word-wrap:break-word; display: flex; flex-direction: column; justify-content: center;align-items: center;">
          <span>{{ errorInfo }}</span>
        </div>
      </div>
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <a style="padding:0 4px; " @click="toggleConfig()" class="tcolor_sub_head"> x </a>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div class="config_text">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" name="name">
            </div>
          </div>
          <div class="config_row">
            <div class="config_text">链接地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.href" type="text" name="href">
            </div>
          </div>
          <div class="config_row">
            <div class="config_text">服务地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.server" type="text">
            </div>
          </div>
          <div class="config_row">
            <div class="config_text">帐户名：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.user_name" type="text">
            </div>
          </div>
          <div class="config_row">
            <div class="config_text">apppassword：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.app_password" type="text">
            </div>
          </div>
          <div class="config_row">
            <div class="config_text">默认地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.default_path" type="text">
            </div>
          </div>
          <div class="config_row">
            <div style="width:100px;" />
            <div style="flex-grow: 5;">
              <button @click="updateConfig" >确定</button>
            </div>
          </div>  
        </div>
      </div>
      <div class="widget_content">
        <div class="explorer_header">
          <span class="path_span">
            <input v-model="path" type="text" class="tbgcolor_config tcolor_main" style="width:100%; height: 20px; font-size: 8px; " >
          </span>
          <span class="button_span">
            <a :class="[{'a_disabled tcolor_disable': (!refreshEnable)}, 'iconfont icon-search icon tcolor_sub']" style="margin: 0 4px;" title="转到" @click="refreshView(false)" />
            <a :class="[{'a_disabled tcolor_disable': (!refreshEnable)}, 'iconfont icon-reply icon tcolor_sub']" style="margin: 0 4px;" title="上级菜单" @click="refreshView(true)" />
            <a v-if="viewType==='block'" style="margin: 0 4px; float:right; " class="iconfont icon-menu icon tcolor_sub" title="列表视图" @click="changeViewType('list')" />
            <a v-else-if="viewType==='list'" style="margin: 0 4px; float:right;" class="iconfont icon-icon-drag icon tcolor_sub" title="预览视图" @click="changeViewType('block')" />
          </span>
        </div>
        <div v-if="viewType==='block'" class="explorer_content_block">
          <div v-for="(item,index) in queryData" :key="'file_'+ index" class="block_base">
            <div class="block_content">
              <div v-if="contentType(item.content_type) === 'img' && item.thumb">
                <img :src="'data:image/jpeg;base64,'+item.thumb">
              </div>
              <div v-else-if="contentType(item.content_type) === 'img' && !item.thumb">
                <img src="./img/img.png">
              </div>
              <div v-else-if="contentType(item.content_type) === 'dir'">
                <img src="./img/dir.png">
              </div>
              <div v-else>
                <img src="./img/file.png">
              </div>
            </div>
            <div class="block_foot text_overflow">
              <div>
                <a v-if="contentType(item.content_type) === 'dir'" style="word-wrap:break-word;" @click="toPath(item.href)">{{ item.file_name }}</a>
                <a v-else @click="download(item.href)">{{ item.file_name }}</a>
              </div>
              <div style="color: #999; font-size: 8px;">{{ item.modified_time.replace(/T/,' ').replace(/\.\d+?Z/,'') }}</div>
            </div>
          </div>
        </div>
        <div v-if="viewType==='list'" class="explorer_content_list">
          <div v-for="(item,index) in queryData" :key="'file_'+ index" class="list_base">
            <span v-if="contentType(item.content_type) === 'img'" style="margin-right: 4px;" class="iconfont icon-picture-fill icon tcolor_main" />
            <span v-else-if="contentType(item.content_type) === 'dir'" style="margin-right: 4px;" class="iconfont icon-folder-fill icon tcolor_main" />
            <span v-else style="margin-right: 4px;" class="iconfont icon-file-fill icon tcolor_main" />
            <div class="file_text">
              <a v-if="contentType(item.content_type) === 'dir'" style="word-wrap:break-word;" @click="toPath(item.href)">{{ item.file_name }}</a>
              <a v-else @click="download(item.href)">{{ item.file_name }}</a>
            </div>
            <div style="color: #999; font-size: 8px; margin: 0 10px; flex-shrink:0;">{{ fileSize(item.size) }}</div>
            <div style="color: #999; font-size: 8px; flex-shrink:0;">{{ item.modified_time.replace(/T/,' ').replace(/\.\d+?Z/,'') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NextCloudWidget',
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      showInit: true,
      showConfig: false,
      showErrorInfo: false,
      errorInfo: null,
      loginData: null,
      showPoll: false,
      queryData: [],
      path: '',
      viewType: 'list',
      refreshEnable: true
    }
  },
  created: function() {
    this.init()
  },
  destroyed: function() {
  },
  methods: {
    init() {
      this.showInit = !this.configData.data.app_password
      if (this.configData.data.app_password) {
        this.path = this.configData.data.default_path
        this.queryData = this.queryFileList(this.configData.data.default_path)
        this.viewType = this.configData.data.view_type
      }
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    getLoginUrl() {
      this.$axios
        .get('/api/endpoints/nextcloud/login?server=' + this.configData.data.server)
        .then(response => {
          this.loginData = response.data.data
          this.showPoll = false
          this.showErrorInfo = false
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('接口异常,url:'+error.request.responseURL+',message:'+error.message)
        })
    },
    gotoLogin() {
      this.showPoll = true
      window.open(this.loginData.login)
    },
    poll() {
      this.$axios
        .get('/api/endpoints/nextcloud/poll?server=' + this.configData.data.server + '&token=' + this.loginData.poll.token)
        .then(response => {
          console.log(response)
          if(response.data.code!=0){
            this.showErrorInfo = true
          }
          this.configData.data.user_name = response.data.data.loginName
          this.configData.data.app_password = response.data.data.appPassword
          this.configData.data.default_path = response.data.data.loginName
          this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
          this.showPoll = false
          this.showInit = false
          this.showErrorInfo = false
          this.init()
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('接口异常,url:'+error.request.responseURL+',message:'+error.message)
        })
    },
    contentType(contentType) {
      if (!contentType) {
        return contentType
      }
      if (contentType.match(/^image\/(gif|jpg|jpeg|png)/g)) {
        return 'img'
      } else if (contentType.match('dir')) {
        return 'dir'
      } else {
        return contentType
      }
    },
    fileSize(byteSize) {
      if (!byteSize) {
        return 'DIR'
      }
      var resNum = 0
      var postfix = 'B'
      if (byteSize < 1024) {
        resNum = byteSize
      } else if (byteSize > 1024 && byteSize <= 1048576) {
        resNum = byteSize / 1024
        postfix = 'K'
      } else if (byteSize > 1048576 && byteSize <= 1073741824) {
        resNum = byteSize / 1048576
        postfix = 'M'
      } else if (byteSize > 1073741824 && byteSize <= 1073741824) {
        resNum = byteSize / 1073741824
        postfix = 'G'
      } else {
        resNum = byteSize / 1073741824
        postfix = 'G'
      }
      return Math.round(resNum).toString() + postfix
    },
    queryFileList(path) {
      var finalPath = path || this.configData.data.default_path
      const reqData = { server: this.configData.data.server, path: finalPath, username: this.configData.data.user_name, apppassword: this.configData.data.app_password }
      this.$axios
        .post('/api/endpoints/nextcloud/query', reqData)
        .then(response => {
          this.queryData = response.data.data
          this.showErrorInfo = false
          if (this.viewType === 'block') {
            this.getThumbnailBatch()
          }
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
          console.log('接口异常,url:'+error.request.responseURL+',message:'+error.message)
        })
    },
    async getThumbnailBatch() {
      var plist = []
      for (var i = 0; i < this.queryData.length; i++) {
        var item = this.queryData[i]
        if (!item.href.match(/(gif|jpg|jpeg|png)$/)) {
          continue
        }
        var url = this.configData.data.server + '/remote.php/dav/files/' + item.href
        const reqData = { url: url, index: i, username: this.configData.data.user_name, apppassword: this.configData.data.app_password }
        var p = this.$axios
          .post('/api/endpoints/nextcloud/thumbnail', reqData)
          .then(response => {
            const resData = response.data
            this.showErrorInfo = false
            if (!resData.data) {
              return
            }
            this.queryData[reqData.index].thumb = resData.data
            this.$forceUpdate()
          })
          .catch(error => {
            this.showErrorInfo = true
            this.errorInfo = error.message
            console.log('接口异常,url:'+error.request.responseURL+',message:'+error.message)
          })
        plist.push(p)
        if (plist.length >= 5) {
          await Promise.all(plist)
          plist = []
        }
      }
    },
    changeViewType(value) {
      this.viewType = value
      if (this.viewType === 'block') {
        this.getThumbnailBatch()
      }
    },
    refreshView(gotoParent) {
      this.refreshEnable = false
      var timer = setInterval(() => {
        this.refreshEnable = true
        clearInterval(timer)
      }, 500)
      if (gotoParent) {
        if ((this.path.length - 1) === this.path.lastIndexOf('/')) {
          this.path = this.path.substring(0, this.path.length - 1)
        }
        if (this.path.match(/\//g)) {
          this.path = this.path.substring(0, this.path.lastIndexOf('/') + 1)
        }
      }
      this.queryFileList(this.path)
    },
    toPath(href) {
      this.path = href
      this.queryFileList(this.path)
    },
    download(href) {
      this.$axios({
        method: 'post',
        url: '/api/endpoints/nextcloud/download',
        data: {
          url: this.configData.data.server + '/remote.php/dav/files/' + href,
          username: this.configData.data.user_name,
          apppassword: this.configData.data.app_password
        },
        responseType: 'blob'
      })
        .then(response => {
          const blob = new Blob([response.data])
          const fileName = href.substring(0, href.length).replace(/^.*[\\/]/, '')
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        })
        .catch(
          reason => {
            console.log(reason)
          })
    }
  }
}
</script>

<style lang="scss" scoped>

.explorer_header {
  display: flex;
  // flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
  height: 30px;
}
.path_span {
  width: 100%;
  flex-grow: 1;
}
.button_span {
  font-size: 8px;
  // flex-grow: 1;
  width: 120px;
}
.explorer_content_block {
  margin: 4px;
  position: absolute;
  top: 28px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start;
  // min-height: 200px;
  // height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.explorer_content_list {
  margin: 4px;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
}

.block_base {
  margin: 4px;
  height: 140px;
  width: 100px;
  font-size: 14px;
  flex-shrink:1;
}
.block_content {
  height: 100px;
  width: 100px;
}
.block_foot {
  height: 40px;
  width: 100px;
}
.list_base {
  margin: 2px;
  height: 20px;
  width: 100%;
  padding-right: 2px;
  display: flex;
  font-size: 12px;
  align-items: center;
  overflow: hidden;
  flex-shrink:0;
}
.file_text {
  flex-grow: 1;
  flex-shrink:1; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text_overflow {
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}

.config_text {
  width:100px;
  text-align: right;
  padding: 0 4px;
}

.a_disabled {
  pointer-events: none;
}
</style>
