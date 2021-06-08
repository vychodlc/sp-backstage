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
      <el-table-column label="礼品卡编号" prop="giftcard_ID"></el-table-column>
      <el-table-column label="卡号" prop="card_num"></el-table-column>
      <el-table-column label="PIN码" prop="pin"></el-table-column>
      <el-table-column label="余额" prop="balance"></el-table-column>
      <el-table-column label="品牌" prop="brand"></el-table-column>
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
    
    <el-dialog title="新增礼品卡信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-model="showDialog">
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
                <el-option label="Adidas" value="A"></el-option>
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
        <el-table-column min-width="20%" label="品牌" prop="brand"></el-table-column>
        <el-table-column min-width="20%" label="余额" prop="balance"></el-table-column>
        <el-table-column
          prop="right"
          label=""
          width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.right==false" type="danger" icon="el-icon-delete" size="mini" circle @click="newItems.splice(scope.$index,1)"></el-button>
            <el-tag v-else type="success" size="mini">OK</el-tag>
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
  import { getGiftcard,addGiftcard,delGiftcard } from '@/network/agency.js'
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
        tableData: [],

        dialogAddVisible: false,
        newItem: {
          card_num: '',
          pin: '',
          balance: '',
          brand: '',
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
          'giftcard_ID': {name:'编号'},
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
          getGiftcard(pageIndex,this.brand).then(res => {
            console.log(res);
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
        };
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
          this.addItem(this.newItem);
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
          console.log('Nike go go go');
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
          }).catch(e=>{
            this.$message({type: 'warning',message: '卡号或PIN码错误'});
            item.balance = 0;
            item.right = false;
            this.newItems.push(item);
          })
        } else if(item.brand.toUpperCase().indexOf('A')!=-1) {
          console.log('Adidas go go go');
          this.$axios({
            method: 'post',
            url: 'https://www.jdsports.co.uk/gift-cards/'+item.card_num,
            data: JSON.stringify({
              'cardPin': item.pin.toString(),
            }),
            headers: {
              "Content-Type": "application/json",
		          "accept": "*/*",
		          "x-requested-with": "XMLHttpRequest",
            }
          }).then(res=>{
            item.balance = res.data.balance;
            item.right = true;
            this.newItems.push(item);
          }).catch(e=>{
            this.$message({type: 'warning',message: '卡号或PIN码错误'});
            item.balance = 0;
            item.right = false;
            this.newItems.push(item);
          })
        } else if(item.brand.toUpperCase().indexOf('J')!=-1) {
          console.log('JD go go go');
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
              this.addItem({card_num:rowData[0],pin:rowData[1],brand:rowData[2],right:false});
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
          this.handleNum = this.newItems.filter(item=>{return item.right==true}).length;
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
            if(data.right==true) {
              this._addGiftcard(data);
            }
          }
        }
      },
      _addGiftcard(item) {
        addGiftcard(item).then(res=>{
          console.log(res);
          this.handleNum--
          if(this.handleNum==0) {
            this.loading = false;
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
        this.pageIndex = 1;
        this._getList(this.pageIndex);
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
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