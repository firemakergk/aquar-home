<template>
  <div class="search_container" @mouseover="showConfigIcon=true" @mouseleave="showConfigIcon=false">
    <div style="position: absolute; z-index: 4; top:50px; left:90px;right: 50px; display: flex; flex-direction: column;" class="tbgcolor_main tcolor_main">
      <div style="display: flex; flex-direction: row-reverse;" v-show="suggests && suggests.length>0">
        <a style="margin: 0 8px;" @click="closeSuggest()">X</a>
      </div>
      <a v-for="(sugword,index) in suggests" :key="index" :class="selectedIndex===index? 'tbgcolor_info tcolor_reverse': ''" style="display:block; margin: 4px;" @click="search(sugword)" @mouseover="suggestMove(null,index)">{{sugword}}</a>
    </div>
    <div class="search_panel tbgcolor_main">
      <div style="flex-grow:0; flex-shrink: 0; width: 100px;" >
        <v-select hide-details dense :items="sourceList" v-model="configData.data.source" @change="changeSource()"  ></v-select>
      </div>
      <v-divider style="margin: 2px 0;" vertical></v-divider>
      <div style="flex-grow:1; flex-shrink: 1;" >
        <v-text-field dense hide-details prepend-inner-icon="mdi-blank" type="text" class="search_input tbgcolor_main tcolor_main" autofocus="autofocus" placeholder="输入要搜索的内容" 
        :style="{backgroundImage: 'url('+ require('./img/' + configData.data.source + '.png') +')'  }" 
        v-model="searchText" @keyup.enter="search()" @keyup.up="suggestMove(-1,null)" @keyup.down="suggestMove(1,null)" @input="prepareSuggest()" ></v-text-field>
      </div>
      <v-btn icon @click="search()" class="ml-2" title="搜索">
        <v-icon class="tcolor_primary" style="font-size:32px;" >mdi-magnify</v-icon>
      </v-btn>
      <!-- <button class="iconfont icon-search icon tcolor_main tbgcolor_main" @click="search()"></button> -->
      <div style="position:absolute; right: 12px; top: 2px; width: 8px; opacity: 40%;">
        <!-- <a v-show="showConfigIcon" class="iconfont icon-cog-fill icon tcolor_main" style=" font-size: 6px; opacity:0.2;" title="设置" @click="toggleConfig" /> -->
        <v-btn v-show="showConfigIcon" icon x-small @click="toggleConfig()" title="设置">
          <v-icon class="tcolor_primary" style="font-size:12px;" >mdi-cog</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchWidget',
  components: {
  },
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      source:{
        baidu:{
          name:'百度',
          url:'https://www.baidu.com/s?wd={{}}'
        },
        google:{
          name:'谷歌',
          url:'https://www.google.com/search?q={{}}'
        },
        bing:{
          name:'必应',
          url:'https://cn.bing.com/search?q={{}}'
        }
      },
      sourceList: [
        {text:"百度", value: "baidu"},
        {text:"Bing", value: "bing"},
        {text:"Google", value: "google"}
      ],
      showConfigIcon: false,
      searchText:'',
      lastSign: null,
      suggests:[],
      selectedIndex: null,
    }
  },
  computed: {
  },
  created: function() {
    if(this.configData.data.target_type !== '_blank' && this.configData.data.target_type !== '_self'){
      this.configData.data.target_type = '_blank'
    }
  },
  mounted: function() {
    
  },
  beforeDestroy() {
  },
  methods: {
    changeSource(){
      const reqData = { tabIndex:this.tabIndex, id: this.configData.id, source: this.configData.data.source }
      this.$axios.post('/api/endpoints/search/changeSource', reqData)
        .then(response => {})
    },
    search(word) {
      if(word){
        this.searchText = word
      }
      this.suggests = []
      var searchUrl = this.source[this.configData.data.source].url.replace('{{}}',this.searchText)
      if(this.configData.data.target_type === '_self'){
        window.location.assign(searchUrl)
      }else{
        window.open(searchUrl)
      }
      this.selectedIndex == null
    },
    suggestMove(step,toIndex) {
      if(step){
        if(this.selectedIndex == null){
          this.selectedIndex = -1
        }
        let tempIndex = this.selectedIndex + step
        if(tempIndex < 0){
          this.selectedIndex = 0
        }else if(tempIndex > this.suggests.length-1){
          this.selectedIndex = this.suggests.length-1
        }else{
          this.selectedIndex = tempIndex
        }
      }else if(toIndex != null){
        this.selectedIndex = toIndex
      }else {
        this.selectedIndex = null
      }
      if(this.selectedIndex >= 0 && this.selectedIndex < this.suggests.length){
        this.searchText = this.suggests[this.selectedIndex]
      }
      
    },
    prepareSuggest(){
      var sign = Math.floor(Math.random() * 1000000)
      this.lastSign = sign
      setTimeout(()=>{this.checkSuggest(sign)},500)
    },
    checkSuggest(sign){
      if(this.lastSign && sign === this.lastSign){
        this.suggest()
      }
    },
    suggest() {
      this.$axios
        .get('/api/endpoints/search/suggest?source=' + this.configData.data.source+'&word='+this.searchText ,{timeout:1000})
        .then(response => {
          this.suggests = response.data.data
        })
        .catch(error => {
          this.showErrorInfo = true
          this.errorInfo = error.message
        })
    },
    closeSuggest() {
      this.suggests = []
    },
    toggleConfig() {
      this.$bus.emit('configWidget',  {'widgetType':'SearchWidgetConfig','widgetName':'搜索','tabIndex':this.tabIndex,'configData':this.configData})
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  padding: 2px 4px;
  width: 48px;
  font-size: 20px;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  border: 0px solid transparent;
}
.search_input {
  // margin: 0;
  background-image: url('./img/baidu.png');
  background-repeat: no-repeat;
  background-position: 2px;
  background-size: 20px;
  text-indent: 24px;
  // padding: 0 0 0 26px;
  padding: 0;
  width: 100%;
  font-size: 16px;
}
select {
  background-image: none;
  display: block;
  padding: 4px 6px;
  transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
  font-size: 14px;
}
.search_container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search_panel {
  flex-grow: 1;
  margin: 0;
  padding: 8px;
  height: 52px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: 0px 2px 4px 2px rgba(0, 0, 0, .3);
  border-radius: 4px;
}

</style>
