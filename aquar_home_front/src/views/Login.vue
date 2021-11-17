<template>
  <div class="login_container">
    <div class="login_panel">
      <div class="login_header">
        <img style="height: 50px;" :src="logo_aquar">
        <div style="font-size: 24px;">Aquar</div>
      </div>
      <div class="login_form">
        <div class="param_row" >
          <div class="param_form" style="color: red; height: 30px;">
            {{msg}}
          </div>
        </div>
        <div class="param_row" >
          <div class="param_form">
            <input type="text"  name="userName" placeholder="用户名" v-model="userName" @keyup.enter="login()" />
          </div>
        </div>
        <div class="param_row" >
          <div class="param_form">
            <input type="password" name="password" placeholder="密码" v-model="password" @keyup.enter="login()" />
          </div>
        </div>
        <div class="param_row" >
          <button type="button" class="login_button"  @click="login()">登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logo_aquar from '../assets/app_images/aquar.png'
import md5 from 'crypto-js/md5.js'
export default {
  name: 'Login',
  props: {
  },
  data() {
    return {
      logo_aquar,
      userName: null,
      password: null,
      msg: ' '
    }
  },
  methods:{
    login(){
      var passMd5 = null
      var userName = null
      if(this.userName && this.password){
        userName = this.userName
        passMd5 = md5(this.password).toString()
      }
      this.$axios.post('/api/login', {userName:userName,password:passMd5})
        .then(response => {
          console.log(response.data)
          if(response.data.code===0){
            localStorage.setItem('token',response.data.token)
            this.$router.push('/')
          }else{
            this.msg='用户名密码不正确!'
          }
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login_container::before{
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: 0; right: 0;
    background: rgba(255, 255, 42554, .3);
    backdrop-filter: blur(6px);
    z-index: -1;
}
.login_container {
  position: absolute;
  top: 0; bottom: 0;
  left: 0; right: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.login_panel {
  padding: 20px;
  padding-top: 40px;
  width: 320px;
  height: 400px;
  line-height: 2;
  margin: auto;
  border-radius: 5px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 3px 3px 6px 3px rgba(0, 0, 0, .3);
  overflow: hidden;
  color: rgb(44,44,44);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login_header {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login_form {
  margin: 20px 0;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
}
.param_row {
  margin: 6px 0;
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
.param_form input {
  background-color: #FFFFFF;
  background-image: none;
  border: 1px solid #e5e6e7;
  border-radius: 1px;
  color: inherit;
  display: block;
  padding: 6px 12px;
  transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
  width: 100%;
  font-size: 14px;
}
.login_button {
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
  width: 100% ;
  background-color: rgb(0,150,136);
  border-color: rgb(0,150,136);
  color: white;
}
</style>
