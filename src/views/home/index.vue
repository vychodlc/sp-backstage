<template>
  <div>
    <el-container style="overflow:hidden">
      <el-aside style="width:200px;">
        <el-menu 
          :default-active="this.$route.path" 
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <el-menu-item index="/home"><i class="el-icon-menu"></i>概览</el-menu-item>
          <el-submenu index="2" v-if="menu[0]==true">
            <template slot="title"><i class="el-icon-menu"></i>资讯</template>
            <el-menu-item-group>
              <el-menu-item index="/home/post" v-if="permissions.indexOf('post_page')!=-1"><i class="el-icon-menu"></i>文章管理</el-menu-item>
              <el-menu-item index="/home/post_edit" v-if="permissions.indexOf('post_edit')!=-1"><i class="el-icon-menu"></i>文章编辑</el-menu-item>
              <el-menu-item index="/home/tag" v-if="permissions.indexOf('tag_page')!=-1"><i class="el-icon-menu"></i>标签管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3" v-if="menu[1]==true">
            <template slot="title"><i class="el-icon-menu"></i>转运</template>
            <el-menu-item-group>
              <el-menu-item index="/home/transmit" v-if="permissions.indexOf('repo_page')!=-1"><i class="el-icon-menu"></i>申报管理</el-menu-item>
              <el-menu-item index="/home/input" v-if="permissions.indexOf('repo_page')!=-1"><i class="el-icon-menu"></i>入库管理</el-menu-item>
              <el-menu-item index="/home/storage" v-if="permissions.indexOf('repo_page')!=-1"><i class="el-icon-menu"></i>库存管理</el-menu-item>
              <el-menu-item index="/home/output" v-if="permissions.indexOf('repo_out_page')!=-1"><i class="el-icon-menu"></i>出库管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="4" v-if="menu[2]==true">
            <template slot="title"><i class="el-icon-menu"></i>代购</template>
            <el-menu-item-group>
              <el-menu-item index="/home/order" v-if="permissions.indexOf('agency_page')!=-1"><i class="el-icon-menu"></i>订单管理</el-menu-item>
              <el-menu-item index="/home/giftcard" v-if="permissions.indexOf('giftcard_page')!=-1"><i class="el-icon-menu"></i>礼品卡</el-menu-item>
              <el-menu-item index="/home/account" v-if="permissions.indexOf('account_page')!=-1"><i class="el-icon-menu"></i>购物账号</el-menu-item>
              <el-menu-item index="/home/discount" v-if="permissions.indexOf('discount_page')!=-1"><i class="el-icon-menu"></i>折扣码</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="5" v-if="menu[3]==true">
            <template slot="title"><i class="el-icon-menu"></i>用户</template>
            <el-menu-item-group>
              <el-menu-item index="/home/user" v-if="permissions.indexOf('user_page')!=-1"><i class="el-icon-menu"></i>用户管理</el-menu-item>
              <el-menu-item index="/home/permission" v-if="permissions.indexOf('permission_page')!=-1"><i class="el-icon-menu"></i>用户组管理</el-menu-item>
              <el-menu-item index="/home/address" v-if="permissions.indexOf('address_page')!=-1"><i class="el-icon-menu"></i>地址管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="6" v-if="menu[4]==true">
            <template slot="title"><i class="el-icon-menu"></i>银行卡</template>
            <el-menu-item-group>
              <el-menu-item index="/home/bankcardapply" v-if="permissions.indexOf('card_page')!=-1"><i class="el-icon-menu"></i>申请管理</el-menu-item>
              <el-menu-item index="/home/bankcardmanage" v-if="permissions.indexOf('card_page')!=-1"><i class="el-icon-menu"></i>银行卡管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="7" v-if="menu[5]==true">
            <template slot="title"><i class="el-icon-menu"></i>财务</template>
            <el-menu-item-group>
              <el-menu-item index="/home/blotter" v-if="permissions.indexOf('payment_page')!=-1"><i class="el-icon-menu"></i>流水记录</el-menu-item>
              <el-menu-item index="/home/withdrawl" v-if="permissions.indexOf('withdraw_page')!=-1"><i class="el-icon-menu"></i>提现管理</el-menu-item>
              <el-menu-item index="/home/charge" v-if="permissions.indexOf('charge_page')!=-1"><i class="el-icon-menu"></i>充值管理</el-menu-item>
              <el-menu-item index="/home/option" v-if="permissions.indexOf('factor_page')!=-1"><i class="el-icon-menu"></i>代购参数管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header style="text-align: right;">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px;font-size:15px">&nbsp;{{user_nickname}}</i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="logout()">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>
        
        <el-main style="background-color: #fff;">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  export default {
    name: "Home",
    data () {
      return {
        user_nickname: null,
        user_uuid: null,
        permissions: [],
        menu: [false,false,false,false,false,false],
        menuData: []
      }
    },
    created() {
      if(this.$store.state.token==''||!localStorage.token){
        this.$router.replace('/login')
      }

      this.permissions = localStorage.permissions.split(',')
      if(this.permissions.indexOf('post_page')!=-1||this.permissions.indexOf('post_edit')!=-1||this.permissions.indexOf('tag_page')!=-1) {
        this.menu[0] = true
      }
      if(this.permissions.indexOf('repo_page')!=-1||this.permissions.indexOf('repo_out_page')!=-1) {
        this.menu[1] = true
      }
      if(this.permissions.indexOf('agency_page')!=-1||this.permissions.indexOf('giftcard_page')!=-1||this.permissions.indexOf('discount_page')!=-1||this.permissions.indexOf('account_page')!=-1) {
        this.menu[2] = true
      }
      if(this.permissions.indexOf('user_page')!=-1||this.permissions.indexOf('permission_page')!=-1||this.permissions.indexOf('address_page')!=-1) {
        this.menu[3] = true
      }
      if(this.permissions.indexOf('card_page')!=-1) {
        this.menu[4] = true
      }
      if(this.permissions.indexOf('withdraw_page')!=-1||this.permissions.indexOf('payment_page')!=-1||this.permissions.indexOf('charge_page')!=-1||this.permissions.indexOf('factor_page')!=-1) {
        this.menu[5] = true
      }

      // if(localStorage.permissions)
      //   if(this.permissions.indexOf('post_page')!=-1||this.permissions.indexOf('post_edit')!=-1||this.permissions.indexOf('tag_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('post_page')!=-1) items.push({index:'/home/post',name:'文章管理'})
      //     if(this.permissions.indexOf('post_edit')!=-1) items.push({index:'/home/post_edit',name:'文章编辑'})
      //     if(this.permissions.indexOf('tag_page')!=-1) items.push({index:'/home/tag',name:'标签管理'})
      //     this.menuData.push({title:'资讯',sub:items})
      //   }
      //   if(this.permissions.indexOf('repo_page')!=-1||this.permissions.indexOf('repo_out_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/transmit',name:'申报管理'})
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/input',name:'入库管理'})
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/storage',name:'库存管理'})
      //     if(this.permissions.indexOf('repo_out_page')!=-1) items.push({index:'/home/output',name:'出库管理'})
      //     this.menuData.push({title:'转运',sub:items})
      //   }
      //   if(this.permissions.indexOf('agency_page')!=-1||this.permissions.indexOf('giftcard_page')!=-1||this.permissions.indexOf('discount_page')!=-1||this.permissions.indexOf('account_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('agency_page')!=-1) items.push({index:'/home/order',name:'订单管理'})
      //     if(this.permissions.indexOf('giftcard_page')!=-1) items.push({index:'/home/giftcard',name:'礼品卡管理'})
      //     if(this.permissions.indexOf('discount_page')!=-1) items.push({index:'/home/discount',name:'折扣码管理'})
      //     if(this.permissions.indexOf('account_page')!=-1) items.push({index:'/home/account',name:'购物账号管理'})
      //     this.menuData.push({title:'代购',sub:items})
      //   }
      //   if(this.permissions.indexOf('user_page')!=-1||this.permissions.indexOf('permission_page')!=-1||this.permissions.indexOf('address_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('user_page')!=-1) items.push({index:'/home/user',name:'用户管理'})
      //     if(this.permissions.indexOf('permission_page')!=-1) items.push({index:'/home/permission',name:'用户组管理'})
      //     if(this.permissions.indexOf('address_page')!=-1) items.push({index:'/home/address',name:'地址管理'})
      //     this.menuData.push({title:'用户',sub:items})
      //   }
      //   if(this.permissions.indexOf('card_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/bankcardapply',name:'申请管理'})
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/bankcardmanage',name:'银行卡管理'})
      //     this.menuData.push({title:'银行卡',sub:items})
      //   }
      //   if(this.permissions.indexOf('withdraw_page')!=-1||this.permissions.indexOf('payment_page')!=-1||this.permissions.indexOf('charge_page')!=-1||this.permissions.indexOf('factor_page')!=-1) {
      //     let items = [];
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/transmit',name:'申报管理'})
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/input',name:'入库管理'})
      //     if(this.permissions.indexOf('repo_page')!=-1) items.push({index:'/home/storage',name:'库存管理'})
      //     if(this.permissions.indexOf('repo_out_page')!=-1) items.push({index:'/home/output',name:'出库管理'})
      //     this.menuData.push({title:'财务',sub:items})
      //   }
      // }
    },
    mounted() {
      this.user_nickname = localStorage.nickname;
      this.user_uuid = localStorage.uuid;
    },
    methods:{
      logout() {
        this.$message({
          message: '退出成功',
          type: 'success'
        });
        this.$store.commit('rmToken');
        this.$router.replace('/login')
      }
    }
  }
</script>

<style>
  .el-menu-item-group__title {
    display: none;
  }
</style>

<style scoped>
  .el-header {
    background-color: #ddd;
    color: #333;
    line-height: 60px;
  }
  
  .el-aside {
    color: #333;
  }
  .el-menu {
    height: 100vh;
  }
  .el-menu-item-group__title {
    display: none;
  }
</style>