// import './assets/main.css'

import './assets/css/index.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { VueClipboard } from '@soerenmartius/vue3-clipboard'
import snackBar from './components/snack-bar/snack-bar'

import installDirectives from './directives'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components: {
    ...components,
    VSkeletonLoader
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(vuetify)
app.use(VueClipboard)
app.use(snackBar)
app.use(installDirectives)
app.mount('#app')
