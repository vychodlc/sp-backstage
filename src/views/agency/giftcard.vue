<template>
  <div class="post-container">
    <template>
      <el-radio style="margin-right:20px" @input="changeBrand('N')" v-model="brand" label="N">Nike</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('A')" v-model="brand" label="A">Adidas</el-radio>
      <el-radio style="margin-right:20px" @input="changeBrand('JD')" v-model="brand" label="JD">JDSports</el-radio>
    </template>
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="giftcard_ID"></el-option>
      <el-option label="卡号" value="card_num"></el-option>
    </el-select>
    <el-autocomplete
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
      <el-table-column label="礼品卡编号" prop="giftcard_ID"></el-table-column>
      <el-table-column label="卡号" prop="card_num"></el-table-column>
      <el-table-column label="PIN码" prop="pin"></el-table-column>
      <el-table-column label="余额" prop="balance"></el-table-column>
      <el-table-column label="品牌" prop="brand"></el-table-column>
      <el-table-column label="添加时间" prop="add_time"></el-table-column>
      <el-table-column label="操作" align="right" width="200" v-if="$store.state.user.right.indexOf('giftcard_edit')!=-1">
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
    
    <el-dialog title="新增礼品卡信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog" v-loading='addLoading'>
      <el-form label-width="100px" size="mini">
        <el-row>
          <el-col :span="8">
            <el-form-item label="卡号" label-width="80px">
              <el-input v-model="newItem.card_num"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="PIN" label-width="80px">
              <el-input v-model="newItem.pin"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品牌" label-width="80px">
              <el-select v-model="newItem.brand" placeholder="请选择品牌">
                <el-option label="Nike" value="N"></el-option>
                <!-- <el-option label="Adidas" value="A"></el-option> -->
                <el-option label="JD·Sports" value="JD"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="float:right">
          <el-button type="success" @click="dialogEditVisible=true">批量添加</el-button>
          <el-button type="primary" @click="handleAddAdd()">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table
      height='300'
      style="width: 100%;overflow:hidden;"
      :row-style="{height: '30px'}"
      :data="newItems">
        <el-table-column min-width="30%" label="卡号" prop="card_num"></el-table-column>
        <el-table-column min-width="20%" label="PIN" prop="pin"></el-table-column>
        <el-table-column min-width="20%" label="品牌" prop="brand">
          <template slot-scope="scope">
            <span v-if="scope.row.brand=='N'">Nike</span>
            <span v-else-if="scope.row.brand=='A'">Adidas</span>
            <span v-else-if="scope.row.brand=='JD'">JDSports</span>
            <span v-else>品牌错误</span>
          </template>
        </el-table-column>
        <el-table-column min-width="20%" label="余额" prop="balance"></el-table-column>
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量导入礼品卡" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini">
        <el-form-item label="文本信息">
          <el-input type="textarea" rows="10" v-model="newItemText" placeholder="xxxx xxxx xxxx
