<template>
  <div class="header-container al-c space-btw">
    <div class="al-c">
      <!-- <img width="40" src="" alt="" /> -->
      <Avatar :diameter="30" :address="address"></Avatar>

      <span class="fz-20 fw-b ml-2">4EVER Pin</span>
    </div>
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-card v-bind="props" class="px-8 py-2" elevation="1">
          <v-card-text class="al-c cursor-p pa-0">
            <Avatar :diameter="30" :address="address"></Avatar>
            <div class="address ml-3">{{ cutStr(address, 6, 6) }}</div>
          </v-card-text>
        </v-card>
      </template>

      <v-list>
        <v-list-item
          v-for="(item, index) in menuList"
          :key="index"
          class="cursor-p"
          :value="index"
          @click="handleMenu(item.operation)"
        >
          <v-list-item-title class="fz-14">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import localCache from '@/utils/cache'

import { useStore } from 'vuex'
import type { RootState } from '../../store/type'
import { cutStr } from '../../utils'
import Avatar from '../avatar/avatar.vue'
import { reactive } from 'vue'
import { computed } from 'vue'
const store = useStore<RootState>()

// const address = ref(store.state.address || '')

const address = computed(() => {
  console.log(store.state.address)
  return store.state.address || ''
})

const menuList = reactive([
  {
    title: 'Log Out',
    operation: 'logout'
  }
])

const handleMenu = (operation: any) => {
  switch (operation) {
    case 'logout':
      localCache.clearCache()
      location.reload()
      break
    default:
      break
  }
}
</script>

<style scoped lang="scss">
.header-container {
  position: sticky;
  top: 0;
  z-index: 99;
  width: 100%;
  padding: 20px 64px;
  box-shadow: 0px 2px 4px rgba(140, 140, 161, 0.05);
  background: #fff;
  box-sizing: border-box;
  // .address {
  //   width: 100px;
  // }
}
</style>
