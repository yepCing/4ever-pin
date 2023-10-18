<template>
  <div class="upload-container">
    <v-btn color="primary" @click="showUploadDialog = true">Upload</v-btn>

    <v-dialog v-model="showUploadDialog" width="500">
      <v-card class="pa-5">
        <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
          <v-tab :value="1">File Upload</v-tab>
          <v-tab :value="2">CID Pin</v-tab>
        </v-tabs>
        <v-card-text>
          <v-window v-model="tab">
            <v-window-item :value="1">
              <v-file-input
                class="mt-5"
                v-model="files"
                color="deep-purple-accent-4"
                counter
                multiple
                label="Select File"
                placeholder="Select your files"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                :show-size="1000"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="(fileName, index) in fileNames" :key="fileName">
                    <v-chip
                      v-if="index < 2"
                      color="deep-purple-accent-4"
                      label
                      size="small"
                      class="me-2"
                    >
                      {{ fileName }}
                    </v-chip>

                    <span v-else-if="index === 2" class="text-overline text-grey-darken-3 mx-2">
                      +{{ files.length - 2 }} File(s)
                    </span>
                  </template>
                </template>
              </v-file-input>

              <div class="al-c justify-center mt-5">
                <v-btn color="primary" width="100%" @click="handleUpload">UPLOAD</v-btn>
              </div>
            </v-window-item>

            <v-window-item :value="2">
              <v-text-field
                ref="cidRef"
                v-model="cid"
                class="mt-5"
                label="Please Enter CID"
                :rules="[rules.required]"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                ref="pinNameRef"
                v-model="pinName"
                class="mt-5"
                label="Please Enter Name"
                :rules="[rules.counter, rules.required]"
                variant="outlined"
              ></v-text-field>
              <div class="al-c justify-center mt-5">
                <v-btn color="primary" width="100%" @click="handleAddPin" :loading="addPinLoading"
                  >Pin</v-btn
                >
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>

    <div class="uploading-list" v-if="taskWrapper.tasks.length" v-drag>
      <v-expansion-panels v-model="uploadControlPanel">
        <v-expansion-panel>
          <v-expansion-panel-title class="fz-14">Upload Control</v-expansion-panel-title>
          <v-expansion-panel-text style="max-height: 300px; height: 300px; overflow: auto">
            <div v-for="(item, index) in taskWrapper.tasks" :key="index" class="py-2">
              <div class="upload-info al-c space-btw mb-2">
                <span
                  class="d-ib fz-14"
                  style="
                    width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                  >{{ item.taskParams.Body.name }}</span
                >
                <span class="fz-14">
                  {{ getSize((item.taskParams.Body.size * item.progress) / 100) }} /
                  {{ getSize(item.taskParams.Body.size) }}
                </span>

                <v-btn variant="text" v-if="item.status == 5" @click="handleRetryUpload(item)">
                  <v-icon icon="mdi-reload"></v-icon
                ></v-btn>
              </div>
              <v-progress-linear
                :model-value="item.progress"
                :color="progressColor(item.status)"
                rounded
              ></v-progress-linear>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store/type'
import { Task, TaskWrapper } from './task'
import { getSize } from '../../utils/index'
import { SnackBarStatus } from '@/components/snack-bar/snack-bar'
import type { ComponentInternalInstance } from 'vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const emit = defineEmits<{
  (e: 'getList'): void
}>()

const store = useStore<RootState>()
const bucketClient = computed(() => store.state.bucketClient)
const pinningClient = computed(() => store.state.pinningClient)
const showUploadDialog = ref(false)
const tab = ref(1)
const files = ref<File[]>([])
const cid = ref('')
const pinName = ref('')

const cidRef = ref()
const pinNameRef = ref()
const rules = {
  required: (value: any) => !!value || 'Required.',
  counter: (value: any) => value.length <= 30 || 'Max 30 characters'
}
const addPinLoading = ref(false)
const uploadControlPanel = ref()

let taskWrapper = ref(new TaskWrapper(10))

const uploadingTasks = computed(() => {
  return taskWrapper.value.tasks.filter((it) => it.status == 1 || it.status == 0)
})

const progressColor = (status: number) => {
  switch (status) {
    case 5:
      return '#EF5459'
    case 4:
      return '#58BA2D'
    case 3:
      return '#58BA2D'
    case 0:
      return 'primary'
    case 1:
      return 'primary'
    default:
      return ''
  }
}

watch(uploadingTasks, () => {
  const uploadTasks = taskWrapper.value.tasks.filter(
    (it) => it.status == 1 || it.status == 0
  ).length
  if (uploadTasks == 0) {
    emit('getList')
  }
})
const createUpload = async (file: File) => {
  try {
    let task = new Task(
      bucketClient.value!,
      {
        Bucket: store.state.sts!.accessBucket,
        Key: store.state.sts!.folderPath + '/' + file.name,
        Body: file,
        ContentType: file.type
      },
      pinningClient.value!
    )

    taskWrapper.value.pushTasks(task)
    await taskWrapper.value.progressTask()
  } catch (error: any) {
    console.log(error.code)

    if (error.code && error.code == 403) {
      proxy!.$snackbar({
        text: 'token is expired',
        type: SnackBarStatus.DANGER
      })
      setTimeout(() => {
        localStorage.clear()
        location.reload()
      }, 2000)
    } else {
      proxy!.$snackbar({
        text: error.message,
        type: SnackBarStatus.DANGER
      })
    }
  }
}

const handleUpload = () => {
  showUploadDialog.value = false
  files.value.forEach((it) => {
    createUpload(it)
  })
  files.value = []
  uploadControlPanel.value = 0
}
const handleRetryUpload = async (item: Task) => {
  try {
    item.status = 0
    await taskWrapper.value.progressTask()
  } catch (error: any) {
    if (error.code && error.code == 403) {
      proxy!.$snackbar({
        text: 'token is expired',
        type: SnackBarStatus.DANGER
      })
      setTimeout(() => {
        localStorage.clear()
        location.reload()
      }, 2000)
    } else {
      proxy!.$snackbar({
        text: error.message,
        type: SnackBarStatus.DANGER
      })
    }
  }
}

const handleAddPin = async () => {
  const pinNameValid = await pinNameRef.value.validate()
  const cidValid = await cidRef.value.validate()
  if (pinNameValid.length || cidValid.length) return
  addPinLoading.value = true
  try {
    await pinningClient.value!.addPin({
      cid: cid.value,
      name: pinName.value
    })
    showUploadDialog.value = false

    emit('getList')
    // do something
  } catch (error: any) {
    console.log(error)
    proxy!.$snackbar({
      text: error.error.details,
      type: SnackBarStatus.DANGER
    })
  }
  addPinLoading.value = false
}
</script>

<style lang="scss" scoped>
.upload-container {
  .uploading-list {
    width: 350px;
    height: 48px;
    z-index: 999;
    position: absolute;
    right: 20px;
    bottom: 360px;
    .upload-info {
      > span {
        display: block;
      }
    }
  }
}
.no-data {
  width: 100%;
  img {
    width: 40%;
  }
}
</style>
