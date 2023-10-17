<template>
  <div class="dashboard-container">
    <nav-header></nav-header>
    <!-- <snackbar></snackbar> -->
    <div class="dashboard-body mt-5">
      <div class="al-c space-btw">
        <upload-control @get-list="onInput"></upload-control>

        <div style="width: 500px" class="al-c">
          <v-select
            class="mr-5"
            density="compact"
            v-model="selectStatus"
            :hide-details="true"
            label="Status"
            :items="selectItems"
            @update:model-value="onInput"
            variant="outlined"
          ></v-select>
          <v-text-field
            v-model="searchKey"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            :hide-details="true"
            variant="outlined"
            @update:modelValue="onInput"
          ></v-text-field>
        </div>
      </div>
      <div class="al-c mt-4" v-if="list.length">
        <div class="pin-list scroll pa-5" id="pin-list">
          <v-table :hover="true">
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">CreateAt</th>
                <th class="text-left">Size</th>
                <th class="text-left">Status</th>
                <th class="text-center">
                  <v-btn variant="text" :loading="loadingMore" @click="onInput">
                    <v-icon icon="mdi-reload"></v-icon
                  ></v-btn>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.requestid" @click="handleClick(item)">
                <td>{{ cutStr(item.pin.name!, 5, 8) }}</td>
                <td>{{ new Date(item.created).toLocaleString() }}</td>
                <td>{{ getSize(item.info!.dag_size) }}</td>
                <td style="text-transform: capitalize">{{ item.status }}</td>
                <td class="text-center">
                  <v-icon
                    class="cursor-p"
                    icon="mdi-clipboard-text-outline"
                    size="16"
                    @click.stop
                    v-clipboard:copy="item.pin.cid"
                    v-clipboard:success="onSuccess"
                  ></v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
          <bottom-detector
            @arriveBottom="getList"
            :loadingMore="loadingMore"
            :noMore="finished"
            query-id="pin-list"
          ></bottom-detector>
        </div>
        <div class="pin-info ml-10 pa-5" v-if="showDetail">
          <div class="ta-r mb-5">
            <v-icon class="mr-auto" @click="showDetail = !showDetail" icon="mdi-close"></v-icon>
          </div>
          <preview-cpm :preview-type="previewType" :preview-url="previewUrl"></preview-cpm>
          <ul class="info-list mt-5">
            <li>
              <span class="mr-3">Name:</span>
              <span>{{ cutStr(curPinInfo.pin.name!, 5, 8) }}</span>
            </li>
            <li>
              <span class="mr-3">IPFS CID:</span>
              <span class="mr-2">{{ cutStr(curPinInfo.pin.cid, 7, 6) }}</span>
              <v-icon
                class="cursor-p"
                size="18"
                icon="mdi-clipboard-text-outline"
                v-clipboard:copy="curPinInfo.pin.cid"
                v-clipboard:success="onSuccess"
              ></v-icon>
            </li>
            <li>
              <span class="mr-3">URL:</span>
              <span class="mr-2">{{ cutStr(httpUrl, 13, 6) }}</span>
              <v-icon
                class="cursor-p"
                size="18"
                icon="mdi-clipboard-text-outline"
                v-clipboard:copy="curPinInfo.pin.cid"
                v-clipboard:success="onSuccess"
              ></v-icon>
            </li>
            <li>
              <span class="mr-3">Size:</span>
              <span>{{ getSize(curPinInfo.info!.dag_size) }}</span>
            </li>
            <li></li>
          </ul>
        </div>
      </div>

      <div class="no-data mt-4 al-c justify-center" v-else>
        <img src="../../assets/img/bg/no-data-bg.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import navHeader from '../../components/nav-header/nav-header.vue'
