<template>
  <div class="widget_box">
    <div class="clearfix widget_header vue-draggable-handle">
      <img style="height:20px; " src="./img/pve.png">
      <span style="padding: 0 10px;"><a :href="configData.href">{{ configData.name }}</a></span>
      <span style="flex-grow: 1;" />
      <!-- <a style="margin: 0 4px;" class="iconfont icon-cog-fill icon" title="设置" @click="toggleConfig()" /> -->
      <v-btn icon small @click="getPveInfo()" title="刷新">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-reload</v-icon>
      </v-btn>
      <v-btn icon small @click="toggleConfig()" title="设置">
        <v-icon class="tcolor_primary" style="font-size:20px;" >mdi-cog</v-icon>
      </v-btn>
    </div>
    <div v-if="queryData" class="widget_body">
      <div v-show="showConfig" class="float_config">
        <div class="config_top tbgcolor_sub_head tcolor_sub_head">
          <span style="flex-grow: 1;">设置</span>
          <v-icon class="tcolor_sub_head" @click="toggleConfig()" >mdi-close</v-icon>
        </div>
        <div class="config_body">
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">名称：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.name" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">链接地址：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.href" type="text" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">server：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.server" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">node：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.node" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">user：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.user" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">tokenID：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.token_id" type="text" name="server" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px; text-align: right; padding: 0 2px;">token secret：</div>
            <div style="flex-grow: 1;">
              <input v-model="configData.data.token_secret" type="text" name="app_key" disabled="disabled" style="display: inline-block; width: 100%;">
            </div>
          </div>
          <div class="config_row">
            <div style="width:80px;" />
            <div style="flex-grow: 1;">
              <button @click="updateConfig">确定</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget_content">
        <div class="node_info tcolor_main">
          <div class="node_info_left">
            <div class="node_info_left_top">
              <div style="font-size: 24px;">{{ configData.data.node }} <span style="font-size: 14px;">已运行{{ queryData.pveStatus?secondsFormat(queryData.pveStatus.uptime):"" }}</span></div>
              <div>
                <span>load 1/5/15min: </span>
                <span>{{ queryData.pveStatus.loadavg[0] }},</span>
                <span>{{ queryData.pveStatus.loadavg[1] }},</span>
                <span>{{ queryData.pveStatus.loadavg[2] }}</span>
              </div>
              <div style="position: relative;min-width: 280px; height:100px;">
                <canvas ref="loadChart" ></canvas>
              </div>
              <!-- <line-chart
                :chart-options="chartOptions"
                :chart-data="chartData1"
                :width="width"
                :height="height"
              /> -->
              <!-- <v-sparkline
                :labels="chartData.labels"
                :value="chartData.data.d1"
                color="primary"
                line-width="2"
                padding="16"
              ></v-sparkline> -->
            </div>
          </div>
          <div class="node_info_right">
            <div class="node_info_right_row">
              <div>
                <span style="margin:0 2px;">CPU：{{(queryData.pveStatus.cpu * 100).toFixed(1)}}%</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.sockets }}路</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.cores }}核</span>
                <span style="margin:0 2px;">{{ queryData.pveStatus.cpuinfo.cpus }}线程</span>
              </div>
              <div class="process_bar tpcolor_idle">
                <div class="process tpcolor_info" :style="{width: (queryData.pveStatus.cpu * 100).toFixed(1).toString() + '%'}" />
              </div>
            </div>
            <div class="node_info_right_row">
              <div>
                <span>内存:</span>
                <span>{{ (queryData.pveStatus.memory.used*100/queryData.pveStatus.memory.total).toFixed(1) }}%&nbsp;
                  {{ fileSize(queryData.pveStatus.memory.used) }}/{{ fileSize(queryData.pveStatus.memory.total) }}</span>
              </div>
              <div class="process_bar tpcolor_idle ">
                <div class="process tpcolor_info" :style="{width: (queryData.pveStatus.memory.used*100/queryData.pveStatus.memory.total).toFixed(1).toString() + '%'}" />
              </div>
            </div>
            <div class="node_info_right_row">
              <div>
                <span>系统盘:</span>
                <span>{{ (queryData.pveStatus.rootfs.used*100/queryData.pveStatus.rootfs.total).toFixed(1) }}%&nbsp;
                  ({{ fileSize(queryData.pveStatus.rootfs.used) }}/{{ fileSize(queryData.pveStatus.rootfs.total) }})</span>
              </div>
              <div class="process_bar tpcolor_idle">
                <div class="process tpcolor_info" :style="{width: (queryData.pveStatus.rootfs.used*100/queryData.pveStatus.rootfs.total).toFixed(1).toString() + '%'}" />
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="item_list tcolor_main">
          <div v-for="(item,index) in queryData.vmList"  :key="'vm_item_'+index" class="item_row" :class="index != queryData.vmList.length-1? 'border_bt':''" >
            <div style="flex-grow: 1;"><span style="margin:0 4px 0 0;">{{ item.name }}</span><span style="color: #90a4ae;">({{ item.vmid }})</span></div>
            <div style="width: 80px; text-align: right;">{{ item.cpus }}C {{ fileSize(item.maxmem, 0) }} {{ fileSize(item.maxdisk, 0) }}</div> -->
            <!-- <div style="margin: 0 2px; padding: 0 2px;" :class="item.statusClass">{{ item.healthy? "HEALTHY" : "ERROR" }}</div> -->
            <!-- <div style="margin:0 0 0 8px; padding: 0 2px" class="tcolor_reverse" :class="item.statusClass">{{ item.status.toUpperCase() }}</div> -->
            <!-- <v-chip small label :class="item.statusClass" class="mx-1" >{{ item.status.toUpperCase() }}</v-chip>
          </div>
        </div> -->
         <div class="item_list tcolor_main">
          <v-simple-table dense>
            <thead>
              <tr>
                <th class="text-left">ID</th>
                <th class="text-left">名称</th>
                <th class="text-left">核数</th>
                <th class="text-left">内存</th>
                <th class="text-left">硬盘</th>
                <th class="text-left">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in queryData.vmList"  :key="'vm_item_'+index">
                <td>{{ item.vmid }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.cpus }}</td>
                <td>{{ fileSize(item.maxmem, 0) }}</td>
                <td>{{ fileSize(item.maxdisk, 0) }}</td>
                <td><v-chip small label :class="item.statusClass" class="mx-1" >{{ item.status.toUpperCase() }}</v-chip></td>
              </tr>
            </tbody>
            </v-simple-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs/legacy'
