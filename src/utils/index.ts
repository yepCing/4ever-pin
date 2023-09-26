export function getSize(byte: number | string) {
  const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let l = 0
  let n = 0
  if (typeof byte == 'string') {
    n = parseInt(byte, 10)
  } else {
    n = byte
  }
  while (n >= 1024 && ++l) {
    n = n / 1024
  }
  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}

export const debounce = (fn: () => void, delay = 1000) => {
  let timer: NodeJS.Timeout | null
  return function (...args: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(1, args)
      timer = null
    }, delay)
  }
}

export const throttle = (fn: () => void, delay: number = 1000) => {
  let timer: NodeJS.Timeout | null
  return function (...args: any) {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn.apply(1, args)
      timer = null
    }, delay)
  }
}

export function cutStr(text: string | number, pre: number = 100, trail?: number) {
  if (typeof text == 'number') {
    text = text.toString()
  }

  if (trail ? text.length < pre + 3 + trail : text.length < pre + 3) {
    return text
  }
  const preText = text.substring(0, pre)
  let trailText = ''
  if (trail) {
    trailText = text.substring(text.length - trail)
  }
  return preText + '...' + trailText
}
