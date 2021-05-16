import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:'0',
    user: {
      id: localStorage.getItem('ID') ? localStorage.getItem('ID'):null,
      nickname: localStorage.getItem('nickname') ? localStorage.getItem('nickname'):null,
      right: localStorage.getItem('right') ? localStorage.getItem('right'):null
    },
    token: localStorage.getItem('token') ? localStorage.getItem('token'):'',
    refresh_token: localStorage.getItem('refresh_token') ? localStorage.getItem('refresh_token'):'',
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
