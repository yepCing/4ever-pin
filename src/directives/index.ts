import type { App } from 'vue'
import dragDirective from './drag/drag'
const installDirectives = (app: App) => {
  dragDirective(app)
}
export default installDirectives
