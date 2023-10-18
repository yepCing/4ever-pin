<template>
  <div class="snack-bar-overlay">
    <div
      class="snack-bar fz-14 pa-3 ta-c"
      @mouseover="handleMouseOver"
      @mouseout="handleMouseOut"
      :style="{ borderColor: borderColor, color: borderColor }"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import gsap from 'gsap'
const props = defineProps<{
  text: string
  timeout?: number
  type?: string
  onRemove: () => void
}>()

const timer = ref<NodeJS.Timeout>()
const borderColor = computed(() => {
  return props.type || '#000'
})
onMounted(() => {
  gsap.fromTo(
    '.snack-bar',
    {
      scale: 0
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3
    }
  )
})

const removeSnackBar = () => {
  timer.value = setTimeout(() => {
    props.onRemove()
  }, props.timeout || 3000)
}
removeSnackBar()
const handleMouseOver = () => {
  clearTimeout(timer.value)
}

const handleMouseOut = () => {
  removeSnackBar()
}
// watch()
</script>

<style lang="scss" scoped>
.snack-bar-overlay {
  position: fixed;
  z-index: 9999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .snack-bar {
    position: fixed;
    z-index: 10001;
    max-width: 80%;
    min-width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    left: 50%;
    transform: translateX(-50%);
    top: 100px;
    opacity: 0;
    background: #fff;
    border: 1px solid;
    border-radius: 4px;
  }
}
</style>
