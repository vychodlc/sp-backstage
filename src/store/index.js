import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:'0',
    user: {
      id: localStorage.getItem('ID') ? localStorage.getItem('ID'):null,
      nickname: localStorage.getItem('nickname') ? localStorage.getItem('nickname'):null,
      right: localStorage.getItem('permissions') ? localStorage.getItem('permissions').split(','):null
    },
    token: localStorage.getItem('token') ? localStorage.getItem('token'):'',
    refresh_token: localStorage.getItem('refresh_token') ? localStorage.getItem('refresh_token'):'',
    expressPrice: [13.25,15.07,18.46,20.27,23.66,24.1,27.3,27.3,33,33,35.3,35.3,36.35,36.35,39.9,39.9,43.45,43.45,47,47,50.55,50.55,54.1,54.1,57.65,57.65,61.2,61.2,64.75,64.75,68.3,68.3,71.86,71.85,75.4,75.4,78.95,78.95,82.5,82.5,86.05,86.05,89.6,89.6,93.15,93.15,96.7,96.7,100.25,100.25,103.8,103.8,107.35,107.35,110.9,110.9,114.45,114.45,118,118],
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.token = token
    },
    setRefreshToken(state, refresh_token) {
      state.refresh_token = refresh_token
      localStorage.refresh_token = refresh_token
    },
    setUser(state, user) {
      state.user.nickname = user.nickname
      state.user.id = user.id
      state.user.right = user.right
    },
    rmToken(state) {
      state.token = ''
      state.refresh_token = ''
      state.user.nickname = null
      state.user.id = null
      state.user.right = null
      localStorage.clear()
    },
  },
  getters: {
    getStorage(state) {
      if (!state.token) {
        state.token = localStorage.getItem('token')
      }
      return state.token
    }
  },
  actions: {
  },
  modules: {
  }
})
