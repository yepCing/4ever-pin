<template>
  <div ref="content" class="avatar-content al-c"></div>
</template>

<script setup lang="ts">
import jazzicon from 'jazzicon'
import { ref, onMounted, computed } from 'vue'
const props = defineProps({
  address: {
    type: String,
    required: true
  },
  diameter: {
    default: 24,
    type: Number
  }
})
const iconDom = ref<HTMLElement>()
const content = ref<any>(null)
const jsNumberForAddress = computed(() => {
  const addr = props.address.slice(2, 10)
  const seed = parseInt(addr, 16)
  return seed
})
const generateIdentIconDom = () => {
  const identicon = jazzicon(props.diameter, jsNumberForAddress.value)
  iconDom.value = identicon.cloneNode(true) as HTMLElement
}
onMounted(() => {
  generateIdentIconDom()
  content.value?.appendChild(iconDom.value)
})
</script>

<style lang="scss" scoped>
.avatar-content {
  text-indent: 0;
}
</style>
