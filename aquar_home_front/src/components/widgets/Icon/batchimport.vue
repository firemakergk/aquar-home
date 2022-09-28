<template>
  <div class="batch_panel">
    <div class="param_row">
      <div class="param_form">
        <div style="display: flex; flex-direction: row; align-items:stretch;">
          <div style="width: 0; flex-grow: 1; display: flex; flex-direction: column; margin: 0 4px;">
            <div style="display: flex; flex-direction: row; margin: 4px 0;">
              <span style="flex-grow:1;">导入数据：</span>
              <!-- <span><button @click="extractData()">解析数据</button></span> -->
              <v-btn small color="primary" @click="extractData()" style="margin:0 2px; width: 100px;" title="解析数据" ><v-icon left>mdi-text-search-variant</v-icon>解析数据</v-btn>
            </div>
            <div>
              <textarea class="tcolor_main" v-model="importText" placeholder="谷歌,https://www.google.com/"></textarea>
            </div>
          </div>
          <div style="width: 0; flex-grow: 1;  margin: 0 4px;">
            <div style=" margin: 4px 0;">解析结果：</div>
            <div >
              <div v-for="(d,index) in extractedData" :key="'d_'+index" >
                <a :href="d.href" target="_blank">[{{d.name}}]({{d.href}})</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="param_row" style="height: 80px;">
      <div style="flex-grow: 1;"></div>
      <div class="submit_panel">
        <!-- <button type="button" :disabled="loading" @click="addBatch()">批量添加</button> -->
        <img v-show="loading" style="height: 20px;"  :src="loadingImg"/>
        <v-btn small color="primary" :disabled="loading" @click="addBatch()" style="margin:0 2px; width: 100px;" title="批量添加" ><v-icon left>mdi-check-bold</v-icon>批量添加</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as _ from 'lodash'
import meta_icon from './template.json'
import loadingImg from '@/assets/loading.gif'

const RE_DATA = /^.+,.+/i
export default {
  name: 'BatchImport',
  components: {
  },
  data: function() {
    return {
      meta_icon,
      loadingImg,
      loading: false,
      importText: '',
      extractedData: []
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
    this.$bus.on('iconBatchDone', this.batchDone)
  },
  mounted: function() {
  },
  beforeDestroy() {
    this.$bus.off('iconBatchDone', this.batchDone)
  },
  methods: {
    extractData(){
      var lines = this.importText.split('\n')
      for(var i in lines){
        var l = lines[i]
        if(!l){
          continue
        }
        var dArray = RE_DATA.exec(l)[0].split(',')
        if(!dArray){
          continue
        }
        var dataObj = _.cloneDeep(meta_icon)
        dataObj.name = dArray[0]
        dataObj.href = dArray[1]
        this.extractedData.push(dataObj)
      }
    },
    addBatch() {
      if(this.extractedData){
        this.$bus.emit('addWidgetBatch', this.extractedData)
        this.loading = true
      }
    },
    batchDone() {
      this.loading = false
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
</style>
