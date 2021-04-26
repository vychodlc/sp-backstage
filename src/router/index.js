import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    children: [
      {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: 'post',
        name: 'Post',
        component: () => import('../views/post/index.vue')
      },
      {
        path: 'post_edit',
        name: 'PostEdit',
        component: () => import('../views/post/edit.vue')
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('../views/post/tag.vue')
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/index.vue')
      },
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
