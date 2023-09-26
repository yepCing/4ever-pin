import snackBarVue from './snack-bar.vue'
import { createApp, type App } from 'vue'

let mountRef: HTMLDivElement | null
const createMount = (opts = {}) => {
  if (mountRef) {
    mountRef.remove()
    mountRef = null
  }
  mountRef = document.createElement('div')

  const snackBarCpm = createApp(snackBarVue, {
    ...opts,
    remove() {
      snackBarCpm.unmount()
      if (mountRef) {
        document.body.removeChild(mountRef)
        mountRef = null
      }
    }
  })
  snackBarCpm.mount(mountRef)
}

function SnackBar(opts = {}) {
  // opts.id! = opts.id || 'snackbar' + 1
  return createMount(opts)
}

SnackBar.install = (app: App) => {
  app.component('snack-bar', snackBarVue)
  app.config.globalProperties.$snackbar = SnackBar
}

export default SnackBar
