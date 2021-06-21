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
      {path: '/',name: 'Dashboard',component: () => import('../views/dashboard/index.vue')},
      {path: 'post',name: 'Post',component: () => import('../views/post/index.vue')},
      {path: 'post_edit',name: 'PostEdit',component: () => import('../views/post/edit.vue')},
      {path: 'tag',name: 'Tag',component: () => import('../views/post/tag.vue')},
      {path: 'transmit',name: 'Transmit',component: () => import('../views/transship/transmit.vue')},
      {path: 'input',name: 'Input',component: () => import('../views/transship/input.vue')},
      {path: 'storage',name: 'Storage',component: () => import('../views/transship/storage.vue')},
      {path: 'output',name: 'Output',component: () => import('../views/transship/output.vue')},

      {path: 'user',name: 'User',component: () => import('../views/user/index.vue')},
      {path: 'address',name: 'Address',component: () => import('../views/user/address.vue')},

      {path: 'order',name: 'Order',component: () => import('../views/agency/order.vue')},
      {path: 'discount',name: 'Discount',component: () => import('../views/agency/discount.vue')},
      {path: 'giftcard',name: 'Giftcard',component: () => import('../views/agency/giftcard.vue')},
      {path: 'account',name: 'Account',component: () => import('../views/agency/account.vue')},

      {path: 'bankcardapply',name: 'BankcardApply',component: () => import('../views/bankcard/apply.vue')},
      {path: 'bankcardmanage',name: 'BankcardManage',component: () => import('../views/bankcard/manage.vue')},
      
      {path: 'blotter',name: 'Blotter',component: () => import('../views/finance/blotter.vue')},
      {path: 'withdrawl',name: 'Withdrawl',component: () => import('../views/finance/withdrawl.vue')},
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
