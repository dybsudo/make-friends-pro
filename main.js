import App from './App'
import {
  guardCurrentPage,
  installNavigationInterceptors,
  isCommunityMode,
  subscribeAppMode
} from './utils/appMode'

const appModeMixin = {
  created() {
    const tracksAppMode = typeof this.syncModePresentation === 'function' ||
      (this.$data && Object.prototype.hasOwnProperty.call(this.$data, 'reviewMode'))
    if (!tracksAppMode) return
    this.appModeUnsubscribe_ = subscribeAppMode(() => {
      if (typeof this.syncModePresentation === 'function') {
        this.syncModePresentation()
      } else if (this.$data && Object.prototype.hasOwnProperty.call(this.$data, 'reviewMode')) {
        this.reviewMode = isCommunityMode()
      }
      if (typeof this.$forceUpdate === 'function') this.$forceUpdate()
    })
  },
  onLoad() {
    const route = this && this.$page && (this.$page.fullPath || this.$page.route)
    guardCurrentPage(route).catch(() => {})
  },
  onShow() {
    const route = this && this.$page && (this.$page.fullPath || this.$page.route)
    guardCurrentPage(route).catch(() => {})
  },
  beforeDestroy() {
    if (this.appModeUnsubscribe_) this.appModeUnsubscribe_()
    this.appModeUnsubscribe_ = null
  },
  beforeUnmount() {
    if (this.appModeUnsubscribe_) this.appModeUnsubscribe_()
    this.appModeUnsubscribe_ = null
  }
}

installNavigationInterceptors()

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
Vue.mixin(appModeMixin)
App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  app.mixin(appModeMixin)
  return {
    app
  }
}
// #endif
