import { createStore } from 'vuex'
import type { RootState, verifyResult } from './type'
import { AuthClient, BucketClient, PinningClient } from '4everland-pinning'
import localCache from '@/utils/cache'
import { ethers } from 'ethers'

// const client = new Client({
//   authServiceUrl: import.meta.env.VITE_AUTH_URL,
//   pinningServiceUrl: import.meta.env.VITE_PIN_URL,
//   endpoint: import.meta.env.VITE_ENDPOINT_URL,
//   storageType: 'IPFS'
// })

const authClient = new AuthClient(import.meta.env.VITE_AUTH_URL)

export default createStore<RootState>({
  state: {
    authClient: authClient,
    address: localCache.getCache('address') || null,
    expiration: localCache.getCache('expiration') || 0,
    sts: localCache.getCache('sts') || null,
    bucketClient: null,
    pinningClient: null
  },
  getters: {},
  mutations: {
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
    async initClient({ state, commit }) {
      try {
        if (!state.authClient) throw new Error('must init client')
        if (!window.ethereum) return window.open('https://metamask.io/')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const text = await state.authClient.getSignText(signer.address)
        const signature = await signer.signMessage(text)
        console.log(signature)
        const result = await state.authClient.verifySign(signer.address, signature)
        console.log(result)
        commit('SET_EXPIRATION', result.expiration * 1000)
        commit('SET_STS', result)
        commit('SET_ADDRESS', signer.address)
        localCache.setCache('address', signer.address)
        localCache.setCache('sts', result)
        localCache.setCache('expiration', result.expiration * 1000)
      } catch (error) {
        console.log(error)
        throw error
      }
    }
  },
  modules: {}
})