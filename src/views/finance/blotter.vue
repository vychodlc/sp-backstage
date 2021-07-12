<template>
  <div class="post-container">

    <!-- ,uuid,,, -->
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="payment_ID"></el-option>
      <el-option label="经办人" value="operator"></el-option>
      <el-option label="状态" value="order_status"></el-option>
      <el-option label="种类" value="order_type"></el-option>
      <el-option label="用户编号" value="uuid"></el-option>
    </el-select>
    <template v-if="this.filter=='order_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">付款</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">退款</el-radio>
    </template>
    <template v-else-if="this.filter=='order_type'">
      <el-radio v-model="search" @input="goSearch()" label="o">出库</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="a">代购</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="d">退税</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="w">提现</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="c">充值</el-radio>
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
    <!-- <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input> -->
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag>
    
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="流水单号" prop="payment_ID"></el-table-column>
      <el-table-column label="用户" prop="uuid"></el-table-column>
      <el-table-column label="方式" prop="order_type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.order_type=='o'&&scope.row.order_status==0" type="success">出库-付款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='o'&&scope.row.order_status==1" type="primary">出库-退款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='a'&&scope.row.order_status==0" type="success">代购-付款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='a'&&scope.row.order_status==1" type="primary">代购-退款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='w'&&scope.row.order_status==0" type="success">提现-付款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='w'&&scope.row.order_status==1" type="primary">提现-退款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='d'&&scope.row.order_status==0" type="success">退税-付款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='d'&&scope.row.order_status==1" type="primary">退税-退款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='c'&&scope.row.order_status==0" type="success">充值-付款</el-tag>
          <el-tag size="mini" v-if="scope.row.order_type=='c'&&scope.row.order_status==1" type="primary">充值-退款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="price">
        <template slot-scope="scope">
          <span>{{parseFloat(scope.row.price/100).toFixed(2)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="generate_time"></el-table-column>
      <el-table-column label="经办人" prop="operator"></el-table-column>
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
  import { getPayment,filterPayment } from '@/network/finance.js'
  export default {
    name: "Blotter",
    data () {
      return {
        showDialog: true,
        brand: 'N',
        search: null,
        searchWord: null,
        filter: 'payment_ID',
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
          'payment_ID': {name:'编号'},
          'card_num': {name:'卡号'},
          'order_status': {name:'状态'},
          'operator': {name:'经办人'},
          'order_type': {name:'种类'},
          'uuid': {name:'用户编号'},
        },
        selectList: [],
      }
    },
    methods:{
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          filterPayment(pageIndex,this.filter,this.search).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.payments_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getPayment(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.payments_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
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
          if(this.filter=='order_status') {
            if(this.search=='0')this.searchWord='付款'
            if(this.search=='1')this.searchWord='退款'
          } else if(this.filter=='order_type') {
            if(this.search=='o')this.searchWord='出库'
            if(this.search=='a')this.searchWord='代购'
            if(this.search=='d')this.searchWord='退税'
            if(this.search=='w')this.searchWord='提现'
            if(this.search=='c')this.searchWord='充值'
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

        if(this.filter=='payment_ID') {
          let query = this.selectList.payment_ID;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='uuid') {
          let query = this.selectList.uuid;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='operator') {
          let query = this.selectList.operator;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        }
      },
      handleSelect() {
        this.goSearch()
      },
      createFilter(queryString) {
        return (item) => {
          return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
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
    },
    mounted() {
      getPayment(0).then(res => {
        let data1 = [],data2 = [],data3 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'uuid', key: 'uuid',value: item.uuid})
          data2.push({id: 'payment_ID', key: 'payment_ID',value: item.payment_ID})
          data3.push({id: 'operator', key: 'operator',value: item.operator})
        })
        this.selectList.uuid = this.deWeight(data1);
        this.selectList.payment_ID = this.deWeight(data2)
        this.selectList.operator = this.deWeight(data3)
        this.loading = false;
        this._getList(this.currentPage);
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
</style>