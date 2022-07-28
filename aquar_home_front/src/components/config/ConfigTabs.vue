<template>
  <div class="config_content">
    <div class="config_panel">
      <div class="param_panel">
        <!-- <div class="d-flex flex-row-reverse">
          <v-btn depressed small outlined @click="addTab" >添加</v-btn>
        </div> -->
        <v-list dense flat tile>
          <!-- <v-subheader>REPORTS</v-subheader> -->
          <template v-for="(tab,index) in tabs" >
            <v-list-item :key="'tab_'+index">
              <!-- <v-list-item-icon style="align-self: center;">
                <v-icon>mdi-star</v-icon>
              </v-list-item-icon> -->
              <v-list-item-icon style="align-self: center;" >
                <span>{{index+1}}</span>
              </v-list-item-icon>
              <v-list-item-content class="px-1">
                <v-list-item-title v-if="editIndex != index" v-text="tab.title" style="font-size: 14px;"></v-list-item-title>
                <v-text-field v-else single-line solo dense hide-details="true" label="标题" v-model="newTitle" class="aq-slim-text-field" style="width: 240px;" ></v-text-field>
              </v-list-item-content>
              <v-list-item-action style="display: flex; flex-direction: row;">
                <v-btn depressed small text min-width="30px" width="30px" color="grey darken-1" @click="moveTab(index,-1)" title="上移"><v-icon>mdi-arrow-up-thick</v-icon></v-btn>
                <v-btn depressed small text min-width="30px" width="30px" color="grey darken-1" @click="moveTab(index,1)" title="下移"><v-icon>mdi-arrow-down-thick</v-icon></v-btn>
                <v-btn v-if="editIndex != index" depressed small text min-width="30px" width="30px" color="grey darken-1" @click="editTitle(index)" title="修改名称"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn v-else depressed small text min-width="30px" width="30px" @click="changeTitle(index)" color="grey darken-1" title="确定"><v-icon >mdi-check</v-icon></v-btn>
                <v-btn depressed small text min-width="30px" width="30px" color="grey darken-1" @click="removeTab(index)" title="删除"><v-icon >mdi-delete</v-icon></v-btn>
                <!-- <a style="margin: 0 4px; " @click="moveTab(index,-1)">↑上移</a>
                <a style="margin: 0 4px; " @click="moveTab(index,1)">↓下移</a> -->
                <!-- <a v-if="editIndex != index" style="margin: 0 4px; " @click="editTitle(index)">修改名称</a>
                <a v-else style="margin: 0 4px; " @click="changeTitle(index)">确定</a>
                <a style="margin: 0 4px; " @click="removeTab(index)">删除</a> -->
              </v-list-item-action>
            </v-list-item>
            <v-divider v-if="index < tabs.length - 1" :key="'div_'+index" ></v-divider>
          </template>
          <v-container class="lighten-5">
            <v-row justify="start" align="center" dense class="py-2">
              <v-col cols="4">
                <v-btn depressed small outlined @click="addTab" >添加</v-btn>
              </v-col>
              <v-col cols="4">
              </v-col>
              <!-- <v-col cols="4">
                <v-btn depressed small color="primary" @click="updateConfig()" style="margin:0 4px; width: 100%;">提交</v-btn>
              </v-col> -->
            </v-row>
          </v-container>
        </v-list>
        <!-- <div style="margin: 6px 0;"><button @click="addTab()">添加</button></div>
        <table class="tab_table" cellspacing="0">
          <tr class="tab_head tbgcolor_sub_head tcolor_reverse">
            <th class="tab_cell">顺序</th>
            <th class="tab_cell" style="width: 120px;">名称</th>
            <th class="tab_cell">操作</th>
          </tr>
          <tr v-for="(tab,index) in tabs" :key="'tab_'+index">
            <td>{{index}}</td>
            <td v-if="editIndex != index">{{tab.title}}</td>
            <td v-else><input size="8" type="text" v-model="newTitle"></td>
            <td>
              <a style="margin: 0 4px; " @click="moveTab(index,-1)">↑上移</a>
              <a style="margin: 0 4px; " @click="moveTab(index,1)">↓下移</a>
              <a v-if="editIndex != index" style="margin: 0 4px; " @click="editTitle(index)">修改名称</a>
              <a v-else style="margin: 0 4px; " @click="changeTitle(index)">确定</a>
              <a style="margin: 0 4px; " @click="removeTab(index)">删除</a>
            </td>
          </tr>
        </table>
        <div class="param_row" style="height: 80px;">
          <div class="param_name"></div>
          <div class="param_form">
            <button type="button" class="submit_button" @click="submitTabs()">提交</button>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  name: 'ConfigTabs',
  components: {
  },
  data: function() {
    return {
      tabs: [],
      editIndex: null,
      newTitle: null
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created: function() {
    this.refreshConfig()
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    refreshConfig() {
      this.$axios
        .get('/api/allData')
        .then(response => {
          this.tabs = response.data.tabs
          this.$forceUpdate()
        })
    },
    addTab(){
      this.$axios.get('/api/config/addTab')
        .then(response => {
          this.tabs = response.data.tabs
          this.refreshConfig()
          this.$bus.emit('refresh')
        })
    },
    removeTab(index){
      if(!confirm('确认删除该标签页？')){
        return
      }
      this.$axios.post('/api/config/removeTab',{tabIndex:index})
        .then(response => {
          this.tabs = response.data.tabs
          this.refreshConfig()
          this.$bus.emit('refresh')
        })
    },
    editTitle(index) {
      this.editIndex = index
      this.newTitle = this.tabs[index].title
    },
    changeTitle(){
      this.tabs[this.editIndex].title = this.newTitle
      this.editIndex = null
      this.newTitle = null
    },
    moveTab(index,foward) {
      this.newTitle = null
      this.editIndex = null
      var start = index+foward
      if(start < 0){
        start = 0
      }else if(start>this.tabs.length-1) {
        start = this.tabs.length-1
      }
      var movedTab = this.tabs[index]
      this.tabs.splice(index, 1)
      this.tabs.splice(start, 0, movedTab)
    },
    submitTabs(){
      this.newTitle = null
      this.editIndex = null
      this.$axios.post('/api/config/submitTabs', this.tabs)
        .then(response => {
          console.log(response.data)
          this.tabs = response.data.tabs
          this.$bus.emit('refresh')
        })
    }
  }
}
</script>

<style lang="scss" scoped>


.config_content {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.config_panel {
  margin: 0;
  display: flex;
  flex-direction: column;
}
.tab_table {
  width: 80%;
  border-collapse: collapse;
}
.tab_table tr{
  height: 24px;
  border: thin solid rgb(193,193,193);
}
.tab_table td{
  margin: 0;
  border: thin solid rgb(193,193,193);
}
.tab_head {
  padding: 0 10px;
}
.tab_cell {
  padding: 0 2px;
}

.param_panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
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
</style>
