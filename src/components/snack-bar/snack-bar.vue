<template>
  <div>
    <v-snackbar :model-value="modelValue">
      <div class="al-c space-btw">
        <span>
          {{ title }}
        </span>
        <span @click="handleClose">close</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  text: {
    type: String,
    default: ''
  },

  modelValue: {
    type: Boolean,
    default: false
  },
  close: {
    type: Function,
    default: () => {}
  },

  beforeClose: {
    type: Function,
    default: () => {}
  }
})
const title = computed(() => {
  return props.text || 'text'
})
const handleClose = () => {
  props.beforeClose()
  props.close()
}
</script>

<style scoped lang="scss"></style>
