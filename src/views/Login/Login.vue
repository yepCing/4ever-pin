<template>
  <div
    class="login-container al-c justify-center"
    :style="{ backgroundImage: 'url(' + backgroundUrl + ')' }"
  >
    <div class="login-content">
      <h3 class="mb-4 fz-30 fw-b">Welcome to {{ store.getters.projectName }}</h3>
      <div @click="handleConnect" class="al-c plateform f-center cursor-p">
        <img width="32" src="../../assets/img/icon/metamask.png" alt="" />
        <span class="ml-3 fz-16 fw-b"> Connect Your Wallet </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import type { RootState } from '../../store/type'
import { SnackBarStatus } from '@/components/snack-bar/snack-bar'
import type { ComponentInternalInstance } from 'vue'
const store = useStore<RootState>()
const router = useRouter()
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const backgroundUrl = computed(() => {
  return store.getters.projectBackground
})
const handleConnect = async () => {
  try {
    await store.dispatch('initClient')
    router.push('/')
  } catch (error: any) {
    let message = error.message
    if (typeof error == 'string') {
      message = error
    }
    if (/user rejected/.test(error.message)) {
      message = 'user rejected'
    }
    proxy!.$snackbar({
      text: message,
      type: SnackBarStatus.DANGER
    })
  }
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100%;
  background: rgba(140, 140, 161, 0.05);
  background-image: url(../../assets/img/bg/background.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .login-content {
    text-align: center;
    .plateform {
      background: #fff;
      padding: 15px 100px;
      border: 1px solid #000;
      border-radius: 16px;
    }
  }
}
</style>
