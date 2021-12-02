import Vue from 'vue'
import VueRouter from 'vue-router'
import GridTable from './views/Gridtable.vue'
import Login from './views/Login.vue'
Vue.use(VueRouter)
const router = new VueRouter({
    mode: 'history',
    routes:[
        { path: '/login', component: Login,meta:{title:"AquarHome登录"} },
        { path: '/', component: GridTable,meta:{title:"AquarHome"} },
        { path: '/console', component: GridTable,meta:{title:"AquarHome"} }
    ]
})
router.beforeEach(function(to, from, next) {
    var token = localStorage.getItem("token")
    if (!token && to.path != '/login') {
      next('/login')
    } else {
      next()
    }
  })

export default router