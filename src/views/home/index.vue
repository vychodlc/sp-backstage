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
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-menu"></i>资讯</template>
            <el-menu-item-group>
              <el-menu-item index="/home/post"><i class="el-icon-menu"></i>文章管理</el-menu-item>
              <el-menu-item index="/home/post_edit"><i class="el-icon-menu"></i>文章编辑</el-menu-item>
              <el-menu-item index="/home/tag"><i class="el-icon-menu"></i>标签管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title"><i class="el-icon-menu"></i>转运</template>
            <el-menu-item-group>
              <el-menu-item index="/home/transmit"><i class="el-icon-menu"></i>申报管理</el-menu-item>
              <el-menu-item index="/home/storage"><i class="el-icon-menu"></i>库存管理</el-menu-item>
              <el-menu-item index="/home/output"><i class="el-icon-menu"></i>出库管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-menu-item index="/home/user"><i class="el-icon-menu"></i>用户管理</el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header style="text-align: right;">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px;font-size:15px">&nbsp;{{user_nickname}}</i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>查看</el-dropdown-item>
              <el-dropdown-item>新增</el-dropdown-item>
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
      }
    },
    created() {
      if(this.$store.state.token==''||!localStorage.token){
        this.$router.push('/login')
      }
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
        this.$router.push('/login')
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