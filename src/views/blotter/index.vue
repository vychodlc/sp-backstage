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
      <el-table-column label="流水单号" prop="discount_ID"></el-table-column>
      <el-table-column label="用户" prop="code"></el-table-column>
      <el-table-column label="方式" prop="type"></el-table-column>
      <el-table-column label="金额" prop="brand"></el-table-column>
      <el-table-column label="时间" prop="add_time"></el-table-column>
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
            type="danger"
            @click="handleDelete(scope.index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增流水记录" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="用户" label-width="80px">
          <el-input v-model="newItem.code"></el-input>
        </el-form-item>
        <el-form-item label="方式" label-width="80px">
          <el-radio v-model="newItem.method" label="0">转运</el-radio>
          <el-radio v-model="newItem.method" label="1">普通出库</el-radio>
          <el-radio v-model="newItem.method" label="2">退税出库</el-radio>
        </el-form-item>
        <el-form-item label="金额" label-width="80px">
          <el-input v-model="newItem.price"></el-input>
        </el-form-item>
        <el-form-item label="时间" label-width="80px">
          <el-input v-model="newItem.date"></el-input>
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
  export default {
    name: "discount",
    data () {
      return {
        showDialog: true,
        brand: 'N',
        search: null,
        searchWord: null,
        filter: 'discount_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          code: '',type: '',brand: '',valid_date: '',
          card_num: '',
          pin: '',
          balance: '',
          right: false
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
        oldStorage: null,

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
          //     this.pageNum = parseInt(res.data.storages_num);
          //     this.tableData = res.data.data;
          //     this.loading = false;
          //   } else {
          //     this.$message({type: 'error',message: res.data.msg})
          //   }
          //   this.loading = false;
          // });
        } else {
          getDiscount(pageIndex,this.brand).then(res => {
            console.log(res);
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.discounts_num);
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
          user_id: '',method: '',price: '',date: ''
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.user_id=='') {
          this.$message({type: 'warning',message: '请选择用户'});
        } else if(this.newItem.method=='') {
          this.$message({type: 'warning',message: '请选择方式'});
        } else if(this.newItem.price=='') {
          this.$message({type: 'warning',message: '请填写金额'});
        } else if(this.newItem.date=='') {
          this.$message({type: 'warning',message: '请填写日期'});
        } else {
          addDiscount(this.newItem).then(res=>{
            if(res.data.status=='200') {
              this.$message({type:'success',message:'添加成功'});
              this.newItem = {
                user_id: '',method: '',price: '',date: ''
              };
              this.currentPage = 1;
              this._getList(this.currentPage);
            } else {
              this.$message({type:'warning',message:'添加失败'})
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