<template>
  <div class="post-container">
    <template>
      <el-radio style="margin-right:20px" @input="changeBrand('N')" v-model="brand" label="N">Nike</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('A')" v-model="brand" label="A">Adidas</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('JD')" v-model="brand" label="JD">JDSports</el-radio>
    </template>
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="discount_ID"></el-option>
      <el-option label="折扣码" value="code"></el-option>
      <el-option label="种类" value="type"></el-option>
    </el-select>
    <template v-if="this.filter=='type'">
      <el-radio v-model="search" @input="goSearch()" label="2">单次码</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="3">复用码</el-radio>
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
      <el-table-column label="编号" prop="discount_ID"></el-table-column>
      <el-table-column label="折扣码" prop="code"></el-table-column>
      <el-table-column label="种类" prop="type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.type==2" type="primary">单次码</el-tag>
          <el-tag size="mini" v-if="scope.row.type==3" type="success">复用码</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="品牌" prop="brand">
        <template slot-scope="scope">
          <span v-if="scope.row.brand=='N'">Nike</span>
          <span v-if="scope.row.brand=='A'">Adidas</span>
          <span v-if="scope.row.brand=='JD'">JDSports</span>
        </template></el-table-column>
      <el-table-column label="有效期限" prop="valid_date">
        <template slot-scope="scope">
          {{scope.row.start_date=="undefined"?'':scope.row.start_date}} ~ {{scope.row.valid_date=="undefined"?'':scope.row.valid_date}}
        </template>
      </el-table-column>
      <el-table-column label="添加时间" prop="add_time"></el-table-column>
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
    
    <el-dialog title="新增折扣码信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
      <el-form label-width="100px" size="mini">
        <el-form-item label="折扣码" label-width="80px">
          <el-input v-model="newItem.code"></el-input>
        </el-form-item>
        <el-form-item label="种类" label-width="80px">
          <el-radio v-model="newItem.type" label="2">单次码</el-radio>
          <el-radio v-model="newItem.type" label="3">复用码</el-radio>
        </el-form-item>
        <el-form-item label="品牌" label-width="80px">
          <el-radio v-model="newItem.brand" label="N">Nike</el-radio>
          <el-radio v-model="newItem.brand" label="A">Adidas</el-radio>
          <el-radio v-model="newItem.brand" label="JD">JD</el-radio>
        </el-form-item>
        <el-form-item label="有效期" label-width="80px">
          <el-date-picker
            v-model="newItem.daterange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width:100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button type="success" @click="dialogEditVisible=true;newItemText=''">批量添加</el-button>
          <el-button type="primary" @click="handleAddAdd()">添加</el-button>
        </el-form-item>
        <el-table
        height='200'
        style="width: 100%;overflow:hidden;"
        :row-style="{height: '30px'}"
        :data="newItems">
          <el-table-column min-width="20%" label="折扣码" prop="code"></el-table-column>
          <el-table-column min-width="20%" label="种类" prop="type">
            <template slot-scope="scope">
              <span v-if="scope.row.type==2">单次码</span>
              <span v-else-if="scope.row.type==3">复用码</span>
              <span v-else>格式错误</span>
            </template>
          </el-table-column>
          <el-table-column min-width="20%" label="品牌" prop="brand">
            <template slot-scope="scope">
              <span v-if="scope.row.brand=='N'">Nike</span>
              <span v-if="scope.row.brand=='A'">Adidas</span>
              <span v-if="scope.row.brand=='JD'">JDSports</span>
              <span v-if="scope.row.brand=='NULL'">品牌错误</span>
            </template>
          </el-table-column>
          <el-table-column min-width="40%" label="有效期限">
            <template slot-scope="scope">{{scope.row.start_date}}  ~  {{scope.row.valid_date}}</template>
          </el-table-column>
          <el-table-column
            prop="right"
            label=""
            width="150">
            <template slot-scope="scope">
              <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="newItems.splice(scope.$index,1)"></el-button>
              <el-tag v-if="scope.row.repeat==true" type="danger" size="mini" style="margin-left:10px">折扣码已存在</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="medium">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量导入折扣码" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini">
        <el-form-item label="文本信息">
          <el-input type="textarea" rows="10" v-model="newItemText" placeholder="xxxx xxxx xxxx xxxx xxxx
