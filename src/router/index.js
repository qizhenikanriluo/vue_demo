import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login.vue'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')

// import Home from '../components/home.vue'

const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')


// import Welcome from '../components/welcome'

const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome')

// import Users from '../components/users/users'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/users/users')
// import Rights from '../components/power/rights'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/rights')
// import Roles from '../components/power/roles'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/roles')

// import Categories from '../components/goods/categories'
const Categories = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/categories')
// import Params from '../components/goods/params'
const Params = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/params')

// import Goods from '../components/goods/goods'
const Goods = () => import(/* webpackChunkName: "Goods_Add" */ '../components/goods/goods')

// import Add from '../components/goods/add'
const Add = () => import(/* webpackChunkName: "Goods_Add" */ '../components/goods/add')

// import Order from  '../components/order/order'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/order')

// import Report from  '../components/report/report'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/report')



Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect:'/welcome',
    children: [
      {path:'/welcome', component:Welcome},
      {path:'/users', component:Users},
      {path:'/rights', component:Rights},
      {path:'/roles', component:Roles},
      {path:'/categories', component:Categories},
      {path:'/params', component:Params},
      {path:'/goods', component:Goods},
      {path:'/goods/add', component:Add},
      {path:'/orders', component:Order},
      {path:'/reports', component:Report},

    ]}
]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问de路径
  //from 代表从哪个路径跳转而来
  //next 一个函数
    // next（） 放行 next('/login') 强制跳转
  if(to.path === '/login')return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
