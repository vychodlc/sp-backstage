<template>
  <div class="post-container">
    <template>
      <el-radio style="margin-right:20px" @input="changeBrand('N')" v-model="brand" label="N">Nike</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('A')" v-model="brand" label="A">Adidas</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('JD')" v-model="brand" label="JD">JDSports</el-radio>
    </template>
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="account_ID"></el-option>
      <el-option label="账号" value="card_num"></el-option>
      <el-option label="种类" value="card_type"></el-option>
    </el-select>
    <template v-if="this.filter=='card_type'">
      <el-radio v-model="search" @input="goSearch()" label="1">普通账号</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">生日账号</el-radio>
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
      <el-table-column label="编号" prop="account_ID"></el-table-column>
      <el-table-column label="账号" prop="card_num"></el-table-column>
      <el-table-column label="密码" prop="psd"></el-table-column>
      <el-table-column label="种类" prop="card_type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.card_type==1" type="primary">普通账号</el-tag>
          <el-tag size="mini" v-if="scope.row.card_type==2" type="success">生日账号</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="品牌" prop="brand">
        <template slot-scope="scope">
          <span v-if="scope.row.brand=='N'">Nike</span>
          <span v-if="scope.row.brand=='A'">Adidas</span>
          <span v-if="scope.row.brand=='JD'">JDSports</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="添加时间" prop="add_time"></el-table-column> -->
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
    
    <el-dialog title="新增购物账号信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="账号" label-width="80px">
          <el-input v-model="newItem.card_num"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="80px">
          <el-input v-model="newItem.psd"></el-input>
        </el-form-item>
        <el-form-item label="种类" label-width="80px">
          <el-radio v-model="newItem.card_type" label="1">普通账号</el-radio>
          <el-radio v-model="newItem.card_type" label="2">生日账号</el-radio>
        </el-form-item>
        <el-form-item label="品牌" label-width="80px">
          <el-radio v-model="newItem.brand" label="N">Nike</el-radio>
          <el-radio v-model="newItem.brand" label="A">Adidas</el-radio>
          <el-radio v-model="newItem.brand" label="JD">JD</el-radio>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button type="success" @click="dialogEditVisible=true">批量添加</el-button>
          <el-button type="primary" @click="handleAddAdd()">添加</el-button>
        </el-form-item>
        <el-table
        height='200'
        style="width: 100%;overflow:hidden;"
        :row-style="{height: '30px'}"
        :data="newItems">
          <el-table-column min-width="30%" label="账号" prop="card_num"></el-table-column>
          <el-table-column min-width="20%" label="密码" prop="psd"></el-table-column>
          <el-table-column min-width="20%" label="种类" prop="card_type">
            <template slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.card_type==1" type="primary">普通账号</el-tag>
              <el-tag size="mini" v-if="scope.row.card_type==2" type="success">生日账号</el-tag>
            </template>
          </el-table-column>
          <el-table-column min-width="20%" label="品牌" prop="brand">
            <template slot-scope="scope">
              <span v-if="scope.row.brand=='N'">Nike</span>
              <span v-if="scope.row.brand=='A'">Adidas</span>
              <span v-if="scope.row.brand=='JD'">JDSports</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="right"
            label=""
            width="100">
            <template slot-scope="scope">
              <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="newItems.splice(scope.$index,1)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="medium">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量导入购物账号" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini">
        <el-form-item label="文本信息">
          <el-input type="textarea" rows="10" v-model="newItemText" placeholder="xxxx xxxx xxxx xxx-xxx
