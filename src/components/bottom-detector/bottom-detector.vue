<template>
  <div class="mt-3 ta-c">
    <div class="wavy" v-if="loadingMore">
      <span style="--i: 1">L</span>
      <span style="--i: 2">o</span>
      <span style="--i: 3">a</span>
      <span style="--i: 4">d</span>
      <span style="--i: 5">i</span>
      <span style="--i: 6">n</span>
      <span style="--i: 7">g</span>
      <span style="--i: 8">.</span>
      <span style="--i: 9">.</span>
      <span style="--i: 10">.</span>
    </div>
    <div v-if="noMore">No More</div>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from '../../utils'
import { onMounted, ref, onBeforeUnmount } from 'vue'
const props = defineProps({
  loadingMore: {
    type: Boolean,
    required: true
  },
  distance: {
    type: Number,
    default: 0
  },
  noMore: {
    type: Boolean,
    default: false
  },
  queryId: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'arriveBottom'): void
}>()
const element = ref<HTMLElement>()

const listenBottomOut = () => {
  if (props.noMore || props.loadingMore) return
  let scrollTop = element.value!.scrollTop || document.body.scrollTop
  let clientHeight = element.value!.clientHeight
  let scrollHeight = element.value!.scrollHeight

  if (scrollTop + clientHeight >= scrollHeight - props.distance) {
    emit('arriveBottom')
  }
}

let debouceListenBottomOut = debounce(listenBottomOut, 500)
onMounted(() => {
  document.getElementById(props.queryId)!.addEventListener('scroll', () => {
    debouceListenBottomOut()
  })
  element.value = document.getElementById(props.queryId) as HTMLElement
})

onBeforeUnmount(() => {
  document.getElementById(props.queryId)!.removeEventListener('scroll', listenBottomOut, false)
})
</script>
<style scoped>
.wavy {
  position: relative;
  /* -webkit-box-reflect: below -12px linear-gradient(transparent, rgba(0, 0, 0, 0.2)); */
}
.wavy span {
  position: relative;
  display: inline-block;
  color: #000;
  font-size: 14px;
  letter-spacing: 2px;
  animation: wavyAnimate 1s ease-in-out infinite;
  animation-delay: calc(0.1s * var(--i));
}
@keyframes wavyAnimate {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-10px);
  }
  40%,
  100% {
    transform: translateY(0);
  }
}
</style>
