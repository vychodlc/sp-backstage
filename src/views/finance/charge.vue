<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="charge_ID"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="用户昵称" value="user_nickname"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
    </el-select>
    <template v-if="this.filter=='withdraw_status'">
      <el-radio v-model="search" label="0">待审核</el-radio>
      <el-radio v-model="search" label="1">已提现</el-radio>
      <el-radio v-model="search" label="2">已驳回</el-radio>
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
      <el-table-column label="单号" prop="charge_ID"></el-table-column>
      <el-table-column label="用户" prop="user_id">
        <template slot-scope='scope'>
          {{scope.row.user_id}}-{{scope.row.user_nickname}}
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="amount">
        <template slot-scope="scope">
          <span>{{parseFloat(scope.row.amount/100).toFixed(2)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人员" prop="auditor"></el-table-column>
      <el-table-column label="充值时间" prop="charge_time"></el-table-column>
      <el-table-column label="操作" align="right" width="100" v-if="$store.state.user.right.indexOf('charge_edit')!=-1">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <!-- <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.index, scope.row)">删除</el-button>
        </template> -->
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增充值记录" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <!-- <el-form-item label="匹配方式" label-width="80px">
          <el-radio v-model="newItem.method" @change="changeMethod()" label="0">用户编号</el-radio>
          <el-radio v-model="newItem.method" @change="changeMethod()" label="1">用户邮箱</el-radio>
        </el-form-item> -->
        <el-form-item label="用户邮箱" label-width="80px">
          <!-- <el-input v-model="newItem.user_id" :placeholder="placeholder"></el-input> -->
          <el-autocomplete
            class="inline-input"
            v-model="newItem.user_email"
            size="small"
            style="width:100%"
            :fetch-suggestions="querySearch2"
            placeholder="请输入用户邮箱·"
            :trigger-on-focus="false"
            @select="handleSelect2"
            @input="dialogAddMore=false"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item v-if="dialogAddMore==true" label="金额" label-width="80px">
          <el-input v-model="newItem.amount"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="medium">确 定</el-button>
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
  import { getCharge,filterWithdrawl,addCharge,changeWithdrawl } from '@/network/finance.js'
  import { getUser } from '@/network/user.js'

  export default {
    name: "Withdrawl",
    data () {
      return {
        showDialog: true,
        search: null,
        searchWord: null,
        filter: 'charge_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          amount: '',bankcard: '',user_id: '',method: '0',user_email:''
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
          'charge_ID': {name:'编号'},
          'bankcard': {name:'银行卡号'},
          'withdraw_status': {name:'状态'},
          'user_email': {name:'用户邮箱'},
          'user_nickname': {name:'用户昵称'},
          'user_id': {name:'用户编号'},
        },

        selectList: [],
        placeholder: '请输入用户编号···',
        dialogAddMore: false
      }
    },
    methods:{
      deWeight(items) {
        let values = [];
        return items.filter(item=>{
          if(values.indexOf(item.value)==-1) {
            values.push(item.value);
            return item;
          }
        });
      },
      test(index) {
        console.log(index);
      },
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          filterWithdrawl(this.filter,this.search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.charges_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getCharge(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.charges_num);
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
          amount: '',user_id: '',user_email:''
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.user_email=='') {
          this.$message({type: 'warning',message: '请选择用户'});
        } else if(this.dialogAddMore==false) {
          this.$message({type: 'warning',message: '请选择正确的用户'});
        } else if(this.newItem.amount=='') {
          this.$message({type: 'warning',message: '请填写提现金额'});
        } else if(this.newItem.amount!=parseFloat(this.newItem.amount)||parseFloat(this.newItem.amount)<0.01) {
          this.$message({type: 'warning',message: '请填写正确的提现金额'});
        } else {
          this.selectList.user_email.map(email=>{
            if(email.value==this.newItem.user_email) {
              this.newItem.user_id = email.id
            }
          })
          addCharge(this.newItem.user_id,this.newItem.amount).then(res=>{
            if(res.data.status=='200') {
              this.$message({type:'success',message:'充值成功'});
              this.newItem = {
                amount: '',user_id: '',user_email:''
              };
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.dialogAddVisible = false;
            } else {
              this.$message({type:'warning',message:'充值失败：'+res.data.msg})
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
            charge_ID: this.oldItem.charge_ID,
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
        if(this.search==''||this.search==null) {
          this.$message({type:'warning',message:'请输入搜索词'})
        } else {
          this.isSearch = true;
          if(this.filter=='withdraw_status') {
            if(this.search=='0')this.searchWord = '待审核'
            if(this.search=='1')this.searchWord = '已提现'
            if(this.search=='2')this.searchWord = '已驳回'
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

      querySearch(queryString, cb) {
        queryString = queryString.toString();
        if(this.filter=='charge_ID') {
          let query = this.selectList.charge_ID;
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
        } else if(this.filter=='bankcard') {
          let query = this.selectList.bankcard;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        }
      },
      querySearch2(queryString, cb) {
        queryString = queryString.toString();
        let query = this.selectList.user_email;
        let results = queryString ? query.filter(this.createFilter(queryString)) : query;
        cb(results);
      },
      handleSelect() {
        this.goSearch();
      },
      handleSelect2() {
        this.dialogAddMore = true;
      },
      createFilter(queryString) {
        return (item) => {
          return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
      },
      changeMethod() {
        this.placeholder = this.newItem.method=='0'?'请输入用户编号···':'请输入用户邮箱···'
      }
    },
    mounted() {
      getCharge(0).then(res=>{
        let data1 = [],data2 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'charge_ID', key: 'charge_ID',value: item.charge_ID})
          data2.push({id: 'bankcard', key: 'bankcard',value: item.bankcard})
        })
        this.selectList.charge_ID = data1;
        this.selectList.bankcard = this.deWeight(data2);
        getUser(0).then(res=>{
          let users = res.data.data;
          let emails = [],ids = [],codes = [],names = [];
          users.map(user=>{
            emails.push({id: user.id, key: 'user_email',value: user.user_email})
            ids.push({id: user.id, key: 'id',value: user.id})
            codes.push({id: user.id, key: 'code',value: user.code})
            names.push({id: user.id, key: 'user_nickname',value: user.user_nickname})
          })
          this.selectList.user_email = emails;
          this.selectList.user_id = ids;
          this.selectList.code = codes;
          this.selectList.user_nickname = names;
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
</style>