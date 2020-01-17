import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import './plugins/element.js'
import './assets/font/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入nprogress包对应的JS 和 css -- 进度条效果
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'


//将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://renoblog.xyz/api/private/v1/'
// 通过axios拦截器添加token验证
//request 请求中展示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//response拦截器 隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.filter('dataFormat',function (originVal) {
const  dt =  new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 +'').padStart(2 ,'0')
  const d = (dt.getMonth() +'').padStart(2,'0')
  const hh =  (dt.getHours() +'').padStart(2,'0')
  const mm =  (dt.getMinutes() +'').padStart(2,'0')
  const ss =  (dt.getSeconds() +'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