// import { Chart } from 'chart.js'
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'PveWidget',
  components: { LineChart:Line },
  props: {
    tabIndex: {type: Number,default: 0},
    configData: { type: Object, default: () => {} }
  },
  data: function() {
    return {
      pveTimer: null,
      showConfig: false,
      queryData: null,
      loadChart: null,
      chartData:{labels:['-','-','-','-','-','-','-','-'],data:{d1:[],d5:[],d15:[]}},
      chartData1: {
        labels: [ 'January', 'February', 'March' ],
        datasets: [ { data: [40, 20, 12] } ]
      },
      chartOptions:{responsive: true},
      datasetIdKey: {
        type: String,
        default: 'label'
      },
      width:300,
      height:200
    }
  },
  created: function() {
    this.getPveInfo()
    clearInterval(this.pveTimer)
    this.pveTimer = null
    this.setPveTimer()
  },
  mounted: function() {
  },
  updated: function() {
    if(!this.loadChart){
      let chartDiv = this.$refs.loadChart;
      this.loadChart = new Chart(chartDiv, {
        type: 'line',
        data: {
            labels: this.chartData.labels,
            datasets: [{
                label: 'load1',
                data: this.chartData.data.d1,
                fill: false,
                borderColor: [
                    this.$vuetify.theme.current['--tbgcolor_info']
                ],
                borderWidth: 1
            },{
                label: 'load15',
                data: this.chartData.data.d15,
                fill: true,
                borderColor: this.$vuetify.theme.current['--tbgcolor_info']+'20',
                backgroundColor:this.$vuetify.theme.current['--tcolor_primary']+'20',
                pointRadius:1,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
              legend:{
                display:false
              }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 10
                }
            }
        }
      });
    }
  },
  destroyed: function() {
    // 每次离开当前界面时，清除定时器
    clearInterval(this.pveTimer)
    this.pveTimer = null
  },
  methods: {
    setPveTimer() {
      if (this.pveTimer == null) {
        this.timer = setInterval(() => {
          this.getPveInfo()
        }, 30000)
      }
    },
    getPveInfo() {
      this.$axios
        .get('/api/endpoints/pve/queryStatus?server=' + this.configData.data.server + 
        '&node=' + this.configData.data.node + '&user=' + this.configData.data.user + 
        '&tokenId=' + this.configData.data.token_id + '&tokenSecret=' + this.configData.data.token_secret)
        .then(response => {
          const resData = response.data
          this.queryData = resData.data
          if(this.loadChart){
            this.loadChart.update()
          }
          let now = new Date()
          
          if(this.chartData.labels.length <= 8 && this.chartData.labels.indexOf('-')!=-1){
            this.chartData.labels.splice(this.chartData.labels.indexOf('-'),1,`${now.getMinutes()}:${now.getSeconds()}`)
          }else{
            this.chartData.labels.push(`${now.getMinutes()}:${now.getSeconds()}`)
            if(this.chartData.labels.length > 8){
              this.chartData.labels.splice(0,1)
            }
          }
          this.chartData.data.d1.push(parseFloat(this.queryData.pveStatus.loadavg[0]))
          if(this.chartData.data.d1.length > 8){
           this.chartData.data.d1.splice(0,1)
          }
          this.chartData.data.d5.push(parseFloat(this.queryData.pveStatus.loadavg[1]))
          if(this.chartData.data.d5.length > 8){
           this.chartData.data.d5.splice(0,1)
          }
          this.chartData.data.d15.push(parseFloat(this.queryData.pveStatus.loadavg[2]))
          if(this.chartData.data.d15.length > 8){
           this.chartData.data.d15.splice(0,1)
          }

          for (var i = 0; i < this.queryData.vmList.length; i++) {
            var item = this.queryData.vmList[i]
            if (item.status === 'running') {
              item.statusClass = 'tbgcolor_active'
            } else {
              item.statusClass = 'tbgcolor_idle'
            }
          }
        })
    },
    toggleConfig() {
      this.showConfig = !this.showConfig
    },
    updateConfig() {
      this.$bus.emit('update',  {'tabIndex':this.tabIndex,'widget':this.configData})
      this.showConfig = false
    },
    secondsFormat(s) {
      var day = Math.floor(s / (24 * 3600))
      var hour = Math.floor((s - day * 24 * 3600) / 3600)
      var minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60)
      // var second = s - day * 24 * 3600 - hour * 3600 - minute * 60
      return day + '天' + hour + '时' + minute + '分'
    },
    fileSize(byteSize, fixNum) {
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
      } else if (byteSize > 1073741824 && byteSize <= 1099511627776) {
        resNum = byteSize / 1073741824
        postfix = 'G'
      } else if (byteSize > 1099511627776) {
        resNum = byteSize / 1099511627776
        postfix = 'T'
      } else {
        resNum = 0
        postfix = 'NaN'
      }
      return resNum.toFixed(fixNum != null ? fixNum : 2) + postfix
    }
  }
}
</script>

