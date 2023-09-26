<template>
  <div class="upload-container">
    <div class="upload-control al-c">
      <v-btn color="primary" @click="showUploadDialog = true">Upload</v-btn>

      <v-badge dot :content="unsuccessPinList.results.length" color="red">
        <v-icon
          class="ml-5 cursor-p"
          size="24"
          icon="mdi-upload"
          @click="handleShowPinning"
        ></v-icon>
      </v-badge>
    </div>

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

    <v-dialog v-model="showPinningDialog" width="700">
      <v-card class="pa-5">
        <div class="al-c mb-5">
          <div class="fz-18">{{ unsuccessPinList.results.length }} Files is pinning...</div>
          <v-btn variant="text" :loading="pinningTasksLoading" @click="handleReload">
            <v-icon icon="mdi-reload"></v-icon>
          </v-btn>
        </div>
        <div style="height: 400px; overflow: auto" class="scroll pa-5">
          <v-table :hover="true">
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">CreateAt</th>
                <th class="text-left">Status</th>
                <th class="text-left">Act</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in unsuccessPinList.results" :key="item.requestid">
                <td>{{ item.pin.name }}</td>
                <td>{{ item.created }}</td>
                <td>{{ item.status.toUpperCase() }}</td>
                <td>
                  <v-btn variant="text">Repin</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <bottom-detector
            @arriveBottom="getUnsuccessPinList"
            :loadingMore="loadingMore"
            :noMore="finished"
          ></bottom-detector>
        </div>
      </v-card>
    </v-dialog>
    <div class="uploading-list" v-show="taskWrapper.tasks.length">
      <v-expansion-panels v-model="uploadControlPanel">
        <v-expansion-panel>
          <v-expansion-panel-title>Upload...</v-expansion-panel-title>
          <v-expansion-panel-text style="max-height: 300px; overflow-y: auto">
            <div v-for="(item, index) in taskWrapper.tasks" :key="index" class="py-2">
              <div class="upload-info al-c space-btw mb-2">
                <span>{{ item.taskParams.Body.name }}</span>
                <span>
                  {{ getSize(item.taskParams.Body.size) }}
                </span>
                <span>
                  {{ item.status }}
                </span>
              </div>
              <v-progress-linear
                :model-value="item.progress"
                color="primary"
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
import bottomDetector from '../bottom-detector/bottom-detector.vue'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { RootState } from '../../store/type'
import { Task, TaskWrapper } from './task'
import { getSize } from '../../utils/index'
import { ListPin } from '4everland-pinning/dist/types/core/type'
const store = useStore<RootState>()
const bucketClient = computed(() => store.state.bucketClient)
const pinningClient = computed(() => store.state.pinningClient)
const showUploadDialog = ref(false)
const showPinningDialog = ref(false)
const tab = ref(1)
const files = ref<File[]>(null)
const cid = ref('')
const pinName = ref('')

const cidRef = ref()
const pinNameRef = ref()
const rules = {
  required: (value) => !!value || 'Required.',
  counter: (value) => value.length <= 30 || 'Max 30 characters'
}
const addPinLoading = ref(false)
const pinningTasksLoading = ref(false)

const loadingMore = ref(false)
const finished = ref(false)
const before = ref('')

const uploadControlPanel = ref()
let unsuccessPinList = ref<ListPin>({
  results: [],
  count: 0
})
let taskWrapper = ref(new TaskWrapper(10))

// Upload Failed Tasks
const uploadFailedTasks = computed(() => {
  return taskWrapper.value.tasks.filter((it) => it.status == 5)
})

const uploadingTasks = computed(() => {
  return taskWrapper.value.tasks.filter((it) => it.status == 1 || it.status == 0)
})

const createUpload = (file: File) => {
  let task = new Task(
    bucketClient.value,
    {
      Bucket: store.state.sts.accessBucket,
      Key: store.state.sts.folderPath + '/' + file.name,
      Body: file,
      ContentType: file.type
    },
    pinningClient.value
  )

  taskWrapper.value.pushTasks(task)
  taskWrapper.value.progressTask()
}

const handleUpload = () => {
  showUploadDialog.value = false
  files.value.forEach((it) => {
    createUpload(it)
  })
  files.value = []
  uploadControlPanel.value = 0
}

const handleAddPin = async () => {
  const pinNameValid = await pinNameRef.value.validate()
  const cidValid = await cidRef.value.validate()
  if (pinNameValid.length || cidValid.length) return
  addPinLoading.value = true
  try {
    await pinningClient.value.addPin({
      cid: cid.value,
      name: pinName.value
    })
    showUploadDialog.value = false
    // do something
  } catch (error) {
    console.log(error)
  }
  addPinLoading.value = false
}

const handleShowPinning = async () => {
  showPinningDialog.value = true
  // await getUnsuccessPinList()
}
const getUnsuccessPinList = async (isReplace: boolean = false) => {
  pinningTasksLoading.value = true
  loadingMore.value = true
  try {
    const data = await pinningClient.value.listPin({
      status: 'queued,pinning,failed',
      limit: 10
    })
    if (isReplace) {
      unsuccessPinList.value.results.length = 0
      finished.value = true
    }
    if (data.results.length) {
      before.value = data.results[data.results.length - 1].created
      finished.value = false
    } else {
      finished.value = true
    }
    unsuccessPinList.value.results.push(...data.results)
  } catch (error) {
    console.log(error)
  }
  pinningTasksLoading.value = false
  loadingMore.value = true
}

const handleReload = () => {
  before.value = ''
  getUnsuccessPinList(true)
}
getUnsuccessPinList()
</script>

<style lang="scss" scoped>
.upload-container {
  .uploading-list {
    width: 350px;
    position: absolute;
    right: 20px;
    bottom: 70px;
    .upload-info {
      > span {
        display: block;
      }
    }
  }
}
</style>
