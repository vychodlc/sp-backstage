<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="详细地址" value="addr"></el-option>
      <el-option label="地址编号" value="address_ID"></el-option>
      <el-option label="地址种类" value="default"></el-option>
      <el-option label="用户ID" value="user_id"></el-option>
      <el-option label="uuid" value="uuid"></el-option>
      <el-option label="邮箱地址" value="email"></el-option>
    </el-select>
    <template v-if="this.filter=='default'">
      <el-radio v-model="search" label="0">默认地址</el-radio>
      <el-radio v-model="search" label="1">普通地址</el-radio>
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
      <el-table-column label="地址编号" prop="address_ID"></el-table-column>
      <el-table-column label="详细地址" prop="addr"></el-table-column>
      <el-table-column label="地址种类" prop="default">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.default==0" type="info">普通地址</el-tag>
          <el-tag size="mini" v-if="scope.row.default==1" type="primary">默认地址</el-tag>
          <el-link v-if="scope.row.default==0" style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="uuid" prop="uuid"></el-table-column>
      <el-table-column label="操作" align="right" width="200">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="dialogAddVisible=true;newAddress={user_id:'',addr:''};">新增</el-button>
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
    
    <el-dialog title="新增地址信息" :visible.sync="dialogAddVisible">
      <el-form>
        <el-form-item label="用户编号">
          <el-input v-model="newAddress.user_id"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="newAddress.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改地址信息" :visible.sync="dialogEditVisible">
      <el-form>
        <el-form-item label="地址编号">
          <el-input v-model="editAddress.address_ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="editAddress.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='地址种类修改' :visible.sync="dialogChangeVisible">
      <span>确认将此条地址设置为用户的默认地址</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </span>
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
  import { addAddress,delAddress,editAddress,getAddressList,filterAddress,searchAddress,changeDefaultAddress } from '@/network/address.js'
  export default {
    name: "Address",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'addr',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,

        dialogAddVisible: false,
        newApplyUserId: '', 
        newApplyExpressid: '',
        newApplyEmail: '',
        newAddress: {
          user_id: '',
          addr: '',
        },

        dialogEditVisible: false,
        editApplyID: '',
        editApplyExpressid: '',
        editApplyEmail: '',
        editAddress: {
          address_ID: '',
          addr: ''
        },
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldAddress: null,

        dialogStorageVisible: false,
        newStorage: {
          user_id: '',
          email: '',
          expressid: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: ''
        },

        pageNum: null,
        currentPage: 1,
        interpret: {
          'addr': {name:'详细地址'},
          'address_ID': {name:'地址编号'},
          'default': {name:'地址种类'},
          'user_id': {name:'用户ID'},
          'uuid': {name:'uuid'},
          'email': {name:'邮箱地址'},
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
          if(this.filter=='addr') {
            searchAddress(pageIndex,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.address_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }      
              this.loading = false;
            });
          } else {
            filterAddress(pageIndex,this.filter,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.address_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }      
              this.loading = false;
            });
          }
        } else {
          getAddressList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.address_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        if(this.newAddress.user_id=='') {
          this.$message({type: 'warning',message: '请填写用户编号'});
        } else if(this.newAddress.addr=='') {
          this.$message({type: 'warning',message: '请填写详细地址'});
        } else {
          addAddress(this.newAddress.addr,this.newAddress.user_id).then(res=>{
            if(res.data.status=='200') {
              this.dialogAddVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '添加成功'});
              this.newAddress = {user_id: '',addr: ''};
            } else {
              this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
            }
          })
        }
      },
      handleEdit(index,row) {
        this.editAddress.address_ID = row.address_ID;
        this.editAddress.addr = row.addr;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editAddress.address_ID=='') {
          this.$message({type: 'warning',message: '请填写快递单号'});
        } else if(this.editAddress.addr=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        } else {
          editAddress(this.editAddress.address_ID,this.editAddress.addr).then(res=>{
            console.log(res);
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
        this.$confirm('此操作将永久删除这条单号为：'+ row.address_ID +'的地址信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAddress(row.address_ID).then(res=>{
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

      handleChange(row) {
        this.dialogChange = row.default;
        this.oldAddress = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        changeDefaultAddress(this.oldAddress.address_ID,this.oldAddress.uuid).then(res => {
          if(res.data.status=='200') {
            this.$message({type: 'success',message: '修改成功'});
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogChangeVisible = false;
          } else {
            this.$message({type: 'warning',message: '修改失败'});
          }
        })
      },

      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
        this.isSearch = true;
        this.searchWord = this.search;
        if(this.filter=='default') {
          if(this.search=='0') {
            this.searchWord = '普通地址'
          } else if(this.search=='1') { 
            this.searchWord = '默认地址'
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