<style lang="scss" scoped>

.item_list {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100px;
}
.item_list::-webkit-scrollbar {
  width: 1px;
}
.item_list::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
.item_list::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 0.5px solid slategrey;
}

.item_row {
  margin: 2px 0px;
  padding: 4px 2px;
  display: flex;
  align-items: center;
}

.node_info {
  display: flex;
  flex-direction: row;
  margin: 2px;
}
.node_info_left {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-around;
  padding: 4px;
  border-right: solid thin var(--tbcolor,#e5e6e7);
  border-bottom: solid thin var(--tbcolor,#e5e6e7);
  min-width: 300px;
}
.node_info_left_top {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 2px;
  justify-content: space-around;
}
.node_info_left_bottom {
  display: flex;
  flex-direction: column;
}
.node_info_right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-around;
  padding: 4px;
  // border-left: solid thin #455a64;
  border-bottom: solid thin var(--tbcolor,#e5e6e7);
  min-width: 220px;
}
.node_info_right_row {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.process_bar {
  margin: 4px 0;
  width: 100%;
  height: 8px;
  // background-color: #455a64;
}
.process {
  // margin: 4px;
  height: 100%;
  background-color: #90a4ae;
}
.item_row {
  margin: 2px 0px;
  padding: 4px 2px;
  display: flex;
}

</style>
