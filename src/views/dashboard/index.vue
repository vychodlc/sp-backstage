<template>
  <div>
    <el-button type="primary" @click="see()">看一眼</el-button>
    <el-button type="primary" @click="test()">提交</el-button>
    <el-button type="primary" @click="del()">删除</el-button>
  </div>
</template>

<script>
import { addTag, getTag } from '@/network/tag.js'
export default {
  name: "Dashboard",
  data () {
   return {}
  },
  methods:{
    see() {
      console.log(this.$store.state);
    },
    test() {
      addTag('JDsports').then(res=>{
        console.log(res);
      })
      // getTag().then(res=>{
      //   console.log(res);
      // })
    },
    del() {
      
    }
  }
}
</script>

<style scoped>
</style>