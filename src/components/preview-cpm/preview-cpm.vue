<template>
  <div class="preview-container al-c">
    <v-img class="bg-white" :aspect-ratio="1" :src="previewUrl" v-if="previewType == 'image'">
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
        </div> </template
    ></v-img>
    <video class="video" controls ref="videoRef" :src="previewUrl + '#t=0.1'" v-else></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { watch } from 'vue'
const props = defineProps<{
  previewUrl: string
  previewType: 'image' | 'video'
}>()
const videoRef = ref()

watch(
  () => props.previewType,
  (newValue) => {
    if (props.previewType == 'video') {
      if (!videoRef.value) return
      videoRef.value.src = newValue + '#t=0.1'
    }
  }
)
</script>
<style lang="scss" scoped>
.preview-container {
  width: 258px;
  height: 258px;
  .video {
    width: 100%;
  }
}
</style>