xxxx xxxx xxxx xxxx xxxx
折扣码 种类 品牌 开始日期 结束日期"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="enterItems()" size="mini">确 定</el-button>
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
  import { getDiscount,addDiscount,delDiscount,filterDiscount } from '@/network/agency.js'
  import { getUser } from '@/network/user.js'
  import { msToDate } from '@/utils/time.js'
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
          code: '',type: '',brand: '',start_date:'',valid_date: '',daterange: [],
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
          'code': {name:'折扣码'},
          'type': {name:'种类'}
        },
        selectList: [[],[],[]]
      }
    },
    methods:{
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        let index = 0;
        if(this.brand == 'N') {index = 0}
        else if(this.brand == 'A') {index = 1}
        else if(this.brand == 'JD') {index = 2}

        if(this.filter=='discount_ID') {
          let query = this.selectList[index].discount_ID;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='code') {
          let query = this.selectList[index].code;
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
      },
      _getList(pageIndex) {      
        this.defaultData();
        this.loading = true;
        if(this.isSearch==true) {
          filterDiscount(this.filter,this.search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.discounts_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getDiscount(pageIndex,this.brand).then(res => {
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
      dateFormat(data) {
        let date = new Date(data);
        let y = date.getFullYear()
        let m = date.getMonth()
        let d = date.getDate()
        m = m < 10 ? ('0' + m) : m;
        d = d < 10 ? ('0' + d) : d;

        return ''+y+'-'+m+'-'+d;
      },
      handleAdd() {
        this.newItem = {
          code: '',type: '',brand: '',start_date:'',valid_date: '',daterange: [],right:false,repeat:false,
        };
        this.newItems = []
        this.dialogAddVisible = true;
      },
      handleAddAdd() {
        if(this.newItem.code=='') {
          this.$message({type: 'warning',message: '请填写折扣码'});
        } else if(this.newItem.type=='') {
          this.$message({type: 'warning',message: '请填写折扣码类别'});
        } else if(this.newItem.brand=='') {
          this.$message({type: 'warning',message: '请填写折扣码品牌'});
        } else if(this.newItem.daterange==[]||this.newItem.daterange==undefined) {
          this.$message({type: 'warning',message: '请填写有效期限'});
        } else {
          let start_time = this.dateFormat(this.newItem.daterange[0]);
          let end_time = this.dateFormat(this.newItem.daterange[1]);
          let repeat = false;
          let right = true;
          if(this.newItem.brand=='N') {
            this.selectList[0].code.map(code=>{
              if(this.newItem.code==code.value){repeat=true;right=false}
            });
          } else 
          if(this.newItem.brand=='A') {
            this.selectList[1].code.map(code=>{
              if(this.newItem.code==code.value){repeat=true;right=false}
            });
          } else if(this.newItem.brand=='JD') {
            this.selectList[2].code.map(code=>{
              if(this.newItem.code==code.value){repeat=true;right=false}
            });
          }
          this.newItems.map(item=>{
            if(item.code==this.newItem.code&&item.brand==this.newItem.brand) {
              repeat = true;right=false;
            }
          })
          this.newItem.repeat = repeat;
          this.newItem.right = right;
          this.newItem.start_date = start_time;
          this.newItem.valid_date = end_time;
          this.newItems.push(this.newItem);
          this.newItem = {
            code: '',type: '',brand: '',start_date:'',valid_date: '',daterange: [],right:false,repeat:false,
          };
        }
      },
      enterItems() {
        if(this.newItemText=='') {
          this.$message({type: 'warning',message: '请输入内容'});
        } else {
          let items = [];
          let rows = this.newItemText.split('\n');
          rows.map(row=>{
            if(row!='') {
              let rowData = row.split(' ').filter(iii=>{return iii!=''&&iii!=' '});
              let type = '';
              let brand = '';
              let right = true;
              let repeat = false;
              if(rowData[1]) {
                if(rowData[1].indexOf('单')!=-1){type='2'}
                else if(rowData[1].indexOf('复')!=-1){type='3'}
                else {type='格式错误';right=false}
              } else {
                type = '格式错误';right=false
              }
              if(rowData[2]) {
                if(rowData[2].toUpperCase().indexOf('N')!=-1) {
                  brand = 'N';
                  this.selectList[0].code.map(code=>{
                    if(rowData[0]==code.value){repeat=true;right=false}
                  });
                } else if(rowData[2].toUpperCase().indexOf('A')!=-1) {
                  brand = 'A';
                  this.selectList[1].code.map(code=>{
                    if(rowData[0]==code.value){repeat=true;right=false}
                  });
                } else if(rowData[2].toUpperCase().indexOf('J')!=-1) {
                  brand = 'JD';
                  this.selectList[2].code.map(code=>{
                    if(rowData[0]==code.value){repeat=true;right=false}
                  });
                } else {
                  brand = 'NULL'
                  right = false;
                }
              } else {
                brand = 'NULL'
                right = false;
              }
              this.newItems.map(item=>{
                if(item.brand==brand&&item.code==rowData[0]){repeat=true;right=false}
              })
              this.newItems.push({code:rowData[0],type:type,brand:brand,start_date:rowData[3]?rowData[3]:'格式错误',valid_date:rowData[4]?rowData[4]:'格式错误',repeat:repeat,right:right});
              this.dialogEditVisible = false;
            }
          })
          this.newItemText = '';
        }
      },
      goAdd() {
        if(this.newItems.length==0) {
          this.$message({type: 'warning',message: '请添加折扣码信息'});
        } else {
          let newobj = {};
          this.okItems = this.newItems.filter(item=>{return item.right==true&&item.repeat==false}).reduce((preVal, curVal) => {
            newobj[curVal.code] ? '' : newobj[curVal.code] = preVal.push(curVal); 
            return preVal 
          }, [])
          this.handleNum = this.okItems.length;
          if(this.handleNum==0) {
            this.$message({type: 'warning',message: '请确认已填入正确的信息'});
          } else {
            this.loading = true;
            this.okItems.map(item=>{
              this._addDiscount(item);
            })
          }
        }
      },
      _addDiscount(item) {
        addDiscount(item).then(res=>{
          if(res.data.status=='403') {
            this.$message({type:'warning',message:''+item.card_num+'---已存在'})
          }
          this.handleNum--
          if(this.handleNum==0) {
            this.loading = false;
            this.dialogAddVisible = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          }
        })
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
        if(this.filter=='type') {
          this.searchWord=(this.search=='2')?'单次码':'复用码';
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
        this.pageIndex = 1;
        this._getList(this.pageIndex);
      },
      defaultData() {
        getDiscount(0,'N').then(res=>{
          let data1 = [];
          res.data.data.map(item=>{data1.push({id: 'discount_ID', key: 'discount_ID',value: item.discount_ID})})
          this.selectList[0].discount_ID = data1;data1 = [];
          res.data.data.map(item=>{data1.push({id: 'code', key: 'code',value: item.code})})
          this.selectList[0].code = data1;
          
          getDiscount(0,'A').then(res=>{
            let data2 = [];
            res.data.data.map(item=>{data2.push({id: 'discount_ID', key: 'discount_ID',value: item.discount_ID})})
            this.selectList[1].discount_ID = data2;data2 = [];
            res.data.data.map(item=>{data2.push({id: 'code', key: 'code',value: item.code})})
            this.selectList[1].code = data2;
              
            getDiscount(0,'JD').then(res=>{
              let data3 = [];
              res.data.data.map(item=>{data3.push({id: 'discount_ID', key: 'discount_ID',value: item.discount_ID})})
              this.selectList[2].discount_ID = data3;data3 = [];
              res.data.data.map(item=>{data3.push({id: 'code', key: 'code',value: item.code})})
              this.selectList[2].code = data3;
            })
          })
        })
      }
    },
    mounted() {
      this._getList(this.currentPage);
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