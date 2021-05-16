<template>
  <div class="input">
    <div class="form">
      <el-form label-width="150px" size="medium">
        <el-form-item label="快递单号/订单号">
          <el-input v-model="inputInfo.expressid"></el-input>
        </el-form-item>
        <el-form-item label="品牌">
          <template>
            <el-radio v-model="inputInfo.brand" label="N">Nike</el-radio>
            <el-radio v-model="inputInfo.brand" label="A">Adidas</el-radio>
            <el-radio v-model="inputInfo.brand" label="JD">JDsports</el-radio>
            <el-radio v-model="inputInfo.brand" label="U">其他</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="转运码">
          <el-row>
            <el-col :span="8">
              <el-radio-group v-model="inputInfo.hasCode">
                <el-radio label="0" border>无</el-radio>
                <el-radio label="1" border>有</el-radio>
              </el-radio-group>
            </el-col>
            <el-col :span="16">
              <el-input v-model="inputInfo.code" v-if="inputInfo.hasCode==1"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品尺寸" style="height:28px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="长(cm)" label-width="80px">
                <el-input type="number" v-model="inputInfo.size[0]"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="宽(cm)" label-width="80px">
                <el-input type="number" v-model="inputInfo.size[1]"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="高(cm)" label-width="80px">
                <el-input type="number" v-model="inputInfo.size[2]"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品重量">
          <el-row>
            <el-col>
          <el-input v-model="inputInfo.weight"></el-input></el-col>
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
  import {addStorage,getUserByTransshipCode,getApplyIdByExpressid} from  '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  export default {
    name: "Input",
    data () {
      return {
        search: '',
        isSearch: false,
        inputInfo: {
          apply_id: '',
          expressid: '',
          hasCode: "1",
          code: '',
          size: ['','',''],
          brand: '',
          weight: '',
          // pic: 'http://api.bupt404.cn/sp/cover/1621036944746-dragon.jpg',
          pic: '',
          user_id: '',
        },
      }
    },
    methods:{
      goAdd() {
        if(this.inputInfo.expressid=='') {
          this.$message({type: 'warning',message: '请填写快递单号或订单号'});
        } else if(this.inputInfo.brand=='') {
          this.$message({type: 'warning',message: '请选择品牌'});
        } else if(this.inputInfo.hasCode=='1'&&this.inputInfo.code=='') {
          this.$message({type: 'warning',message: '请填写转运码'});
        } else if(this.inputInfo.hasCode=='1'&&this.inputInfo.code[0]!='@') {
          this.$message({type: 'warning',message: '转运码格式错误'});
        } else if(this.inputInfo.hasCode=='1'&&this.inputInfo.code.length!=5) {
          this.$message({type: 'warning',message: '转运码格式错误'});
        } else if(this.inputInfo.size[0]=='') {
          this.$message({type: 'warning',message: '请填写长度'});
        } else if(this.inputInfo.size[1]=='') {
          this.$message({type: 'warning',message: '请填写宽度'});
        } else if(this.inputInfo.size[2]=='') {
          this.$message({type: 'warning',message: '请填写高度'});
        } else if(this.inputInfo.weight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else if(this.$refs.uploadImg.uploadFiles.length==0) {
          this.$message({type: 'warning',message: '请上传图片'});
        } else {
          if(this.inputInfo.hasCode=='1') {
            this.inputInfo.code = this.inputInfo.code.toUpperCase();
            getUserByTransshipCode(this.inputInfo.code).then(res=>{
              if(res.data.status=='200') {
                this.inputInfo.apply_id = '0';
                this.inputInfo.user_id = res.data.user_id;
                this.addDeploy();
              } else {
                this.$message({type: 'warning',message: '转运码不存在!'});
              }
            })
          } else {
            getApplyIdByExpressid(this.inputInfo.expressid).then(res=>{
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
        let uploadFile = new File([file], fileName, {type: file.type});
        addCoverImg(uploadFile).then(resImg=>{
          if(resImg.data.status=='201') {
            addStorage({
              user_id: this.inputInfo.user_id,
              apply_id: this.inputInfo.apply_id,
              brand: this.inputInfo.brand,
              size: this.inputInfo.size.join('*'), 
              weight: this.inputInfo.weight,
              // pic: this.inputInfo.pic,
              pic: resImg.data.cover_img_url,
            }).then(resAdd=>{
              if(resAdd.data.status='200') {
                this.$message({type: 'success',message: '入库成功!'});
                this.inputInfo = {
                  apply_id: '',
                  expressid: '',
                  hasCode: "1",
                  code: '',
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