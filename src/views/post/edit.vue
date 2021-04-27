<template>
  <div class="post_container" v-loading="loading">
    <div class="post_edit">
      <div class="post_form">
        <el-form :model="postForm" ref="postForm" label-width="100px" class="postForm" size="mini">
          <el-form-item label="标题" prop="title">
            <el-input v-model="postForm.title"></el-input>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-select v-model="postForm.tags" multiple placeholder="请选择">
              <el-option
                v-for="(key,item) in tags"
                :key="key"
                :label="key"
                :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="归档" prop="menu">
            <el-radio-group v-model="postForm.menu">
              <el-radio label="品牌" border>品牌</el-radio>
              <el-radio label="种类" border>种类</el-radio>
              <el-radio label="年代" border>年代</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="封面图片" prop="cover">
            <img v-if="isEdit" :src="postForm.cover" style="width:50%" alt="">
            <el-upload
              ref="uploadCover"
              class="upload-demo"
              action="#"
              accept="image/jpeg,image/gif,image/png"
              :on-change='handleChange'
              :on-exceed='handleExceed'
              :limit='1'
              list-type="picture"
              :auto-upload="false">
              <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              <div v-if="isEdit" slot="tip" class="el-upload__tip">上传新封面——只能上传jpg/png/gif文件，且不超过1MB</div>
              <div v-else slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="活动" :inline='true' prop="activity">
            <el-radio-group v-model="postForm.activity">
              <el-radio label="0" border>无</el-radio>
              <el-radio label="1" border>代购</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="活动开始时间" v-if="postForm.activity!=0&&postForm.activity!=null" prop="act_start_time">
            <el-date-picker
              v-model="postForm.act_start_time"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="活动结束时间" v-if="postForm.activity!=0&&postForm.activity!=null" prop="act_end_time">
            <el-date-picker
              v-model="postForm.act_end_time"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="活动链接" v-if="postForm.activity!=0&&postForm.activity!=null" prop="act_link">
            <el-input placeholder="输入商品链接" v-model="postForm.act_link"></el-input>
          </el-form-item>
          <el-form-item label="优先级" prop="rank">
            <el-rate v-model="postForm.rank"></el-rate>
          </el-form-item>
          <el-form-item label="文章内容">
            <el-upload
              drag
              style="display:none"
              ref="uploadContentImg"
              action="#"
              class="quill-upload"
              id="uploadContentImg"
              accept="image/jpeg,image/gif,image/png"
              :on-change='handleChange2'
              :auto-upload="false">
              <i class="el-icon-upload"></i>
            </el-upload>
            <quill-editor
              class="edit_box"
              v-model="postForm.content" 
              ref="myQuillEditor" 
              :options="editorOption" 
              @blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
              @change="onEditorChange($event)">
            </quill-editor>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="post_preview">
      <div class="post_preview_html" v-html="getHtml()"></div>
      <div class="submit">
        <el-button size="mini" @click="$router.replace('/home/post')">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm('postForm')">提交</el-button>
        <!-- <el-button size="mini" type="primary" @click="test()">测试</el-button> -->
      </div>
    </div>
  </div>
</template>
<script>
import { getTag } from '@/network/tag.js'
import { addPost,editPost,addCoverImg,getPostDetail } from '@/network/post.js'
import { msToDate } from '@/utils/time.js'
import { imgUrlToFile,dataURLtoFile,Url2Base64 } from '@/utils/image.js'

