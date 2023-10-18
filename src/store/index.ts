import { createStore } from 'vuex'
import type { RootState, verifyResult } from './type'
import type { ProjectInfo } from './type'
import { AuthClient, BucketClient, PinningClient } from '@4everland/upload-pin'
import localCache from '@/utils/cache'
import { ethers } from 'ethers'
import axios from 'axios'
import background from '@/assets/img/bg/background.png'
import logo from '@/assets/img/icon/avatar.svg'

const authClient = new AuthClient(import.meta.env.VITE_AUTH_URL)

export default createStore<RootState>({
  state: {
    authClient: authClient,
    address: localCache.getCache('address') || null,
    expiration: localCache.getCache('expiration') || 0,
    sts: localCache.getCache('sts') || null,
    bucketClient: null,
    pinningClient: null,
    projectInfo: null
  },
  getters: {
    projectName(state) {
      return state.projectInfo?.config[0].options[0].value || '4EVER PIN'
    },
    projectLogo(state) {
      return state.projectInfo?.config[1].options[0].value || logo
    },
    projectBackground(state) {
      return state.projectInfo?.config[2].options[0].value || background
    },
    projectIPFSGateway(state) {
      return state.projectInfo?.config[3].options[0].value || import.meta.env.VITE_GATEWAY_URL
    }
  },
  mutations: {
    SET_PROJECTINFO(state, projectInfo: ProjectInfo) {
      state.projectInfo = projectInfo
      document.title = projectInfo?.config[0].options[0].value || '4EVER PIN'
    },
    SET_EXPIRATION(state, expiration) {
      state.expiration = expiration
    },
    SET_STS(state, sts: verifyResult) {
      state.sts = sts
    },
    SET_BUCKET_CLIENT(state, client: BucketClient) {
      state.bucketClient = client
    },
    SET_PINNING_CLIENT(state, client: PinningClient) {
      state.pinningClient = client
    },
    SET_ADDRESS(state, address: string) {
      state.address = address
    }
  },
  actions: {
    async getProjectInfo({ commit }) {
      const { data } = await axios.get<ProjectInfo>('./config.json')
      console.log(data)
      commit('SET_PROJECTINFO', data)
    },
    async initClient({ state, commit }) {
      if (!state.authClient) throw new Error('must init client')
      if (!window.ethereum) return window.open('https://metamask.io/')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const text = await state.authClient.getSignText(signer.address)
      const signature = await signer.signMessage(text)
      const result = await state.authClient.verifySign(signer.address, signature)
      commit('SET_EXPIRATION', result.expiration * 1000)
      commit('SET_STS', result)
      commit('SET_ADDRESS', signer.address)
      localCache.setCache('address', signer.address)
      localCache.setCache('sts', result)
      localCache.setCache('expiration', result.expiration * 1000)
    }
  },
  modules: {}
})
