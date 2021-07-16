<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="bankcard_ID"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="用户昵称" value="user_nickname"></el-option>
      <el-option label="卡号" value="cardnum"></el-option>
      <el-option label="状态" value="bankcard_status"></el-option>
    </el-select>
    <template v-if="this.filter=='bankcard_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">使用中</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">冻结中</el-radio>
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
      <el-table-column label="编号" prop="bankcard_ID"></el-table-column>
      <el-table-column label="卡号" prop="cardnum"></el-table-column>
      <el-table-column label="地址" prop="addr"></el-table-column>
      <el-table-column label="用户" prop="user_nickname"></el-table-column>
      <el-table-column label="开卡时间" prop="add_time"></el-table-column>
      <el-table-column label="状态" prop="bankcard_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.bankcard_status==0" type="success">使用中</el-tag>
          <el-tag size="mini" v-if="scope.row.bankcard_status==1" type="info">冻结中</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)" v-if="$store.state.user.right.indexOf('card_audit')!=-1"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="200" v-if="$store.state.user.right.indexOf('card_edit')!=-1">
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
      
    <el-dialog title="修改银行卡信息" :visible.sync="dialogEditVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户" label-width="80px">
          <el-input v-model="editItem.user_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="地址" label-width="80px">
          <el-input v-model="editItem.addr"></el-input>
        </el-form-item>
        <el-form-item label="卡号" label-width="80px">
          <el-input v-model="editItem.cardnum"></el-input>
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
          <el-radio v-model="dialogChange" label="0">使用中</el-radio>
          <el-radio v-model="dialogChange" label="1">冻结中</el-radio>
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
        filter: 'bankcard_ID',
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
          bankcard_ID: '',addr: '',cardnum: [],user_id: ''
        },
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldApply: null,
        newCardnum: '',

        pageNum: null,
        currentPage: 1,
        interpret: {
          'bankcard_ID': {name:'编号'},
          'user_nickname': {name:'用户昵称'},
          'user_email': {name:'用户邮箱'},
          'user_id': {name:'用户编号'},
          'cardnum': {name:'卡号'},
          'bankcard_status': {name:'状态'},
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
            filterBankcard(pageIndex,this.filter,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.bankcards_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }
              this.loading = false;
            });
          }
        } else {
          getBankcard(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.bankcards_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleChange(row) {
        this.newCardnum = '';
        this.dialogChange = row.bankcard_status;
        this.oldApply = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.oldApply.bankcard_status!=this.dialogChange) {
          changeBankcard({
            bankcard_ID: this.oldApply.bankcard_ID,
            bankcard_status: this.dialogChange,
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
      },
      handleEdit(index,row) {
        this.editItem.bankcard_ID = row.bankcard_ID;
        this.editItem.addr = row.addr;
        this.editItem.user_id = row.user_id;
        this.editItem.cardnum = row.cardnum;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editItem.addr=='') {
          this.$message({type: 'warning', message: '请输入地址'})
        } else if(this.editItem.cardnum=='') {
          this.$message({type: 'warning', message: '请输入卡号'})
        } else if(this.editItem.cardnum!=parseInt(this.editItem.cardnum)||parseInt(this.editItem.cardnum)<1) {
          this.$message({type:'warning',message:'请检查卡号的格式'})
        } else {
          editBankcard(this.editItem).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '修改成功'});
              this.editItem = {
                bankcard_ID: '',addr: '',cardnum: '',user_id: ''
              };
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
            } else if(res.data.status=='403') {
              this.$message({type: 'warning',message: '未进行修改'});
            }
          })
        }
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.bankcard_ID +'的银行卡, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delBankcard(row.bankcard_ID).then(res=>{
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
          if(this.filter=='bankcard_status') {
            if(this.search=='0')this.searchWord='使用中'
            if(this.search=='1')this.searchWord='冻结中'
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

        if(this.filter=='bankcard_ID') {
          let query = this.selectList.bankcard_ID;
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
        } else if(this.filter=='cardnum') {
          let query = this.selectList.cardnum;
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
      getBankcard(0).then(res => {
        let data1 = [],data2 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'bankcard_ID', key: 'bankcard_ID',value: item.bankcard_ID})
          data2.push({id: 'cardnum', key: 'cardnum',value: item.cardnum})
        })
        this.selectList.bankcard_ID = data1;
        this.selectList.cardnum = data2;
        getUser(0).then(res=>{
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