import { quillEditor } from "vue-quill-editor"; //调用编辑器
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
export default {
  name: 'PostEdit',
  components: {
    quillEditor
  },
  data() {
    return {
      loading: true,
      postForm: {
        id: null,
        author: null,
        author_id: null,
        title: '',
        tags: [],
        menu: null,
        activity: null,
        act_start_time: '',
        act_end_time: '',
        act_link: '',
        cover: '',
        rank: null,
        content: ''
      },
      tags: {},
      str: '',
      editorOption: {
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ color: [] }, { background: [] }],
              ["image"]
            ],
            handlers: {
              'image': function (value) {
                document.querySelector('.quill-upload .el-icon-upload').click()
              }
            }
          }
        },
        placeholder: '输入文章内容'
      },
      isEdit: false
    }
  },
  methods: {
    onEditorReady(editor) {}, // 准备编辑器
    onEditorBlur(){}, // 失去焦点事件
    onEditorFocus(){}, // 获得焦点事件
    onEditorChange(){}, // 内容改变事件
    // 转码
    escapeStringHTML(str) {
      str = str.replace(/&lt;/g,'<');
      str = str.replace(/&gt;/g,'>');
      return str;
    },
    getHtml() {
      return '<h1>'+this.postForm.title+'</h1>'+'<h4>'+'</h4>'+this.escapeStringHTML(this.postForm.content);
    },
    handleChange(file,filelist) {
      const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
      const isLt1M = file.raw.size / 1024 / 1024 < 1;
      if (!isIMAGE) {
        this.$refs.uploadCover.uploadFiles.pop().raw;
        this.$message.error('上传文件只能是图片格式!');
      }
      if (!isLt1M) {
        this.$refs.uploadCover.uploadFiles.pop().raw;
        this.$message.error('上传文件大小不能超过 1MB!');
      }
      return isIMAGE && isLt1M;
    },
    handleChange2(f,filelist) {
      let file = this.$refs.uploadContentImg.uploadFiles.pop().raw;
      let fileName = new Date().getTime() + '-' +file.name;
      let uploadFile = new File([file], fileName, {type: file.type});
      addCoverImg(uploadFile).then(res=>{
        if(res.data.status=='201') {
          console.log(res.data);
          const quill=this.$refs.myQuillEditor.quill;
          const pos=quill.getSelection().index;
          quill.insertEmbed(pos,'image',res.data.cover_img_url);
        }
      })
    },
    handleExceed() {
      this.$message({type: 'error',message: '请删除当前封面再上传其他封面!'});
    },
    submitForm() {
      console.log(this.postForm,this.isEdit);
      if(this.postForm.title=='') {
        this.$message({type: 'error',message: '请填写文章标题!'});
      } else if (this.postForm.title.length>30||this.postForm.title.length<5) {
        this.$message({type: 'error',message: '文章标题限制为5~30字!'});
      } else if (this.postForm.tags.length==0) {
        this.$message({type: 'error',message: '请选择文章标签!'});
      } else if (this.postForm.menu==null) {
        this.$message({type: 'error',message: '请选择文章归档!'});
      } else if (this.$refs.uploadCover.uploadFiles.length==0&&this.isEdit==false) {
        this.$message({type: 'error',message: '请选择文章封面!'});
      } else if (this.postForm.activity==null) {
        this.$message({type: 'error',message: '请选择是否有活动!'});
      } else if (this.postForm.activity==1&&(this.postForm.act_start_time==''||this.postForm.act_start_time==null||this.postForm.act_start_time=="0000-00-00 00:00:00")) {
        this.$message({type: 'error',message: '请选择活动开始时间!'});
      } else if (this.postForm.activity==1&&(this.postForm.act_end_time==''||this.postForm.act_end_time==null||this.postForm.act_end_time=="0000-00-00 00:00:00")) {
        this.$message({type: 'error',message: '请选择活动结束时间!'});
      } else if (this.postForm.activity==1&&(this.postForm.act_link=='')) {
        this.$message({type: 'error',message: '请选择活动链接!'});
      } else if (this.postForm.rank==0) {
        this.$message({type: 'error',message: '请选择文章优先级!'});
      } else if (this.postForm.content=='') {
        this.$message({type: 'error',message: '请输入文章内容!'});
      } else {
        this.loading = true;
        if (this.isEdit==true&&this.$refs.uploadCover.uploadFiles==0) {
          if(this.postForm.activity==0) {
            this.postForm.act_start_time=''
            this.postForm.act_end_time=''
            this.postForm.act_link=''
          }
          if(this.postForm.act_start_time!=''&&this.postForm.act_start_time.toString().indexOf('GMT')!=-1){this.postForm.act_start_time = msToDate(this.postForm.act_start_time.getTime()).hasTime};
          if(this.postForm.act_end_time!=''&&this.postForm.act_end_time.toString().indexOf('GMT')!=-1){this.postForm.act_end_time = msToDate(this.postForm.act_end_time.getTime()).hasTime};  
          editPost(this.postForm).then(res=>{
            console.log('EDIT NO IMG');
            if(res.data.status='200') {
              this.$message({type: 'success',message: '修改文章成功!'});
              this.$router.replace('/home/post');
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg});
              this.loading = false;
            }
          })
        } else {
          let file = this.$refs.uploadCover.uploadFiles.pop().raw;
          let fileName = new Date().getTime() + '-' +file.name;
          let uploadFile = new File([file], fileName, {type: file.type});
          addCoverImg(uploadFile).then(res=>{
            if(res.data.status=='201') {
              this.postForm.cover = res.data.cover_img_url;
              if(this.postForm.activity==0) {
                this.postForm.act_start_time=''
                this.postForm.act_end_time=''
                this.postForm.act_link=''
              }
              if(this.postForm.act_start_time!=''){this.postForm.act_start_time = msToDate(this.postForm.act_start_time.getTime()).hasTime};
              if(this.postForm.act_end_time!=''){this.postForm.act_end_time = msToDate(this.postForm.act_end_time.getTime()).hasTime};  
              
              if(this.isEdit==true) {
                editPost(this.postForm).then(res=>{
                  console.log('EDIT HAS IMG');
                  if(res.data.status='200') {
                    this.$message({type: 'success',message: '修改文章成功!'});
                    this.$router.replace('/home/post')
                    this.loading = false;
                  } else {
                    this.$message({type: 'error',message: res.data.msg});
                    this.loading = false;
                  }
                })
              } else {
                this.postForm.author = localStorage.nickname;
                this.postForm.author_id = localStorage.uuid;
                addPost(this.postForm).then(res=>{
                  console.log('ADD HAS IMG');
                  if(res.data.status='200') {
                    this.$message({type: 'success',message: '新建文章成功!'});
                    this.$router.replace('/home/post')
                    this.loading = false;
                  } else {
                    this.$message({type: 'error',message: res.data.msg});
                    this.loading = false;
                  }
                })
              }
            } else {
              this.$message({type: 'error',message: res.data.msg});
              this.loading = false;
            }
          })
        }
      }
      
    },
    uploadImg() {

    },
    quillSuccess(res) {
      console.log(res);
    },
    test() {
      console.log(this.$refs.myQuillEditor.quill);
    }
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  mounted() {
    // var vm =this
    // var imgHandler = function(image) {
    //   vm.addImgRange = vm.$refs.myQuillEditor.quill.getSelection()
    //   if (image) {
    //     var fileInput = document.getElementById('goImage');
    //     fileInput.click();
    //   }
    // }
    // vm.$refs.myQuillEditor.quill.getModule("toolbar").addHandler("image", imgHandler)
    getTag().then(res=> {
      if(res.data.status=='200') {
        this.tags = res.data.data;
      }
      if(this.$route.params.id==undefined) {
        this.loading = false;
      }
    });
    if(this.$route.params.id!=undefined) {
      this.loading = true;
      this.isEdit = true;
      let editId = this.$route.params.id;
      getPostDetail(editId).then(res=>{
        if(res.data.status=='200') {
          console.log(res.data.data);
          this.postForm.id = res.data.data.ID;
          this.postForm.author = res.data.data.author;
          this.postForm.author_id = res.data.data.author_id;
          this.postForm.title = res.data.data.post_title;
          this.postForm.tags = res.data.data.tags.split(',');
          this.postForm.menu = res.data.data.menu;
          this.postForm.activity = res.data.data.activity;
          if(this.postForm.activity==0) {
            this.postForm.act_start_time = '';
            this.postForm.act_end_time = '';
          } else {
            this.postForm.act_start_time = res.data.data.start_time;
            this.postForm.act_end_time = res.data.data.end_time;
          }
          this.postForm.act_link = res.data.data.link;
          let img_url = res.data.data.cover_img
          this.postForm.cover = img_url;
          this.postForm.rank = parseInt(res.data.data.rank);
          this.postForm.content = res.data.data.post_content;
          this.loading = false;
        }
      })
    }
  }
}
</script>

<style src="@/assets/css/post_edit.css"></style>
<style scoped>
.post_container {
  display: flex;
  height: 100%;
}
.post_edit {
  width: 60vw;
  height: calc(100vh - 60px - 20px * 2);
  /* height: 60vh; */
  overflow-y: scroll;
  padding-right: 10px;
  padding-bottom: 30px;
}
.post_preview {
  flex: 1;
  padding: 0 50px;
  height: calc(100vh - 60px - 20px * 2);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.submit {
  position: absolute;
  right: 0px;
  bottom: -10px;
}
.quill-editor{
  height: 50vh;
}
</style>