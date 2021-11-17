import Vue from 'vue'
import VueRouter from 'vue-router'
import GridTable from './views/Gridtable.vue'
import Login from './views/Login.vue'
Vue.use(VueRouter)
const router = new VueRouter({
    mode: 'history',
    routes:[
        { path: '/login', component: Login },
        { path: '/', component: GridTable },
        { path: '/console', component: GridTable }
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