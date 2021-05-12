<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="申报单号" value="outbound_ID"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="出库方式" value="outbound_type"></el-option>
      <el-option label="状态" value="outbound_status"></el-option>
    </el-select>
    <template v-if="this.filter=='outbound_status'">
      <el-radio v-model="search" label="0">未出库</el-radio>
      <el-radio v-model="search" label="1">已驳回</el-radio>
      <el-radio v-model="search" label="2">待出库</el-radio>
      <el-radio v-model="search" label="3">转运中</el-radio>
      <el-radio v-model="search" label="4">清关中</el-radio>
      <el-radio v-model="search" label="5">国内配送中</el-radio>
      <el-radio v-model="search" label="6">已完成</el-radio>
    </template>
    <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input>
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      height="75vh">
      <el-table-column label="出库单号" prop="outbound_ID"></el-table-column>
      <el-table-column label="货物编号" width="150">
        <template slot-scope="scope">
          <el-tag size="mini" style="margin:2px" v-for="(item,index) in scope.row.article_nums" :key="index">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" prop="address"></el-table-column>
      <el-table-column label="用户编号" prop="user_id"></el-table-column>
      <el-table-column label="出库申请时间" prop="outbound_apply_time"></el-table-column>
      <el-table-column label="出库时间" prop="outbound_time"></el-table-column>
      <el-table-column label="出库方式" prop="outbound_type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.outbound_type==0" type="success">普通出库</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_type==2" type="info">退税出库</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退税材料" prop="material"></el-table-column>
      <el-table-column label="状态" prop="outbound_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.outbound_status==0" type="warning">未出库</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==1" type="success">已驳回</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==2" type="info">待出库</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==3" type="success">转运中</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==4" type="info">清关中</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==5" type="success">国内配送中</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==6" type="info">已完成</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="250">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="warning"
            v-if="scope.row.outbound_status==0"
            @click="handleRefuse(scope.row)">驳回</el-button>
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
    
    <el-dialog title="新增出库信息" :visible.sync="dialogAddVisible">
      <span>首先输入用户编号，在获取用户的库存信息之后，再选择出库的方式(普通/退税)</span>
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <el-form-item label="用户编号">
          <el-row>
            <el-col :span='15'>
              <el-input v-model="newOutput.user_id" @input="userStorage=[]"></el-input>
            </el-col>
            <el-col :span='3'>
              <el-button style="margin-left:20px" @click="_getUserStorage(newOutput.user_id)" size="mini">获取库存信息</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品编号" v-if="userStorage.length>0">
          <el-select 
            v-model="newOutput.article_nums" 
            multiple 
            filterable
            default-first-option
            placeholder="请选择"
            width='100%'
          >
            <el-option
              v-for="(item,index) in userStorage"
              :key="index"
              :label="item.article_num"
              :value="item.article_num">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="newOutput.address"></el-input>
        </el-form-item>
        <el-form-item label="出库方式">
          <el-radio v-model="newOutput.outbound_type" label="0">普通出库</el-radio>
          <el-radio v-model="newOutput.outbound_type" label="1">退税出库</el-radio>
          <div style="color:#aaa" v-if="newOutput.outbound_type==='0'">之后无法申请选中商品的退税操作</div>
          <div style="color:#aaa" v-if="newOutput.outbound_type==1">请上传退税材料</div>
        </el-form-item>
        <el-form-item v-if="newOutput.outbound_type==1" label="退税材料">
          <el-upload
            ref="uploadImgOutputAdd"
            class="upload-demo"
            action="#"
            accept="image/jpeg,image/gif,image/png"
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
    <el-dialog title='出库状态修改' :visible.sync="dialogChangeVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">未出库</el-radio>
          <el-radio v-model="dialogChange" label="1">已驳回</el-radio>
          <el-radio v-model="dialogChange" label="2">待出库</el-radio>
          <el-radio v-model="dialogChange" label="3">转运中</el-radio>
          <el-radio v-model="dialogChange" label="4">清关中</el-radio>
          <el-radio v-model="dialogChange" label="5">国内配送中</el-radio>
          <el-radio v-model="dialogChange" label="6">已完成</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改出库信息" :visible.sync="dialogEditVisible">
      <span>首先输入用户编号，在获取用户的库存信息之后，再选择出库的方式(普通/退税)</span>
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <el-form-item label="用户编号">
          <el-row>
            <el-col :span='15'>
              <el-input v-model="editOutput.user_id" @input="userStorage=[]"></el-input>
            </el-col>
            <el-col :span='3'>
              <el-button style="margin-left:20px" @click="_getUserStorage(editOutput.user_id)" size="mini">获取库存信息</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品编号" v-if="userStorage.length>0">
          <el-select 
            v-model="editOutput.article_nums" 
            multiple 
            filterable
            default-first-option
            placeholder="请选择"
            width='100%'
          >
            <el-option
              v-for="(item,index) in userStorage"
              :key="index"
              :label="item.article_num"
              :value="item.article_num">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="editOutput.address"></el-input>
        </el-form-item>
        <el-form-item label="出库方式">
          <el-radio v-model="editOutput.outbound_type" label="0">普通出库</el-radio>
          <el-radio v-model="editOutput.outbound_type" label="1">退税出库</el-radio>
          <div style="color:#aaa" v-if="editOutput.outbound_type==='0'">之后无法申请选中商品的退税操作</div>
          <div style="color:#aaa" v-if="editOutput.outbound_type==1">请上传退税材料</div>
        </el-form-item>
        <el-form-item v-if="editOutput.outbound_type==1" label="退税材料">
          <el-upload
            ref="uploadImgOutputEdit"
            class="upload-demo"
            action="#"
            accept="image/jpeg,image/gif,image/png"
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goEdit()" size="mini">确 定</el-button>
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
  import { addApply,delApply,editApply,getApplyList,changeApply, addStorage,filterApply } from '@/network/transship.js'
  import { getUserStorage,addOutput,delOutput,editOutput,getOutputList,changeOutput,filterOutput } from '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  import { validateEmail } from '@/utils/validate.js'
  export default {
    name: "Transmit",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'outbound_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,

        dialogAddVisible: false,
        newApplyExpressid: '',
        newApplyEmail: '',

        dialogEditVisible: false,
        editOutput: {
          article_nums: [],
          user_id: '',
          outbound_type: '',
          material: '',
          address: ''
        },

        editApplyID: '',
        editApplyExpressid: '',
        editApplyEmail: '',
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldApply: null,

        newOutput: {
          article_nums: [],
          user_id: '',
          outbound_type: '',
          material: '',
          address: ''
        },

        pageNum: null,
        currentPage: 1,
        interpret: {
          'outbound_ID': {name:'出库单号'},
          'user_id': {name:'用户ID'},
          'outbound_type': {name:'出库方式'},
          'outbound_status': {name:'状态'},
        },
        userStorage: []
      }
    },
    computed: {
      getStorage: function () {
        return []
      }
    },
    mounted() {
      this._getList(this.currentPage);
    },
    methods:{
      test() {
        console.log(123);
      },
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          filterOutput(this.filter,this.search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.filter_num);
              this.tableData = res.data.data;
              this.loading = false;
              for(let item in this.tableData) {
                this.tableData[item].article_nums = this.tableData[item].article_nums.split(',').map(item=>item.replace(/\"/g, "").replace(/\'/g, ""));
              }
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        } else {
          getOutputList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.outbounds_num);
              this.tableData = res.data.data;
              this.loading = false;
              for(let item in this.tableData) {
                this.tableData[item].article_nums = this.tableData[item].article_nums.split(',').map(item=>item.replace(/\"/g, "").replace(/\'/g, ""));
              }
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        this.newOutput = {
          article_nums: [],
          user_id: '',
          outbound_type: '',
          material: '',
          address: ''
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        let imgList = [];
        let imgNum = (this.$refs.uploadImgOutputAdd)?this.$refs.uploadImgOutputAdd.uploadFiles.length:0;
        console.log(imgNum);
        if(this.newOutput.user_id=='') {
          this.$message({type: 'warning',message: '请填写用户编号'});
        } else if(this.newOutput.article_nums.length==0) {
          this.$message({type: 'warning',message: '请选择货品编号'});
          this._getUserStorage(this.newOutput.user_id);
        } else if(this.newOutput.address=='') {
          this.$message({type: 'warning',message: '请填写收货地址'});
        } else if(this.newOutput.outbound_type=='') {
          this.$message({type: 'warning',message: '请选择出库方式'});
        } else if(this.newOutput.outbound_type==1&&imgNum==0) {
          this.$message({type: 'warning',message: '请上传退税材料'});
        } else {
          while(this.$refs.uploadImgOutputAdd.uploadFiles.length!=0) {
            let file = this.$refs.uploadImgOutputAdd.uploadFiles.pop().raw;
            let fileName = new Date().getTime() + '-' +file.name;
            let uploadFile = new File([file], fileName, {type: file.type});
            addCoverImg(uploadFile).then(res=>{
              if(res.data.status=='201') {
                imgList.push(res.data.cover_img_url);
                if(imgList.length==imgNum) {
                  this.newOutput.material = imgList.join(',');
                  this.goDeploy('new')
                }
              }
            })
          }
        }
      },
      _getUserStorage(id) {
        this.newOutput.article_nums = [];
        getUserStorage(id).then(res=>{
          if(res.data.status=='200') {
            if(res.data.data.length==0) {
              this.$message({type: 'warning',message: '未查到该用户的库存信息'});
            }
            this.userStorage = res.data.data
          } else {
            this.$message({type: 'warning',message: '获取库存信息失败\n'+res.data.msg});
          }
        })
      },
      handleEdit(index,row) {
        this.editOutput.user_id = row.user_id;
        this.editOutput.outbound_ID = row.outbound_ID;
        this.editOutput.article_nums = row.article_nums;
        this.userStorage = row.article_nums;
        this.editOutput.outbound_type = row.outbound_type;
        this.editOutput.material = row.material;
        this.editOutput.address = row.address;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editApplyExpressid=='') {
          this.$message({type: 'warning',message: '请填写快递单号'});
        } else if(this.editApplyEmail=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        } else if(validateEmail(this.editApplyEmail)==false) {
          this.$message({type: 'warning',message: '邮箱格式不符合规范'});
        } else {
        }
        if(this.editOutput.outbound_type==0) {
          
        }
      },
      goDeploy(type) {
        if(type=='new') {
          addOutput(this.newOutput).then(res=>{
            if(res.data.status=='200') {
              this.dialogAddVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '添加成功'});
              this.newApplyExpressid = '';
              this.newApplyEmail = '';
            } else {
              this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
            }
          })
        } else if(type=='edit') {
          editOutput(this.editOutput).then(res=>{
            if(res.data.status=='200') {
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '修改成功'});
            } else {
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
          })
        }
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.outbound_ID +'的出库信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delOutput(row.outbound_ID).then(res=>{
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

      handleChange(row) {
        this.dialogChange = row.outbound_status;
        this.oldApply = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.oldApply.outbound_status!=this.dialogChange) {
          changeOutput(this.oldApply.outbound_ID,this.dialogChange).then(res => {
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

      handleRefuse(row) {
        this.$confirm('此操作将驳回这条单号为：'+ row.outbound_ID +'的出库信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          changeOutput(row.outbound_ID,1).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '驳回成功!'});
              this.currentPage = 1;
              this._getList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '驳回失败'+res.data.msg});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },

      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
        this.isSearch = true;
        this.searchWord = this.search;
        if(this.filter=='apply_status') {
          if(this.search=='0') {
            this.searchWord = '未出库'
          } else if(this.search=='1') { 
            this.searchWord = '已驳回'
          } else if(this.search=='2') { 
            this.searchWord = '待出库'
          } else if(this.search=='3') { 
            this.searchWord = '转运中'
          } else if(this.search=='4') { 
            this.searchWord = '清关中'
          } else if(this.search=='5') { 
            this.searchWord = '国内配送中'
          } else if(this.search=='6') { 
            this.searchWord = '已完成'
          }
        } else {
          this.searchWord = this.search;
        }
        this.filterWord = this.interpret[this.filter].name;
        this.loading = true;
        this.currentPage = 1;
        this._getList(this.currentPage)
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
</style>