import uploadControl from '../../components/upload-control/upload-control.vue'
import bottomDetector from '../../components/bottom-detector/bottom-detector.vue'
import previewCpm from '@/components/preview-cpm/preview-cpm.vue'
import unKnownImg from '../../assets/img/icon/unknow.svg'
import { ref, reactive, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store/type'
// import { BucketClient, PinningClient } from '@4everland/upload-pin'
// import type { PinInfo } from '@4everland/upload-pin'
import { BucketClient, PinningClient } from 'upload-pin'
import type { PinInfo } from 'upload-pin'
import { getSize, cutStr } from '../../utils'
import axios from 'axios'
import { computed } from 'vue'
import { debounce } from '../../utils'
import { SnackBarStatus } from '@/components/snack-bar/snack-bar'
import type { ComponentInternalInstance } from 'vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const store = useStore<RootState>()
const bucketClient = new BucketClient({
  accessKeyId: store.state.sts!.accessKeyId,
  secretAccessKey: store.state.sts!.secretAccessKey,
  sessionToken: store.state.sts!.sessionToken,
  endpoint: import.meta.env.VITE_ENDPOINT_URL
})

const pinningClient = new PinningClient({
  baseURL: import.meta.env.VITE_PIN_URL,
  accessToken: store.state.sts!.token
})
store.commit('SET_BUCKET_CLIENT', bucketClient)
store.commit('SET_PINNING_CLIENT', pinningClient)

const showDetail = ref(false)
let list = reactive<PinInfo[]>([])
let loadingMore = ref(false)
let finished = ref(false)
let before = ref('')
const selectItems = [
  {
    title: 'All',
    value: 'queued,pinning,pinned,failed'
  },
  {
    title: 'Queued',
    value: 'queued'
  },
  {
    title: 'Pinning',
    value: 'pinning'
  },
  {
    title: 'Pinned',
    value: 'pinned'
  },
  {
    title: 'failed',
    value: 'failed'
  }
]
let selectStatus = ref('queued,pinning,pinned,failed')

let fileType = ref('')
let curPinInfo = ref<PinInfo>({
  requestid: '',
  status: '',
  created: '',
  pin: {
    cid: '',
    name: '',
    origins: ['']
  },
  delegates: ['']
})
const searchKey = ref('')

const getList = async (isReplace: boolean = false) => {
  try {
    loadingMore.value = true
    const data = await pinningClient.listPin({
      status: selectStatus.value,
      before: before.value,
      name: searchKey.value
    })
    if (isReplace) {
      list.length = 0
      finished.value = true
    }
    if (data.results.length) {
      before.value = data.results[data.results.length - 1].created
      finished.value = false
    } else {
      finished.value = true
    }

    list.push(...data.results)
  } catch (error) {
    console.log(error)
  }
  loadingMore.value = false
}

getList()

const onInput = debounce(() => {
  console.log(2222)
  before.value = ''
  getList(true)
}, 300)

const httpUrl = computed(() => {
  return import.meta.env.VITE_GATEWAY_URL + curPinInfo.value?.pin.cid
})

const previewType = computed(() => {
  if (/video/.test(fileType.value)) {
    return 'video'
  }
  return 'image'
})
const previewUrl = computed(() => {
  if (/image/.test(fileType.value) || /video/.test(fileType.value)) {
    return import.meta.env.VITE_GATEWAY_URL + curPinInfo.value?.pin.cid
  }
  return unKnownImg
})

const headObject = async (url: string) => {
  try {
    const result = await axios.head(url)
    console.log(result.headers['content-type'])
    fileType.value = result.headers['content-type']
  } catch (error) {
    console.log(error)
    fileType.value = 'unKnown'
  }
}
const handleClick = async (item: PinInfo) => {
  showDetail.value = true
  curPinInfo.value = item
  await headObject(import.meta.env.VITE_GATEWAY_URL + item.pin.cid)
}

const onSuccess = () => {
  proxy!.$snackbar({
    text: 'Copy Successfully!',
    type: SnackBarStatus.SUCEESS
  })
}
</script>

<style scoped lang="scss">
::v-deep .v-snackbar__wrapper {
  left: 0;
  top: 30px !important;
  bottom: initial !important;
}
.dashboard-container {
  width: 100%;
  height: 100%;
  .dashboard-body {
    padding: 0 64px;
    .no-data {
      border: 1px solid #ccc;
      border-radius: 4px;
      height: calc(100vh - 200px);
      img {
        width: 40%;
      }
    }
    .pin-list {
      flex: 1;
      height: calc(100vh - 200px);
      overflow-y: auto;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .pin-info {
      height: calc(100vh - 200px);
      width: 300px;
      border: 1px solid #ccc;
      border-radius: 4px;
      .info-list {
        li + li {
          margin-top: 20px;
        }
        > li {
          display: flex;
          align-items: center;
          > span {
            min-width: 70px;
            display: block;
          }
        }
      }
    }
  }
}
</style>
