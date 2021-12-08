<template>
  <div class="search_container">
    <div style="position: absolute; z-index: 4; top:50px; left:90px;right: 50px; display: flex; flex-direction: column;" class="tbgcolor_main tcolor_main">
      <div style="display: flex; flex-direction: row-reverse;" v-show="suggests && suggests.length>0">
        <a style="margin: 0 8px;" @click="closeSuggest()">X</a>
      </div>
      <a v-for="(sugword,index) in suggests" :key="index" style="display:block; margin: 4px;" @click="search(sugword)">{{sugword}}</a>
    </div>
    <div class="search_panel tbgcolor_main">
      <select name="source" class="tbgcolor_main tcolor_main tbcolor"  v-model="configData.data.source">
        <option class="tcolor_main" value ="baidu">百度</option>
        <option class="tcolor_main" value ="bing">Bing</option>
        <option class="tcolor_main" value ="google">Google</option>
      </select>
      <input type="text" class="tbgcolor_main tcolor_main" style="flex-grow:1;" autofocus="autofocus" placeholder="输入要搜索的内容" 
        :style="{backgroundImage: 'url('+ require('./img/' + configData.data.source + '.png') +')'  }" 
        v-model="searchText" @keyup.enter="search()" @input="prepareSuggest()" />
      <button class="iconfont icon-search icon tcolor_sub tbgcolor_main" @click="search"></button>
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
      searchText:'',
      lastSign: null,
      suggests:[]
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
    search(word) {
      if(word){
        this.searchText = word
      }
      this.suggests = []
      var searchUrl = this.source[this.configData.data.source].url.replace('{{}}',this.searchText)
      window.open(searchUrl)
    },
    prepareSuggest(){
      var sign = Math.floor(Math.random() * 1000000)
      this.lastSign = sign
      setTimeout(()=>{this.checkSuggest(sign)},500)
    },
    checkSuggest(sign){
      console.log("check suggest!")
      console.log(sign)
      console.log(this.lastSign)
      if(this.lastSign && sign === this.lastSign){
        console.log("check suggest success!!")
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
          console.log('url:'+error+',message:'+error.message)
        })
    },
    closeSuggest() {
      this.suggests = []
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
input {
  margin: 0 2px;
  outline-color: #ccc;
  background-image: url('./img/baidu.png');
  background-repeat: no-repeat;
  background-position: 2px;
  background-size: 20px;
  text-indent: 24px;
  border: 0px solid #e5e6e7;
  display: block;
  padding: 6px 4px;
  transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
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
