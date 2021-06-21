<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="discount_ID"></el-option>
      <el-option label="卡号" value="card_num"></el-option>
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
      <el-table-column label="单号" prop="withdraw_ID"></el-table-column>
      <el-table-column label="用户" prop="uuid"></el-table-column>
      <el-table-column label="银行卡" prop="bankcard"></el-table-column>
      <el-table-column label="金额" prop="amount"></el-table-column>
      <el-table-column label="申请时间" prop="apply_time"></el-table-column>
      <el-table-column label="操作人员" prop="auditor"></el-table-column>
      <el-table-column label="编辑时间" prop="audit_time"></el-table-column>
      <el-table-column label="状态" prop="withdraw_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.withdraw_status==0" type="warning">待审核</el-tag>
          <el-tag size="mini" v-if="scope.row.withdraw_status==1" type="success">已提现</el-tag>
          <el-tag size="mini" v-if="scope.row.withdraw_status==2" type="info">已驳回</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="changeStatus(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="100">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增提现记录" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户" label-width="80px">
          <el-input v-model="newItem.user_id"></el-input>
        </el-form-item>
        <el-form-item label="金额" label-width="80px">
          <el-input v-model="newItem.amount"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号" label-width="80px">
          <el-input v-model="newItem.bankcard"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="medium">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提现状态修改" :visible.sync="dialogChangeVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">待审核</el-radio>
          <el-radio v-model="dialogChange" label="1">已提现</el-radio>
          <el-radio v-model="dialogChange" label="2">已驳回</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goStatusChange()">确 定</el-button>
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
  import { getDiscount,addDiscount,delDiscount } from '@/network/agency.js'
  import { getWithdrawl,addWithdrawl,changeWithdrawl } from '@/network/finance.js'

  export default {
    name: "Withdrawl",
    data () {
      return {
        showDialog: true,
        search: null,
        searchWord: null,
        filter: 'discount_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          amount: '',bankcard: '',user_id: ''
        },
        newItemText: '',
        newItems: [],
        handleNum: 0,

        dialogEditVisible: false,
        editStorageID: '',
        editStorageSize: '',
        editStorageNumber: '',
        editStorageWeight: '',
        editStoragePic: '',
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldItem: null,

        pageNum: null,
        currentPage: 1,
        interpret: {
          'discount_ID': {name:'编号'},
          'card_num': {name:'卡号'}
        }
      }
    },
    methods:{
      test(index) {
        console.log(index);
      },
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          // filterStorage(this.filter,this.search,pageIndex).then(res => {
          //   if(res.data.status=='200') {
          //     this.pageNum = parseInt(res.data.Withdrawls_num);
          //     this.tableData = res.data.data;
          //     this.loading = false;
          //   } else {
          //     this.$message({type: 'error',message: res.data.msg})
          //   }
          //   this.loading = false;
          // });
        } else {
          getWithdrawl(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.Withdrawls_num);
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
        this.newItem = {
          amount: '',bankcard: '',user_id: ''
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.user_id=='') {
          this.$message({type: 'warning',message: '请选择用户'});
        } else if(this.newItem.amount=='') {
          this.$message({type: 'warning',message: '请填写提现金额'});
        } else if(this.newItem.bankcard=='') {
          this.$message({type: 'warning',message: '请填写银行卡号'});
        } else {
          addWithdrawl(this.newItem).then(res=>{
            if(res.data.status=='200') {
              this.$message({type:'success',message:'添加成功'});
              this.newItem = {
                amount: '',bankcard: '',user_id: ''
              };
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.dialogAddVisible = false;
            } else {
              if(res.data.status=='403') {
                this.$message({type:'warning',message:'提现申请失败：用户余额不足'})
              } else {
                this.$message({type:'warning',message:'添加失败：'+res.data.msg})
              }
            }
          })
        }
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.discount_ID +'的礼品卡, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delDiscount(row.discount_ID).then(res=>{
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
      changeStatus(row) {
        this.dialogChangeVisible = true;
        this.dialogChange = row.withdraw_status;
        this.oldItem = row;
      },
      goStatusChange() {
        if(this.oldItem.withdraw_status!=this.dialogChange) {
          changeWithdrawl({
            withdraw_ID: this.oldItem.withdraw_ID,
            withdraw_status: this.dialogChange
          }).then(res => {
            this.$message({type: 'success',message: '状态修改成功'});
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogChangeVisible = false;
          })
        } else {
          this.$message({type: 'warning',message: '状态未修改'});
        }
      },
      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
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
    },
    mounted() {
      this._getList(this.currentPage)
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
</style>