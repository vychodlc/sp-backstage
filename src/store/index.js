import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:'0',
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
    rmToken(state) {
      state.token = ''
      state.refresh_token = ''
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
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
