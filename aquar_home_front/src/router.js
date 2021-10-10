import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import AddWidget from './components/AddWidget.vue' 
import ConfigAppearance from './components/ConfigAppearance.vue'
export default new VueRouter({
    routes:[
        { path: '/config', component: ConfigAppearance },
        { path: '/addWidget', component: AddWidget }
    ]
})