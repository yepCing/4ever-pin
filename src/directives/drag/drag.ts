import type { App } from 'vue'

const dragDirective = (app: App) => {
  let x = 0
  let y = 0
  let offsetLeft = 0
  let offsetTop = 0
  let maxLeft = 0
  let maxTop = 0

  const getMaxLimit = (el: HTMLElement) => {
    maxLeft = document.body.clientWidth - el.offsetWidth
    maxTop = document.body.clientHeight - el.offsetHeight
  }
  app.directive('drag', {
    mounted(el: HTMLElement) {
      offsetLeft = el.offsetLeft
      offsetTop = el.offsetTop
      getMaxLimit(el)

      // mousedown bind mousemove
      const move = (ev: MouseEvent) => {
        const moveX = x - ev.clientX // > 0 to right < 0 to left
        const moveY = y - ev.clientY // > 0 to top < 0 to bottm
        el.style.left =
          (moveX > offsetLeft ? 0 : offsetLeft - moveX > maxLeft ? maxLeft : offsetLeft - moveX) +
          'px'
        el.style.top =
          (moveY > offsetTop ? 0 : offsetTop - moveY > maxTop ? maxTop : offsetTop - moveY) + 'px'
      }

      el.addEventListener('mousedown', (ev: MouseEvent) => {
        x = ev.clientX
        y = ev.clientY
        el.addEventListener('mousemove', move)
      })
      // mouseup unbind mousemove
      el.addEventListener('mouseup', (ev: MouseEvent) => {
        // console.log('mouse up')
        offsetLeft = el.offsetLeft
        offsetTop = el.offsetTop
        el.removeEventListener('mousemove', move)
      })

      el.addEventListener('mouseout', () => {
        offsetLeft = el.offsetLeft
        offsetTop = el.offsetTop
        el.removeEventListener('mousemove', move)
      })
      window.addEventListener('resize', () => {
        getMaxLimit(el)
      })
    },
    // beforeUpdate(el: HTMLElement) {
    //   // console.log(el.style)
    // },

    beforeUnmount(el: HTMLElement) {
      el.removeEventListener('mousedown', () => {})

      window.removeEventListener('resize', () => {
        getMaxLimit(el)
      })
    }
  })
}
export default dragDirective
