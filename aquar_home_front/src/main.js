import Vue from 'vue'
import App from './App.vue'
import VueBus from 'vue-bus'
import animate from 'animate.css'
import './assets/fonts/iconfont.css'
import '@material-design-icons/font'
import router from './router'
import axios from './service/axios.js'

Vue.use(animate)
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(VueBus)

new Vue({
  router:router,
  render: h => h(App),
}).$mount('#app')