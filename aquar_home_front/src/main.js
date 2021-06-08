import Vue from 'vue'
import App from './App.vue'
import VueBus from 'vue-bus'
import animate from 'animate.css'
Vue.use(animate)
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false
Vue.use(VueBus)

new Vue({
  render: h => h(App),
}).$mount('#app')