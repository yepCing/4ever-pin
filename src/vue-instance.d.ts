import '@vue/runtime-core'
import { SnackBarOptions } from './components/snack-bar/snack-bar'
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $snackbar: (opt: SnackBarOptions) => void
  }
}