xxxx xxxx xxxx xxx-xxx
账号  密码  种类  品牌"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="enterItems()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改购物账号信息" :visible.sync="dialogEditVisible">
      <el-form size="mini">
        <el-form-item label="购物账号">
          <el-input v-model="editItem.card_num" disabled></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editItem.psd"></el-input>
        </el-form-item>
        <el-form-item label="种类">
          <el-radio v-model="editItem.card_type" label="1">普通账号</el-radio>
          <el-radio v-model="editItem.card_type" label="2">生日账号</el-radio>
        </el-form-item>
        <el-form-item label="品牌">
          <el-radio v-model="editItem.brand" label="N">Nike</el-radio>
          <el-radio v-model="editItem.brand" label="A">Adidas</el-radio>
          <el-radio v-model="editItem.brand" label="JD">JD</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
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
  import { getAccount,addAccount,delAccount,changeAccount,filterAccount } from '@/network/agency.js'
  export default {
    name: "discount",
    data () {
      return {
        showDialog: true,
        brand: 'N',
        search: null,
        searchWord: null,
        filter: 'account_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          code: '',type: '',brand: '',valid_date: '',
          card_num: '',pwd: '',card_type: '',brand: '',
          pin: '',
          balance: '',
          right: false
        },
        newItemText: '',
        newItems: [],
        handleNum: 0,

        dialogEditVisible: false,
        editItem: {
          account_ID: '',
          card_num: '',
          psd: '',
          card_type: '',
          brand: '',
        },
        selectList: [[],[],[]],
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldStorage: null,

        pageNum: null,
        currentPage: 1,
        interpret: {
          'account_ID': {name:'编号'},
          'card_num': {name:'账号'},
          'card_type': {name:'种类'},
        },

        allItems: [],
      }
    },
    methods:{
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        let index = 0;
        if(this.brand == 'N') {index = 0}
        else if(this.brand == 'A') {index = 1}
        else if(this.brand == 'JD') {index = 2}

        if(this.filter=='account_ID') {
          let query = this.selectList[index].account_ID;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='card_num') {
          let query = this.selectList[index].card_num;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        }
      },
      handleSelect() {
        this.goSearch();
      },
      createFilter(queryString) {
        return (item) => {
          return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
      },
      test(index) {
        console.log(index);
      },
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          filterAccount(this.filter,this.search,pageIndex,this.brand).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.accounts_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getAccount(pageIndex,this.brand).then(res => {
            console.log(res);
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.accounts_num);
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
          card_num: '',psd: '',brand: '',card_type: '',
        };
        this.dialogAddVisible = true;
      },
      handleAddAdd() {
        if(this.newItem.card_num=='') {
          this.$message({type: 'warning',message: '请填写购物账号'});
        } else if(this.newItem.psd=='') {
          this.$message({type: 'warning',message: '请填写账号密码'});
        } else if(this.newItem.brand=='') {
          this.$message({type: 'warning',message: '请选择账号品牌'});
        } else if(this.newItem.card_type=='') {
          this.$message({type: 'warning',message: '请选择账号种类'});
        } else {
          this.newItems.push(this.newItem);
          this.newItem = {
            card_num: '',psd: '',brand: '',card_type: '',
          };
        }
      },
      enterItems() {
        if(this.newItemText=='') {
          this.$message({type: 'warning',message: '请输入内容'});
        } else {
          let rows = this.newItemText.split('\n');
          rows.map(row=>{
            if(row!='') {
              let rowData = row.split(' ').filter(iii=>{return iii!=''&&iii!=' '});
              let brand = '';
              if(rowData[3].indexOf('N')!=-1) {
                brand = 'N'
              } else if(rowData[3].indexOf('A')!=-1) {
                brand = 'A'
              } else if(rowData[3].indexOf('J')!=-1) {
                brand = 'JD'
              }
              this.newItems.push({card_num:rowData[0],psd:rowData[1],card_type:rowData[2].indexOf('生')==-1?'1':'2',brand:brand});
              this.dialogEditVisible = false;
            }
          })
          this.newItemText = '';
        }
      },
      goAdd() {
        if(this.newItems.length==0) {
          this.$message({type: 'warning',message: '请添加购物账号信息'});
        } else {
          this.handleNum = this.newItems.length;
          if(this.handleNum==0) {
            this.loading = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          } else {
            this.loading = true;
          }
          this.dialogAddVisible = false;
          while(this.newItems.length!=0) {
            let data = this.newItems.pop();
            this._addAccount(data);
          }
        }
      },
      _addAccount(item) {
        addAccount(item).then(res=>{
          console.log(res);
          this.handleNum--
          if(this.handleNum==0) {
            this.loading = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          }
        })
      },
      handleEdit(index,row) {
        console.log(row);
        this.editItem.account_ID= row.account_ID;
        this.editItem.card_num= row.card_num;
        this.editItem.psd = row.psd;
        this.editItem.brand = row.brand;
        this.editItem.card_type = row.card_type;
        this.dialogEditVisible = true;
      },
      goEdit() {
        changeAccount(this.editItem).then(res=>{
          console.log(this.editItem.psd);
          if(res.data.status=='403') {
            this.$message({tyep:'warning',message:'未修改'})
          } else if(res.data.status=='200') {
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogEditVisible = false;
            this.$message({type: 'success',message: '修改成功!'});
          }
        })
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.account_ID +'的购物账号, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delAccount(row.account_ID).then(res=>{
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
      changeBrand(brand) {
        this.brand = brand;
        this.goBack()
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
    },
    mounted() {
      getAccount(0,'N').then(res=>{
        let data1 = [];
        res.data.data.map(item=>{data1.push({id: 'account_ID', key: 'account_ID',value: item.account_ID});this.allItems.push(item)})
        this.selectList[0].account_ID = data1;data1 = [];
        res.data.data.map(item=>{data1.push({id: 'card_num', key: 'card_num',value: item.card_num})})
        this.selectList[0].card_num = data1;
        
        getAccount(0,'N').then(res=>{
          let data2 = [];
          res.data.data.map(item=>{data2.push({id: 'account_ID', key: 'account_ID',value: item.account_ID});this.allItems.push(item)})
          this.selectList[1].account_ID = data2;data2 = [];
          res.data.data.map(item=>{data2.push({id: 'card_num', key: 'card_num',value: item.card_num})})
          this.selectList[1].card_num = data2;
            
          getAccount(0,'JD').then(res=>{
            let data3 = [];
            res.data.data.map(item=>{data3.push({id: 'account_ID', key: 'account_ID',value: item.account_ID});this.allItems.push(item)})
            this.selectList[2].account_ID = data3;data3 = [];
            res.data.data.map(item=>{data3.push({id: 'card_num', key: 'card_num',value: item.card_num})})
            this.selectList[2].card_num = data3;

            this.loading = false;
            this._getList(this.currentPage);

            console.log(this.selectList);
          })
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