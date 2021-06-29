<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
  import Home from '@/views/home/index.vue';
  import {auth,getUserInfo} from '@/network/user.js'

  export default {  
    name: 'App',
    components: { Home },
    methods: {
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
    },
    mounted() {
      if(localStorage.token){
        auth(localStorage.token).then(res=>{
          localStorage.uuid = res.data.data.sub;
          getUserInfo(localStorage.uuid).then(res=>{
            if(res.data&&res.data.data) {
              localStorage.nickname = res.data.data.user_nickname;
            }
          })
        });
      };

      // this.$axios({
      //   method: 'post',
      //   url: 'https://www.adidas.co.uk/api/orders/track-data',
      //   data: JSON.stringify({
      //     'orderNo': 'AUK36293125',
      //     'orderNo': 'huangxing77888877@gmail.com',
      //     'returnHub': false,
      //   }),
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //     'Access-Control-Allow-Origin': '*',
      //     "accept":"application/json",
      //     "accept-language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja-JP;q=0.6,ja;q=0.5",
      //   }
      // }).then(res=>{
      //   console.log(res);
      // })
      // document.addEventListener('plusready', function(){
      //   var xhr = new plus.net.XMLHttpRequest();
      //   xhr.onreadystatechange = function () {
      //     switch ( xhr.readyState ) {
      //       case 0:
      //         alert( "xhr请求已初始化" );
      //       break;
      //       case 1:
      //         alert( "xhr请求已打开" );
      //       break;
      //       case 2:
      //         alert( "xhr请求已发送" );
      //       break;
      //       case 3:
      //         alert( "xhr请求已响应");
      //         break;
      //       case 4:
      //         if ( xhr.status == 200 ) {
      //           alert( "xhr请求成功："+xhr.responseText );
      //         } else {
      //           alert( "xhr请求失败："+xhr.readyState );
      //         }
      //         break;
      //       default :
      //         break;
      //     }
      //   }
        
      //   let item = {card_num:5948883129,pin:"S61V"}
      //   xhr.open( "POST", "https://www.jdsports.co.uk/gift-cards/"+item.card_num);
      //   xhr.send();
      //   xhr.send(JSON.stringify({'card_num':'5948883129'}));
      // }, false );

      
      // let item = {card_num:5948883129,pin:"S61V"}
      // this.$axios({
      //   method: 'post',
      //   url: 'https://www.jdsports.co.uk/gift-cards/'+item.card_num,
      //   data: JSON.stringify({
      //     'cardPin': item.pin.toString(),
      //   }),
      //   headers: {
      //     "Content-Type": "application/json",
      //     "accept": "*/*",
      //     "x-requested-with": "XMLHttpRequest",
      //   }
      // }).then(res=>{
      //   item.balance = res.data.balance;
      //   item.right = true;
      //   this.newItems.push(item);
      // })
    },
  }
</script>

<style scoped>
  @import "assets/css/base.css";
  #app {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
  .content {
    position: fixed;
    left: 200px;
    top: 60px;
    background-color: #fff;
    width: calc(100vw - 200px);
    height: calc(100vh - 60px);
    z-index: 100;
  }
</style>
