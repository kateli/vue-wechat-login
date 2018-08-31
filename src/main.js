// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import wechatAuth from './plugins/wechatAuth'//微信登录插件
import './utils/rem'//rem适配

import './assets/style/reset.css'

const qs = require('qs')

router.beforeEach((to, from, next) => {
  if (store.state.loginStatus == 0) {
    //微信未授权登录跳转到授权登录页面
    let url = window.location.href
    //解决重复登录url添加重复的code与state问题
    let parseUrl = qs.parse(url.split('?')[1])
    let loginUrl
    if (parseUrl.code && parseUrl.state) {
      delete parseUrl.code
      delete parseUrl.state
      loginUrl = `${url.split('?')[0]}?${qs.stringify(parseUrl)}`
    } else {
      loginUrl = url
    }
    wechatAuth.redirect_uri = loginUrl
    store.dispatch('setLoginStatus', 1)
    window.location.href = wechatAuth.authUrl
  } else if (store.state.loginStatus == 1) {
    try {
      wechatAuth.returnFromWechat(to.fullPath)
    } catch (err) {
      store.dispatch('setLoginStatus', 0)
      next()
    }
    store.dispatch('loginWechatAuth', wechatAuth.code).then((res) => {
      if (res.status == 1) {
        store.dispatch('setLoginStatus', 2)
      } else {
        store.dispatch('setLoginStatus', 0)
      }
      next()
    }).catch((err) => {
      next()
    })
  } else {
    next()
  }
})

Vue.use(wechatAuth, {appid: process.env.WECHAT_APPID})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>',
})
