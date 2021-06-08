<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="库存编号" value="storage_ID"></el-option>
      <el-option label="用户ID" value="user_id"></el-option>
      <el-option label="尺寸" value="size"></el-option>
      <el-option label="重量" value="weight"></el-option>
      <el-option label="入库员ID" value="recorder"></el-option>
      <el-option label="状态" value="storage_status"></el-option>
    </el-select>
    <template v-if="this.filter=='storage_status'">
      <el-radio v-model="search" label="0">库存中</el-radio>
      <el-radio v-model="search" label="1">已出库</el-radio>
    </template>
    <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input>
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="库存编号" prop="storage_ID"></el-table-column>
      <el-table-column label="用户编号" prop="user_id">
        <template slot-scope="scope">
          <span>{{scope.row.user_id}}-{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column label="尺寸" prop="size"></el-table-column>
      <el-table-column label="重量" prop="weight"></el-table-column>
      <el-table-column label="图片" prop="pic">
        <template slot-scope="scope">
          <el-image class="storage_pic" :src="scope.row.pic" alt="" :preview-src-list="[scope.row.pic]"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
      <el-table-column label="入库员" prop="recorder"></el-table-column>
      <el-table-column label="入库时间" prop="storage_time"></el-table-column>
      <el-table-column label="状态" prop="storage_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.storage_status==0">库存中</el-tag>
          <!-- <el-tag size="mini" v-if="scope.row.storage_status==1" type="success">待出库</el-tag> -->
          <el-tag size="mini" v-if="scope.row.storage_status==1" type="info">已出库</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="200">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="$router.replace({name:'Input'})">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增库存信息" :visible.sync="dialogAddVisible">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户编号">
          <el-input type="number" v-model="newStorage.user_id"></el-input>
        </el-form-item>
        <el-form-item label="货品尺寸">
          <el-row>
            <el-col>
              <el-form-item label="长(cm)" label-width="80px">
                <el-input type="number" v-model="newStorage.size[0]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="宽(cm)" label-width="80px">
                <el-input type="number" v-model="newStorage.size[1]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="高(cm)" label-width="80px">
                <el-input type="number" v-model="newStorage.size[2]"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="重量">
          <el-input v-model="newStorage.weight"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            ref="uploadImgStorage"
            class="upload-demo"
            action="#"
            accept="image/jpeg,image/gif,image/png"
            :on-change='handleChangeImg'
            :on-exceed='handleExceed'
            :limit='1'
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'修改库存信息——库存编号:'+editStorageID" :visible.sync="dialogEditVisible">
      <el-form label-width="100px" size="mini">
        <el-form-item label="库存编号">
          <el-input v-model="editStorageID" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="货品尺寸">
          <el-row>
            <el-col>
              <el-form-item label="长(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[0]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="宽(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[1]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="高(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[2]"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="重量">
          <el-input v-model="editStorageWeight"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <template>
            <el-image style="width:100px" :src='editStoragePic'></el-image>
            <el-upload
              ref="uploadImgStorageEdit"
              class="upload-demo"
              action="#"
              accept="image/jpeg,image/gif,image/png"
              :on-change='handleChangeImgEdit'
              :on-exceed='handleExceed'
              :limit='1'
              list-type="picture"
              :auto-upload="false">
              <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
            </el-upload>
          </template>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='库存状态修改' :visible.sync="dialogChangeVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">库存中</el-radio>
          <el-radio v-model="dialogChange" label="1">已出库</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </div>
    </el-dialog>
    <div class="pagination">
      <el-pagination
        small
        layout="prev, pager, next, total"
        :total="pageNum"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import { addStorage,delStorage,editStorage,getStorageList,changeStorage,filterStorage } from '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  import * as imageConversion from 'image-conversion';
  import { validateEmail } from '@/utils/validate.js'
  import { compress } from '@/utils/compress.js'
  export default {
    name: "Transmit",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'storage_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,

        dialogAddVisible: false,
        newStorage: {
          user_id: '',
          email: '',
          apply_id: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: '',
          description: '',
        },
        newStorageExpressid: '',
        newStorageEmail: '',

        dialogEditVisible: false,
        editStorageID: '',
        editStorageSize: '',
        editStorageNumber: '',
        editStorageWeight: '',
        editStoragePic: '',
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldStorage: null,

        pageNum: null,
        currentPage: 1,
        interpret: {
          'storage_ID': {name:'库存编号'},
          'user_id': {name:'用户ID'},
          'size': {name:'尺寸'},
          'weight': {name:'重量'},
          'recorder': {name:'入库员ID'},
          'storage_status': {name:'状态'}
        }
      }
    },
    mounted() {
      this._getList(this.currentPage);
    },
    methods:{
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          filterStorage(this.filter,this.search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.storages_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getStorageList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.storages_num);
              this.tableData = res.data.data;
              this.loading = false;
              console.log(this.tableData);
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        this.newStorage = {
          user_id: '',
          apply_id: '0',
          email: '',
          expressid: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: ''
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newStorage.user_id=='') {
          this.$message({type: 'warning',message: '请填写用户编号'});
        } else if(this.newStorage.apply_id=='') {
          this.$message({type: 'warning',message: '请填写申报单号'});
        } else if(this.newStorage.size[0]=='') {
          this.$message({type: 'warning',message: '请填写长度'});
        } else if(this.newStorage.size[1]=='') {
          this.$message({type: 'warning',message: '请填写宽度'});
        } else if(this.newStorage.size[2]=='') {
          this.$message({type: 'warning',message: '请填写高度'});
        } else if(this.newStorage.weight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else if(this.newStorage.weight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else if(this.$refs.uploadImgStorage.uploadFiles.length==0) {
          this.$message({type: 'warning',message: '请上传图片'});
        } else {        
          this.loading = true;
          let file = this.$refs.uploadImgStorage.uploadFiles.pop().raw;
          let fileName = new Date().getTime() + '-' +file.name;
          imageConversion.compress(file,0.6).then(res=>{
            let uploadFile = new File([res], fileName, {type: res.type});
            addCoverImg(uploadFile).then(res=>{
              if(res.data.status=='201') {
                this.dialogAddVisible = false;
                addStorage({
                  article_num: this.newStorage.article_num, 
                  user_id: this.newStorage.user_id,
                  apply_id: this.newStorage.apply_id,
                  size: this.newStorage.size.join('*'), 
                  weight: this.newStorage.weight,
                  pic: res.data.cover_img_url,
                }).then(resAdd=>{
                  if(resAdd.data.status=='200') {
                    this.loading = false;
                    this.currentPage = 1;
                    this.$message({type: 'success',message: '新增成功'});
                    this._getList(this.currentPage);
                  }
                  else {
                    this.$message({type: 'warning',message: '新增失败——'+resAdd.data.msg});
                  }
                })
              } else {
                this.$message({type: 'warning',message: '图片上传失败——'+res.data.msg});
                this.loading = false;
              }
            })
          })
        }
      },
      handleEdit(index,row) {
        this.editStorageID = row.storage_ID;
        this.editStorageSize = row.size.split('*').map(item=>parseInt(item));
        this.editStorageNumber = row.article_num;
        this.editStorageWeight = row.weight;
        this.editStoragePic = row.pic;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if (this.editStorageSize[0]=='') {
          this.$message({type: 'warning',message: '请填写长度'});
        } else if (this.editStorageSize[1]=='') {
          this.$message({type: 'warning',message: '请填写宽度'});
        } else if (this.editStorageSize[2]=='') {
          this.$message({type: 'warning',message: '请填写高度'});
        } else if (this.editStorageWeight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else {
          this.dialogEditVisible = false;
          this.loading = true;
          if(this.$refs.uploadImgStorageEdit.uploadFiles.length==0) {
            this.goEditDeploy();
          } else {
            let file = this.$refs.uploadImgStorageEdit.uploadFiles.pop().raw;
            let fileName = new Date().getTime() + '-' +file.name;
            imageConversion.compress(file,0.6).then(res=>{
              let uploadFile = new File([res], fileName, {type: res.type});
              addCoverImg(uploadFile).then(res=>{
                if(res.data.status=='201') {
                  this.dialogAddVisible = false;
                  this.editStoragePic = res.data.cover_img_url;
                  this.goEditDeploy();
                } else {
                  this.$message({type: 'warning',message: '图片上传失败——'+res.data.msg});
                  this.loading = false;
                }
              })
            })
          }
        }       
      },
      goEditDeploy() {
        editStorage({
          'storage_ID': this.editStorageID,
          'article_num': this.editStorageNumber,
          'size': this.editStorageSize.join('*'),
          'weight': this.editStorageWeight,
          'pic': this.editStoragePic,
        }).then(res=>{
          if(res.data.status=='200') {
            this.dialogEditVisible = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.$message({type: 'success',message: '修改成功'});
          } else {
            this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            this.loading = false;
          }
        })
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.storage_ID +'的库存信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delStorage(row.storage_ID).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
              this.currentPage = 1;
              this._getList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },

      handleChangeImg(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImgStorage.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImgStorage.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleChangeImgEdit(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImgStorageEdit.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImgStorageEdit.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleExceed() {
        this.$message({type: 'error',message: '请删除当前图片再上传其他图片!'});
      },

      handleChange(row) {
        this.dialogChange = row.storage_status;
        this.oldStorage = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.oldStorage.storage_status!=this.dialogChange) {
          changeStorage(this.oldStorage.storage_ID,this.dialogChange).then(res => {
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '状态修改成功'});
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.dialogChangeVisible = false;
            } else {
              this.$message({type: 'warning',message: '状态修改失败'});
            }
          })
        } else {
          this.$message({type: 'warning',message: '状态未修改'});
        }
      },

      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
        if(this.search==''||this.search==null) {
          this.$message({type: 'warning',message: '请输入搜索词'});
        } else {
          this.isSearch = true;
          if(this.filter=='storage_status') {
            this.searchWord=(this.search=='0')?'库存中':'已出库';
          } else {
            this.searchWord = this.search;
          }
          this.filterWord = this.interpret[this.filter].name;
          this.loading = true;
          this.currentPage = 1;
          this._getList(this.currentPage)
        }
      },
      goBack() {
        this.isSearch=false;
        this.search=null;
        this.currentPage = 1;
        this._getList(this.currentPage)
      },
      filterChange() {
        this.search = '';
      }
    }
  }
</script>
<style scoped>
  .post-container {
    position: relative;
  }
  .pagination {
    position: absolute;
    right: 20px;
  }
  .storage_pic {
    width: 40%;
  }
</style>