<template>
  <div class="config_content">
    <v-container class="lighten-5">
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-text-field dense hide-details label="用户名" v-model="userName" ></v-text-field> 
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="12">
          <v-text-field dense hide-details type="password" label="密码" v-model="password" ></v-text-field> 
        </v-col>
      </v-row>
      <v-row align="center" dense class="py-2">
        <v-col cols="2">
          <v-btn depressed small outlined @click="logout()" style="margin:0 4px; width: 100%;">退出登录</v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn depressed small outlined  @click="destoryAccount()" style="margin:0 4px; width: 100%;">注销帐户</v-btn>
        </v-col>
        <v-col cols="5">
        </v-col>
        <v-col cols="3">
          <v-btn depressed small  color="primary" @click="updateAccount()" style="margin:0 4px; width: 100%;">重置帐户</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <!-- <div style="height: 24px; margin: 0 20px;">帐户设置:</div>
    <div class="config_panel">
      <div class="param_panel">
        <div class="param_row">
          <div class="param_name">用户名：</div>
          <div class="param_form">
            <input type="text"  name="userName" placeholder="用户名" v-model="userName" />
            <v-text-field dense hide-details label="用户名" v-model="userName" ></v-text-field> 
          </div>
        </div>
        <div class="param_row">
          <div class="param_name">密码：</div>
          <div class="param_form">
            <input type="password"  name="password" placeholder="密码" v-model="password" />
          </div>
        </div>
        <div class="param_row">
          <div class="param_name"></div>
          <div class="param_form">
            <button type="button" @click="updateAccount()">重置帐户</button>
            <span style="color:red;">{{msg}}</span>
          </div>
        </div>
        <div class="param_row" style="height: 80px;">
           <div class="param_name"></div>
          <div class="param_form">
            <button type="button" @click="logout()">退出登录</button>
            <button type="button" @click="destoryAccount()">注销帐户</button>
            <span style="color:red;">{{msg2}}</span>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import md5 from 'crypto-js/md5.js'

export default {
  name: 'ConfigAppearance',
  components: {
  },
  data: function() {
    return {
      userName: null,
      password: null,
      msg: '',
      msg2: ''
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
  },
  beforeDestroy() {
  },
  methods: {
    updateAccount(){
      var userName = null
      var passMd5 = null
      if(this.userName && this.password){
        userName = this.userName
        passMd5 = md5(this.password).toString()
      }else{
        this.msg = '重置帐户的用户名和密码均不能为空!'
        return
      }
      this.$axios.post('/api/register', {userName:userName,password:passMd5})
        .then(response => {
          if(response.data.code === 0){
            this.msg = '重置帐户成功!'
          }
        })
    },
    destoryAccount(){
      this.$axios.get('/api/destoryAccount')
        .then(response => {
          if(response.data.code === 0){
            this.msg2 = '注销帐户成功!目前系统可无帐户登录'
          }
        })
    },
    logout(){
      localStorage.removeItem("token")
      localStorage.removeItem('curTabIndex')
      this.$router.push('/login')
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

.param_panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
