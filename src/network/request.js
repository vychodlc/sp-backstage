import axios from 'axios'
import router from '../router'
import store from '../store'

export function request(config) {
  const instance = axios.create({
    baseURL: 'http://api.bupt404.cn/sp/',
    // baseURL: '/api',
    timeout: 20000
  })

  instance.interceptors.request.use((config) => {
    if(store.state.token){
      config.headers.common['Authorization'] = 'Bearer ' + store.state.token
    }
    return config;
  }, err => {
    return Promise.reject(err);
  })

  instance.interceptors.response.use(res => {
    if(res.data.status=='401'||res.data.status=='408') {
      localStorage.removeItem('token');
      router.replace({
        path: '/login',
      })
    }
    return res
  }, err => {
    if(err){
      switch(err.status){
        case "401":
          localStorage.removeItem('token');
          router.replace({
            path: '/login',
          })
      }
    }
  })

  return instance(config)
}