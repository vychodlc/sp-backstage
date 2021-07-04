<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="apply_ID"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="用户昵称" value="user_nickname"></el-option>
      <el-option label="审核人" value="auditor"></el-option>
      <el-option label="状态" value="apply_status"></el-option>
    </el-select>
    <template v-if="this.filter=='apply_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">待审批</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">已通过</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">已驳回</el-radio>
    </template>
    <el-autocomplete
      v-else
      class="inline-input"
      v-model="search"
      size="small"
      style="width:30vw;margin-right:10px"
      :fetch-suggestions="querySearch"
      placeholder="请输入内容···"
      :trigger-on-focus="false"
      @select="handleSelect"
    ></el-autocomplete>
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag>
    
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="编号" prop="apply_ID"></el-table-column>
      <el-table-column label="资料" prop="pic">
        <template slot-scope="scope">
          <el-image class="pic" v-for="(item,index) in scope.row.pic.slice(0,1)" :key="index" :src="item" alt="" :preview-src-list="scope.row.pic"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="addr"></el-table-column>
      <el-table-column label="用户" prop="user_nickname"></el-table-column>
      <el-table-column label="申请时间" prop="apply_time"></el-table-column>
      <el-table-column label="状态" prop="apply_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.apply_status==0" type="warning">未审批</el-tag>
          <el-tag size="mini" v-if="scope.row.apply_status==1" type="success">已通过</el-tag>
          <el-tag size="mini" v-if="scope.row.apply_status==2" type="info">已驳回</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="审核人" prop="auditor"></el-table-column>
      <el-table-column label="操作" align="right" width="200">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增银行卡申请" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户" label-width="80px">
          <el-autocomplete
            class="inline-input"
            v-model="newItem.user_ID"
            size="mini"
            style="width:100%;margin-right:10px"
            :fetch-suggestions="querySearch2"
            :trigger-on-focus="false"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="地址" label-width="80px">
          <el-input v-model="newItem.addr"></el-input>
        </el-form-item>
        <el-form-item label="申请材料" label-width="80px">
          <el-upload
            ref="uploadImg"
            class="upload-demo"
            :on-change='handleChangeImgAdd'
            action="#"
            multiple
            accept="image/jpeg,image/gif,image/png"
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="medium">确 定</el-button>
      </div>
    </el-dialog>    
    <el-dialog title="修改银行卡申请" :visible.sync="dialogEditVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户" label-width="80px">
          <el-input v-model="editItem.user_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="地址" label-width="80px">
          <el-input v-model="editItem.addr"></el-input>
        </el-form-item>
        <el-form-item>
          <template v-if="editItem.pic.length!=0">
            <div class="editImgBox" v-for="(item,index) in editItem.pic" :key="index">
              <el-image class="pic" :src="item" alt="" :preview-src-list="editItem.pic"></el-image>
              <div class="boxDel" @click="editDelImg(index)">×</div>
            </div>
          </template>
        </el-form-item>
        <el-form-item label="申请材料" label-width="80px">
          <el-upload
            ref="uploadImg2"
            class="upload-demo"
            :on-change='handleChangeImgEdit'
            action="#"
            multiple
            accept="image/jpeg,image/gif,image/png"
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible=false;currentPage=1;_getList(currentPage)" size="medium">取 消</el-button>
        <el-button type="primary" @click="goEdit()" size="medium">确 定</el-button>
      </div>
    </el-dialog>   
    <el-dialog title='申请状态修改' :visible.sync="dialogChangeVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">未审批</el-radio>
          <el-radio v-model="dialogChange" label="1">已通过</el-radio>
          <el-radio v-model="dialogChange" label="2">已驳回</el-radio>
          <el-input v-if="dialogChange=='1'" v-model="newCardnum" size="mini"></el-input>
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
  import { addBankcardApply,changeBankcardApply,changeBankcard,editBankcardApply,editBankcard,delBankcardApply,delBankcard,filterBankcardApply,filterBankcard,getBankcardApply,getBankcard } from '@/network/bankcard.js'
  import { getUser } from '@/network/user.js'
  import { addCoverImg } from '@/network/post.js'
  import * as imageConversion from 'image-conversion';
  export default {
    name: "discount",
    data () {
      return {
        showDialog: true,
        brand: 'N',
        search: null,
        searchWord: null,
        filter: 'apply_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          user_ID: '',addr: '',pic: []
        },
        newItemText: '',
        newItems: [],
        handleNum: 0,

        dialogEditVisible: false,
        editItem: {
          apply_ID: '',addr: '',pic: [],user_id: ''
        },
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldApply: null,
        newCardnum: '',

        pageNum: null,
        currentPage: 1,
        interpret: {
          'apply_ID': {name:'编号'},
          'user_nickname': {name:'用户昵称'},
          'user_email': {name:'用户邮箱'},
          'user_id': {name:'用户编号'},
          'auditor': {name:'审核人'},
          'apply_status': {name:'状态'},
        },
        selectList: {},
      }
    },
    methods:{
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          if(this.search==''||this.search==null) {
            this.$message({type: 'error',message: '请输入搜索词'})
          } else {
            filterBankcardApply(pageIndex,this.filter,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.bankcards_num);
                this.tableData = res.data.data;
                this.tableData.map(item=>{
                  item.pic = item.pic.split(',')
                })
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }
              this.loading = false;
            });
          }
        } else {
          getBankcardApply(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.bankcards_num);
              this.tableData = res.data.data;
              this.tableData.map(item=>{
                item.pic = item.pic.split(',')
              })
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        this.newItem = {
          user_ID: '',addr: '',pic: []
        };
        this.dialogAddVisible = true;
      },
      handleChangeImgAdd(file,filelist) {
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
      goAdd() {
        if(this.newItem.user_ID=='') {
          this.$message({type: 'warning',message: '请填写用户编号'});
        } else if(this.newItem.addr=='') {
          this.$message({type: 'warning',message: '请填写地址信息'});
        } else if(this.$refs.uploadImg.uploadFiles.length==0) {
          this.$message({type: 'warning',message: '请上传图片资料'});
        } else {
          let imgNum = this.$refs.uploadImg.uploadFiles.length;
          for(let i=0;i<imgNum;i++) {
            let file = this.$refs.uploadImg.uploadFiles.pop().raw;
            let fileName = new Date().getTime() + '-' +file.name;        
            imageConversion.compress(file,0.2).then(res=>{
              let uploadFile = new File([res], fileName, {type: res.type});
              addCoverImg(uploadFile).then(resImg=>{
                this.newItem.pic.push(resImg.data.cover_img_url)
                if(this.newItem.pic.length==imgNum) {
                  addBankcardApply(this.newItem).then(res=>{
                    this.$message({type: 'success',message: '新添成功'});
                    this.newItem = {
                      user_ID: '',addr: '',pic: []
                    };
                    this.dialogAddVisible = false;
                    this.currentPage = 1;
                    this._getList(this.currentPage);
                  })
                }
              })
            })
          }
        }
      },
      handleChange(row) {
        this.newCardnum = '';
        this.dialogChange = row.apply_status;
        this.oldApply = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.newCardnum==''&&this.dialogChange=='1') {
          this.$message({type: 'warning',message: '请输入新卡号'});
        } else {
          if(this.oldApply.apply_status!=this.dialogChange) {
            changeBankcardApply({
              apply_ID: this.oldApply.apply_ID,
              apply_status: this.dialogChange,
              cardnum: this.newCardnum
            }).then(res => {
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
        }
      },
      handleEdit(index,row) {
        this.editItem.apply_ID = row.apply_ID;
        this.editItem.user_id = row.user_id;
        this.editItem.addr = row.addr;
        this.editItem.pic = row.pic;
        this.dialogEditVisible = true;
      },
      handleChangeImgEdit(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImg2.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImg2.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      goEdit() {
        if(this.editItem.addr=='') {
          this.$message({type: 'warning', message: '请输入地址'})
        } else if(this.editItem.pic.length==0&&this.$refs.uploadImg2.uploadFiles.length==0) {
          this.$message({type: 'warning', message: '请上传图片资料'})
        } else {
          let imgNum = this.editItem.pic.length + this.$refs.uploadImg2.uploadFiles.length;
          let uploadNum = this.$refs.uploadImg2.uploadFiles.length;
          if(this.$refs.uploadImg2.uploadFiles.length>0) {
            for(let i=0;i<uploadNum;i++) {
              let file = this.$refs.uploadImg2.uploadFiles.pop().raw;
              let fileName = new Date().getTime() + '-' +file.name;        
              imageConversion.compress(file,0.6).then(res=>{
                let uploadFile = new File([res], fileName, {type: res.type});
                addCoverImg(uploadFile).then(resImg=>{
                  this.editItem.pic.push(resImg.data.cover_img_url)
                  if(this.editItem.pic.length==imgNum) {
                    editBankcardApply(this.editItem).then(res=>{
                      this.$message({type: 'success',message: '修改成功'});
                      this.editItem = {
                        apply_ID: '',addr: '',pic: [],user_id: ''
                      };
                      this.dialogEditVisible = false;
                      this.currentPage = 1;
                      this._getList(this.currentPage);
                    })
                  }
                })
              })
            }
          } else {
            editBankcardApply(this.editItem).then(res=>{
              this.$message({type: 'success',message: '修改成功'});
              this.editItem = {
                apply_ID: '',addr: '',pic: [],user_id: ''
              };
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
            })
          }
        }
      },
      editDelImg(index) {
        this.editItem.pic.splice(index,1);
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.apply_ID +'的银行卡申请, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delBankcardApply(row.apply_ID).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
              this.currentPage = 1;
              this._getList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
            this.loading = false;
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
        if(this.search==''||this.search==null) {
          this.$message({type:'warning',message:'请输入搜索词'})
        } else {
          this.isSearch = true;
          if(this.filter=='apply_status') {
            if(this.search=='0')this.searchWord='未审批'
            if(this.search=='1')this.searchWord='已通过'
            if(this.search=='2')this.searchWord='已驳回'
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
      },
      deWeight(items) {
        let values = [];
        return items.filter(item=>{
          if(values.indexOf(item.value)==-1) {
            values.push(item.value);
            return item;
          }
        });
      },
      querySearch(queryString, cb) {
        queryString = queryString.toString();

        if(this.filter=='apply_ID') {
          let query = this.selectList.apply_ID;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_email') {
          let query = this.selectList.user_email;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_id') {
          let query = this.selectList.user_id;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_nickname') {
          let query = this.selectList.user_nickname;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='auditor') {
          let query = this.selectList.auditor;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } 
      },
      
      querySearch2(queryString, cb) {
        queryString = queryString.toString();

        let query = this.selectList.user_id;
        let results = queryString ? query.filter(this.createFilter(queryString)) : query;
        cb(results);
      },
      handleSelect() {
        this.goSearch()
      },
      createFilter(queryString) {
        return (item) => {
          return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
      },
    },
    mounted() {
      getBankcardApply(0).then(res => {
        let data1 = [],data2 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'apply_ID', key: 'apply_ID',value: item.apply_ID})
          if(item.auditor!=null){
            data2.push({id: 'auditor', key: 'auditor',value: item.auditor})
          }
        })
        this.selectList.apply_ID = data1;
        this.selectList.auditor = this.deWeight(data2)
        getUser().then(res=>{
          let users = res.data.data;
          let emails = [],ids = [],codes = [],names = [];
          users.map(user=>{
            emails.push({id: user.id, key: 'user_email',value: user.user_email})
            ids.push({id: user.id, key: 'id',value: user.id})
            codes.push({id: user.id, key: 'code',value: user.code})
            names.push({id: user.id, key: 'name',value: user.user_nickname})
          })
          this.selectList.user_email = emails;
          this.selectList.user_id = ids;
          this.selectList.user_nickname = names;
          this.selectList.code = codes;
          this.loading = false;
          this._getList(this.currentPage);
        })
      })
    },
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
    width: 100px;
  }
  .editImgBox {
    position: relative;
  }
  .editImgBox .pic {
    width: 30%;
  }
  .boxDel {
    position: absolute;
    top: 0px;
    right: 50%;
    transform: translateX(150%);
    font-size: 30px;
    color: #fff;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: #777777;
    border-radius: 50%;
  }
</style>