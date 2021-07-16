<template>
  <div class="input" v-loading="loading">
    <div class="form">
      <el-form label-width="150px" size="mini">
        <!-- <el-form-item label="快递单号/订单号">
          <el-input v-model="inputInfo.expressid"></el-input>
        </el-form-item> -->
        <el-form-item label="品牌">
          <template>
            <el-radio v-model="inputInfo.brand" label="N">Nike</el-radio>
            <el-radio v-model="inputInfo.brand" label="A">Adidas</el-radio>
            <el-radio v-model="inputInfo.brand" label="JD">JDsports</el-radio>
            <el-radio v-model="inputInfo.brand" label="U">其他</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="方式">
          <el-radio-group v-model="inputInfo.method" @change="inputInfo.code=''">
            <el-radio style="margin-right:0" label="0" border>快递单号/订单号</el-radio>
            <el-radio style="margin-right:0" label="1" border>转运码</el-radio>
            <el-radio style="margin-right:0" label="2" border>邮箱</el-radio>
          </el-radio-group>
          <el-autocomplete
            style="margin-left:20px;width:50%"
            v-show="inputInfo.method!=''"
            class="inline-input"
            v-model="inputInfo.code"
            @input="changeInput"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="货品尺寸(cm)" style="height:28px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="长" label-width="30px">
                <el-input v-model="inputInfo.size[0]" oninput="if(value>999999999)value=999999999;if(value<0)value=0"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="宽" label-width="30px">
                <el-input v-model="inputInfo.size[1]" oninput="if(value>999999999)value=999999999;if(value<0)value=0"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="高" label-width="30px">
                <el-input v-model="inputInfo.size[2]" oninput="if(value>999999999)value=999999999;if(value<0)value=0"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品重量">
          <el-row>
            <el-col>
              <el-input v-model="inputInfo.weight" oninput="if(value>999999999)value=999999999;if(value<0)value=0"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品描述">
          <el-row>
            <el-col>
              <el-input v-model="inputInfo.description"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品图片">
          <el-upload
            ref="uploadImg"
            class="upload-demo"
            action="#"
            accept="image/jpeg,image/gif,image/png"
            :on-change='handleChangeImg'
            :on-exceed='handleExceed'
            :limit='1'
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button type="success" @click="goAdd">确 定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { addStorage,getUserByTransshipCode,getApplyIdByExpressid,getApplyList,getTransshipCodeList } from  '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  import { getUserByEmail,getUser } from '@/network/user.js'
  import * as imageConversion from 'image-conversion';
  import { validateEmail } from '@/utils/validate.js'
  export default {
    name: "Input",
    data () {
      return {
        search: '',
        isSearch: false,
        inputInfo: {
          apply_id: '',
          expressid: '',
          method: '',
          code: '',
          size: ['','',''],
          brand: '',
          weight: '',
          // pic: 'http://api.bupt404.cn/sp/cover/1621036944746-dragon.jpg',
          pic: '',
          user_id: '',
          description: '',
        },
        selectList: {
          expressid: [],
          id: [],
          code: [],
          email: [],
        },
        restaurants: [],
        loading: true,
      }
    },
    methods:{
      goAdd() {
        if(this.inputInfo.brand=='') {
          this.$message({type: 'warning',message: '请选择品牌'});
        } else if(this.inputInfo.method=='') {
          this.$message({type: 'warning',message: '请选择入库方式'});
        } else if(this.inputInfo.method=='0'&&this.inputInfo.code=='') {
          this.$message({type: 'warning',message: '请填写快递单号或订单号'});
        } else if(this.inputInfo.method=='1'&&this.inputInfo.code=='') {
          this.$message({type: 'warning',message: '请填写转运码'});
        } else if(this.inputInfo.method=='1'&&this.inputInfo.code.length!=5) {
          this.$message({type: 'warning',message: '转运码格式错误'});
        } else if(this.inputInfo.method=='2'&&this.inputInfo.code=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        } else if(this.inputInfo.method=='2'&&validateEmail(this.inputInfo.code)==false) {
          this.$message({type: 'warning',message: '邮箱格式错误'});
        } else if(this.inputInfo.size[0]=='') {
          this.$message({type: 'warning',message: '请填写长度'});
        } else if(this.inputInfo.size[0]!=parseFloat(this.inputInfo.size[0])) {
          this.$message({type:'warning',message:'请输入正确的长度'})
        } else if(this.inputInfo.size[1]=='') {
          this.$message({type: 'warning',message: '请填写宽度'});
        } else if(this.inputInfo.size[1]!=parseFloat(this.inputInfo.size[1])) {
          this.$message({type:'warning',message:'请输入正确的宽度'})
        } else if(this.inputInfo.size[2]=='') {
          this.$message({type: 'warning',message: '请填写高度'});
        } else if(this.inputInfo.size[2]!=parseFloat(this.inputInfo.size[2])) {
          this.$message({type:'warning',message:'请输入正确的高度'})
        } else if(this.inputInfo.weight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else if(this.inputInfo.weight!=parseFloat(this.inputInfo.weight)) {
          this.$message({type:'warning',message:'请输入正确的重量'})
        } else if(this.inputInfo.description=='') {
          this.$message({type: 'warning',message: '请填写货品描述'});
        } else if(this.$refs.uploadImg.uploadFiles.length==0) {
          this.$message({type: 'warning',message: '请上传图片'});
        } else {
          if(this.inputInfo.method=='1') {
            // this.inputInfo.code = '@'+this.inputInfo.code.toUpperCase();
            getUserByTransshipCode(this.inputInfo.code).then(res=>{
              if(res.data.status=='200') {
                this.inputInfo.apply_id = '0';
                this.inputInfo.user_id = res.data.user_id;
                this.addDeploy();
              } else {
                this.$message({type: 'warning',message: '转运码不存在!'});
              }
            })
          } else if(this.inputInfo.method=='2') {
            getUserByEmail(this.inputInfo.code).then(res=>{
              if(res.data.status=='200') {
                this.inputInfo.apply_id = '0';
                this.inputInfo.user_id = res.data.user_ID;
                this.addDeploy();
              } else {
                this.$message({type: 'warning',message: res.data.msg});
              }
            })
          }else {
            getApplyIdByExpressid(this.inputInfo.code).then(res=>{
              if(res.data.status=='200') {
                this.inputInfo.apply_id = res.data.apply_id;
                this.inputInfo.user_id = res.data.user_id;
                this.addDeploy();
              } else {
                this.$message({type: 'warning',message: '不存在相关申报单号!'});
              }
            })
          }
        }
      },
      addDeploy() {
        let file = this.$refs.uploadImg.uploadFiles.pop().raw;
        let fileName = new Date().getTime() + '-' +file.name;        
        imageConversion.compress(file,0.6).then(res=>{
          let uploadFile = new File([res], fileName, {type: res.type});
          addCoverImg(uploadFile).then(resImg=>{
            if(resImg.data.status=='201') {
              addStorage({
                user_id: this.inputInfo.user_id,
                apply_id: this.inputInfo.apply_id,
                brand: this.inputInfo.brand,
                size: this.inputInfo.size.join('*'), 
                weight: this.inputInfo.weight,
                description: this.inputInfo.description,
                pic: resImg.data.cover_img_url,
              }).then(resAdd=>{
                if(resAdd.data.status='200') {
                  this.$message({type: 'success',message: '入库成功!'});
                  let _brand = this.inputInfo.brand;
                  let _method = this.inputInfo.method;
                  let _code = this.inputInfo.code;
                  this.inputInfo = {
                    apply_id: '',
                    expressid: '',
                    brand: _brand,
                    code: _code,
                    method: _method,
                    size: ['','',''],
                    weight: '',
                    pic: '',
                    user_id: '',
                  };
                }
              })
            } else {
              this.$message({type: 'warning',message: '图片上传失败!'});
            }
          })
        })
      },
      handleChangeImg(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        // const isLt1M = file.raw.size / 1024 / 1024 < 1;
        const isLt1M = true;
        if (!isIMAGE) {
          this.$refs.uploadImg.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImg.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleExceed() {
        this.$message({type: 'error',message: '请删除当前图片再上传其他图片!'});
      },
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        if(this.inputInfo.method=='1') {
          queryString = queryString.toUpperCase();
          if(queryString[0]!='@') {
            queryString = '@'+queryString
          }
        }
        
        if(this.inputInfo.method=='0') {
          let query = this.selectList.expressid;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.inputInfo.method=='1') {
          let query = this.selectList.code;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.inputInfo.method=='2') {
          let query = this.selectList.email;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        }
      },
      handleSelect() {},
      createFilter(queryString) {
        return (item) => {
          if(this.inputInfo.method!='0') {
            return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1)
          } else if(this.inputInfo.method=='0') {
            return ((item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1)&&(item.apply_status=='0'));
          }
        };
      },
      changeInput() {
        if(this.inputInfo.method=='1') {
          this.inputInfo.code = this.inputInfo.code.toUpperCase();
          if(this.inputInfo.code[0]!='@') {
            this.inputInfo.code = '@'+this.inputInfo.code
          }
        }
      }
    },
    mounted() {
      getApplyList(0).then(res=>{
        let data = res.data.data;
        this.selectList.expressid = []
        data.map(item=>{
          this.selectList.expressid.push({expressid:item.expressid,value:item.expressid,user_id:item.user_id,apply_status:item.apply_status})
        })
        for(let i=0;i<data.length;i++) {
          data[i].value = data[i].expressid;
        }
        this.selectList.id = data;
        getTransshipCodeList().then(res=>{
          let data = res.data.data;
          for(let i=0;i<data.length;i++) {
            data[i].value = data[i].code;
          }
          this.selectList.code = data;
          getUser(0).then(res=>{
            let data = res.data.data;
            for(let i=0;i<data.length;i++) {
              data[i].value = data[i].user_email;
            }
            this.selectList.email = data;
            this.loading = false;
          })
        })
      })
    }
  }
</script>

<style scoped>
  .input {
    margin: 0 auto;
    width: 80%;
    height: 100%;
    /* align-items: center;
    display: flex; */
  }
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>