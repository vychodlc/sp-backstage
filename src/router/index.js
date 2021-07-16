import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const asyncRoutes = {
  'post_page': {path: 'post',name: 'Post',component: () => import('../views/post/index.vue')},
  'post_edit': {path: 'post_edit',name: 'PostEdit',component: () => import('../views/post/edit.vue')},
  'tag_page': {path: 'tag',name: 'Tag',component: () => import('../views/post/tag.vue')},
  'repo_transmit': {path: 'transmit',name: 'Transmit',component: () => import('../views/transship/transmit.vue')},
  'repo_input': {path: 'input',name: 'Input',component: () => import('../views/transship/input.vue')},
  'repo_page': {path: 'storage',name: 'Storage',component: () => import('../views/transship/storage.vue')},
  'repo_out_page': {path: 'output',name: 'Output',component: () => import('../views/transship/output.vue')},

  'user_page': {path: 'user',name: 'User',component: () => import('../views/user/index.vue')},
  'permission_page': {path: 'permission',name: 'Permission',component: () => import('../views/user/permission.vue')},
  'address_page': {path: 'address',name: 'Address',component: () => import('../views/user/address.vue')},

  'agency_page': {path: 'order',name: 'Order',component: () => import('../views/agency/order.vue')},
  'discount_page': {path: 'discount',name: 'Discount',component: () => import('../views/agency/discount.vue')},
  'giftcard_page': {path: 'giftcard',name: 'Giftcard',component: () => import('../views/agency/giftcard.vue')},
  'account_page': {path: 'account',name: 'Account',component: () => import('../views/agency/account.vue')},

  'card_apply_page': {path: 'bankcardapply',name: 'BankcardApply',component: () => import('../views/bankcard/apply.vue')},
  'card_page': {path: 'bankcardmanage',name: 'BankcardManage',component: () => import('../views/bankcard/manage.vue')},
  
  'payment_page': {path: 'blotter',name: 'Blotter',component: () => import('../views/finance/blotter.vue')},
  'withdraw_page': {path: 'withdrawl',name: 'Withdrawl',component: () => import('../views/finance/withdrawl.vue')},
  'factor_page': {path: 'option',name: 'Option',component: () => import('../views/finance/option.vue')},
  'charge_page': {path: 'charge',name: 'Charge',component: () => import('../views/finance/charge.vue')},
}

var checkStorage = setInterval(()=>{
  if(localStorage.permissions) {
    localStorage.permissions.split(',').map(permission=>{
      if(asyncRoutes[permission]) {
        if(permission=='card_page') {
          router.options.routes[2].children.push(asyncRoutes['card_page'])
          router.options.routes[2].children.push(asyncRoutes['card_apply_page'])
        } else if(permission=='repo_page') {
          router.options.routes[2].children.push(asyncRoutes[permission])
          router.options.routes[2].children.push(asyncRoutes['repo_transmit'])
          router.options.routes[2].children.push(asyncRoutes['repo_input'])
        } else if(permission=='post_page'&&(localStorage.permissions.split(',').indexOf('post_page_all')==-1)) {
          router.options.routes[2].children.push(asyncRoutes['post_page'])
        } else if(permission=='post_page_all'&&(localStorage.permissions.split(',').indexOf('post_page')==-1)) {
          router.options.routes[2].children.push(asyncRoutes['post_page'])
        } else if(permission=='post_page'&&(localStorage.permissions.split(',').indexOf('post_page_all')!=-1)) {
          router.options.routes[2].children.push(asyncRoutes['post_page'])
        } else {
          router.options.routes[2].children.push(asyncRoutes[permission])
        }
      }
      // router.matcher = new router().matcher()
      resetRouter()
      // router.addRoute(router.options.routes)
      router.addRoutes(router.options.routes)
    })
    clearInterval(checkStorage)
    // localStorage.permissions = ''
  }
},1000)

export function resetRouter() {
  const newRouter = new VueRouter()
  router.matcher = newRouter.matcher
}

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
    component: () => import('../views/home/index.vue'),
    children: [
      {path: '/',name: 'Dashboard',component: () => import('../views/dashboard/index.vue')},
      // {path: 'post',name: 'Post',component: () => import('../views/post/index.vue')},
      // {path: 'post_edit',name: 'PostEdit',component: () => import('../views/post/edit.vue')},
      // {path: 'tag',name: 'Tag',component: () => import('../views/post/tag.vue')},
      // {path: 'transmit',name: 'Transmit',component: () => import('../views/transship/transmit.vue')},
      // {path: 'input',name: 'Input',component: () => import('../views/transship/input.vue')},
      // {path: 'storage',name: 'Storage',component: () => import('../views/transship/storage.vue')},
      // {path: 'output',name: 'Output',component: () => import('../views/transship/output.vue')},

      // {path: 'user',name: 'User',component: () => import('../views/user/index.vue')},
      // {path: 'permission',name: 'Permission',component: () => import('../views/user/permission.vue')},
      // {path: 'address',name: 'Address',component: () => import('../views/user/address.vue')},

      // {path: 'order',name: 'Order',component: () => import('../views/agency/order.vue')},
      // {path: 'discount',name: 'Discount',component: () => import('../views/agency/discount.vue')},
      // {path: 'giftcard',name: 'Giftcard',component: () => import('../views/agency/giftcard.vue')},
      // {path: 'account',name: 'Account',component: () => import('../views/agency/account.vue')},

      // {path: 'bankcardapply',name: 'BankcardApply',component: () => import('../views/bankcard/apply.vue')},
      // {path: 'bankcardmanage',name: 'BankcardManage',component: () => import('../views/bankcard/manage.vue')},
      
      // {path: 'blotter',name: 'Blotter',component: () => import('../views/finance/blotter.vue')},
      // {path: 'withdrawl',name: 'Withdrawl',component: () => import('../views/finance/withdrawl.vue')},
      // {path: 'option',name: 'Option',component: () => import('../views/finance/option.vue')},
      // {path: 'charge',name: 'Charge',component: () => import('../views/finance/charge.vue')},
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