xxxx xxxx xxxx
卡号 PIN 品牌"></el-input>
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
  import { getGiftcard,filterGiftcard,addGiftcard,delGiftcard,getCrawlerGiftcard } from '@/network/agency.js'
  export default {
    name: "giftcard",
    data () {
      return {
        showDialog: true,
        brand: 'N',
        search: null,
        searchWord: null,
        filter: 'giftcard_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        addLoading: false,
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          card_num: '',
          pin: '',
          balance: '',
          brand: '',
          right: false,
          repeat: false,
        },
        newItemText: '',
        newItems: [],
        okItems: null,
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
          'giftcard_ID': {name:'编号'},
          'card_num': {name:'卡号'}
        },
        selectList: [[],[],[]],
      }
    },
    methods:{
      test(index) {
      },
      _getList(pageIndex) {    
        this.defaultData();
        this.loading = true;
        if(this.isSearch==true) {
          filterGiftcard(this.filter,this.search,pageIndex,this.brand).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.giftcards_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }
            this.loading = false;
          });
        } else {
          getGiftcard(pageIndex,this.brand).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.giftcards_num);
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
          card_num: '',
          pin: '',
          balance: '',
          brand: '',
          right: false,
          repeat: false,
        };
        this.newItems = [];
        this.dialogAddVisible = true;
      },
      handleAddAdd() {
        if(this.newItem.card_num=='') {
          this.$message({type: 'warning',message: '请填写礼品卡号'});
        } else if(this.newItem.pin=='') {
          this.$message({type: 'warning',message: '请填写礼品卡PIN码'});
        } else if(this.newItem.brand=='') {
          this.$message({type: 'warning',message: '请填写礼品卡品牌'});
        } else {
          this.addLoading = true;
          this.enterNum = 1;
          let flag = false;
          this.newItems.map(item=>{
            if(item.brand==this.newItem.brand&&item.card_num==this.newItem.card_num) {
              flag = true
            }
          })
          let index;
          if(this.newItem.brand=='N')index=0
          if(this.newItem.brand=='A')index=1
          if(this.newItem.brand=='JD')index=2
          this.selectList[index].card_num.map(item=>{
            if(item.value==this.newItem.card_num) {
              flag = true
            }
          })
          if(flag==true) {
            this.enterNum--;
            this.newItems.push({card_num:this.newItem.card_num,pin:this.newItem.pin.toUpperCase(),balance:'无效',brand:this.newItem.brand,right:false,repeat:true})          
            this.addLoading = false;
          } else {
            this.addItem(this.newItem);
          }
          this.newItem = {
            card_num: '',
            pin: '',
            balance: '',
            brand: '',
          };
        } 
      },
      addItem(item) {
        if(item.brand.toUpperCase().indexOf('N')!=-1) {
          item.brand = 'N'
          this.$axios({
            method: 'post',
            url: 'https://api.nike.com/payment/giftcard_balance/v1/',
            data: JSON.stringify({
              'accountNumber': item.card_num.toString(),
              'currency': 'GBP',
              'pin': item.pin.toString(),
            }),
            headers: {
              "Content-Type": "application/json",
              "appid":"orders",
              "x-nike-visitid":"3",
              "x-nike-visitorid":this.guid(),
            }
          }).then(res=>{
            item.balance = res.data.balance;
            item.right = true;
            this.newItems.push(item);
            this.enterNum--;
            if(this.enterNum==0) {
              this.addLoading = false
            }
          }).catch(e=>{
            this.$message({type: 'warning',message: '卡号或PIN码错误'});
            item.balance = '无效';
            item.right = false;
            this.newItems.push(item);
            this.enterNum--;
            if(this.enterNum==0) {
              this.addLoading = false
            }
          })
        } else if(item.brand.toUpperCase().indexOf('J')!=-1) {
          let flag,balance;
          balance = '无效'
          getCrawlerGiftcard({card_num:item.card_num,pin:item.pin.toUpperCase(),brand:'JD'}).then(res=>{
            flag = false
            if(res.data.status=='200') {
              balance = parseFloat(parseInt(res.data.balance)/100).toFixed(2);
              flag = true
            }
            this.newItems.push({card_num:item.card_num,pin:item.pin.toUpperCase(),brand:'JD',right:flag,balance:balance});
            this.enterNum--;
            if(this.enterNum==0) {
              this.addLoading = false
            }
          });
        // } else if(item.brand.toUpperCase().indexOf('A')!=-1) {
        } else {
          this.newItems.push({card_num:item.card_num,pin:item.pin.toUpperCase(),balance:'无效',brand:'品牌错误',right:false})
          this.enterNum--;
          if(this.enterNum==0) {
            this.addLoading = false
          }
        }
      },
      enterItems() {
        if(this.newItemText=='') {
          this.$message({type: 'warning',message: '请输入内容'});
        } else {
          let items = [];
          let rows = this.newItemText.split('\n');
          this.addLoading = true;
          this.enterNum = rows.length;
          rows.map(row=>{
            if(row!='') {
              let rowData = row.split(' ').filter(iii=>{return iii!=''&&iii!=' '});
              if(rowData.length>2) {
                let repeat = false;
                if(rowData[2].toUpperCase().indexOf('N')!=-1) {
                  this.selectList[0].card_num.map(item=>{
                    if(item.value==rowData[0])repeat=true
                  })
                } else if(rowData[2].toUpperCase().indexOf('A')!=-1) {
                  this.selectList[1].card_num.map(item=>{
                    if(item.value==rowData[0])repeat=true
                  })
                } else if(rowData[2].toUpperCase().indexOf('JD')!=-1) {
                  this.selectList[2].card_num.map(item=>{
                    if(item.value==rowData[0])repeat=true
                  })
                }
                if(repeat==true) {
                  this.enterNum--;
                  this.newItems.push({card_num:rowData[0],pin:rowData[1],balance:'无效',brand:rowData[2],right:false,repeat:true})
                  if(this.enterNum==0) {
                    this.addLoading = false
                  }
                } else {
                  this.addItem({card_num:rowData[0],pin:rowData[1],brand:rowData[2],right:false});
                }
              } else {
                this.enterNum--;
                this.newItems.push({card_num:rowData[0],pin:rowData[1]?rowData[1]:'格式错误',balance:'无效',brand:rowData[2]?rowData[2]:'格式错误',right:false})
                if(this.enterNum==0) {
                  this.addLoading = false
                }
              }
              this.dialogEditVisible = false;
            }
          })
          this.newItemText = '';
        }
      },
      goAdd() {
        if(this.newItems.length==0) {
          this.$message({type: 'warning',message: '请添加礼品卡信息'});
        } else {
          let newobj = {};
          this.okItems = this.newItems.filter(item=>{return item.right==true}).reduce((preVal, curVal) => {
            newobj[curVal.card_num] ? '' : newobj[curVal.card_num] = preVal.push(curVal); 
            return preVal 
          }, [])
          
          this.handleNum = this.okItems.length;
          if(this.handleNum==0) {
            this.$message({type: 'warning',message: '请确认已填入正确的信息'});
          } else {
            this.loading = true;
            this.okItems.map(item=>{
              this._addGiftcard(item);
            })
          }
        }
      },
      _addGiftcard(item) {
        addGiftcard(item).then(res=>{
          this.handleNum--;
          if(this.handleNum==0) {
            this.addLoading = false;
            this.dialogAddVisible = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          }
        })
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.giftcard_ID +'的礼品卡, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delGiftcard(row.giftcard_ID).then(res=>{
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
        if(this.search==''||this.search==null) {
          this.$message({type:'warning',message:'请输入搜索词'})
        } else {
          this.isSearch = true;
          this.searchWord = this.search;
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
      changeBrand(brand) {
        this.brand = brand;
        this.pageIndex = 1;
        this._getList(this.pageIndex);
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        let index = 0;
        if(this.brand == 'N') {index = 0}
        else if(this.brand == 'A') {index = 1}
        else if(this.brand == 'JD') {index = 2}

        if(this.filter=='giftcard_ID') {
          let query = this.selectList[index].giftcard_ID;
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
      defaultData() {
        getGiftcard(0,'N').then(res=>{
          let data1 = [];
          res.data.data.map(item=>{data1.push({id: 'giftcard_ID', key: 'giftcard_ID',value: item.giftcard_ID})})
          this.selectList[0].giftcard_ID = data1;data1 = [];
          res.data.data.map(item=>{data1.push({id: 'card_num', key: 'card_num',value: item.card_num})})
          this.selectList[0].card_num = data1;
          
          getGiftcard(0,'A').then(res=>{
            let data2 = [];
            res.data.data.map(item=>{data2.push({id: 'giftcard_ID', key: 'giftcard_ID',value: item.giftcard_ID})})
            this.selectList[1].giftcard_ID = data2;data2 = [];
            res.data.data.map(item=>{data2.push({id: 'card_num', key: 'card_num',value: item.card_num})})
            this.selectList[1].card_num = data2;
              
            getGiftcard(0,'JD').then(res=>{
              let data3 = [];
              res.data.data.map(item=>{data3.push({id: 'giftcard_ID', key: 'giftcard_ID',value: item.giftcard_ID})})
              this.selectList[2].giftcard_ID = data3;data3 = [];
              res.data.data.map(item=>{data3.push({id: 'card_num', key: 'card_num',value: item.card_num})})
              this.selectList[2].card_num = data3;
            })
          })
        })
      }
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