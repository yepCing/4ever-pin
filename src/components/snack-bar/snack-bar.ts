import snackBar from './snack-bar.vue'
import { createApp } from 'vue'
import type { App } from 'vue'

export enum SnackBarStatus {
  SUCEESS = '#58BA2D',
  WARNNING = '#DE912E',
  DANGER = '#EF5459'
}
export interface SnackBarOptions {
  text: string
  timeout?: number
  type?: SnackBarStatus
}
let el: HTMLDivElement | null = null
const createSnackBar = (opt?: SnackBarOptions) => {
  if (el) {
    el.remove()
  }
  el = document.createElement('div')
  const snackBarApp = createApp(snackBar, {
    ...opt,
    onRemove: () => {
      snackBarApp.unmount()
      el?.remove()
    }
  })
  document.body.appendChild(el)
  snackBarApp.mount(el)
}

export default {
  install: (app: App) => {
    app.config.globalProperties.$snackbar = createSnackBar
  }
}
