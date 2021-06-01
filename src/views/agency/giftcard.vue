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
    
    <el-dialog title="新增礼品卡信息" :visible.sync="dialogAddVisible">
      <el-form label-width="100px" size="mini">
        <el-form-item label="卡号">
          <el-input v-model="newItem.card_num"></el-input>
        </el-form-item>
        <el-form-item label="PIN码">
          <el-input v-model="newItem.pin"></el-input>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="newItem.balance"></el-input>
        </el-form-item>
        <el-form-item label="品牌">
          <el-radio v-model="newItem.brand" label="N">Nike</el-radio>
          <el-radio v-model="newItem.brand" label="A">Adidas</el-radio>
          <el-radio v-model="newItem.brand" label="JD">JDsports</el-radio>  
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改库存信息" :visible.sync="dialogEditVisible">
      <el-form label-width="100px" size="mini">
        <el-form-item label="库存编号">
          <el-input v-model="editStorageID" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="货品尺寸">
          <el-row>
            <el-col>
              <el-form-item label="长(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[0]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="宽(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[1]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="高(cm)" label-width="80px">
                <el-input type="number" v-model="editStorageSize[2]"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="重量">
          <el-input v-model="editStorageWeight"></el-input>
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
  import { getGiftcard,addGiftcard,delGiftcard } from '@/network/agency.js'
  export default {
    name: "giftcard",
    data () {
      return {
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
        },
        newItemExpressid: '',
        newItemEmail: '',

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
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.card_num=='') {
          this.$message({type: 'warning',message: '请填写礼品卡号'});
        } else if(this.newItem.pin=='') {
          this.$message({type: 'warning',message: '请填写礼品卡PIN码'});
        } else if(this.newItem.balance=='') {
          this.$message({type: 'warning',message: '请填写礼品卡余额'});
        } else if(this.newItem.brand=='') {
          this.$message({type: 'warning',message: '请填写礼品卡品牌'});
        } else {        
          this.loading = true;
          addGiftcard({
            card_num: this.newItem.card_num,
            pin: this.newItem.pin,
            balance: this.newItem.balance,
            brand: this.newItem.brand,
          }).then(res=>{
            if(res.data.status=='200') {
              this.loading = false;
              this.currentPage = 1;
              this.$message({type: 'success',message: '新增成功'});
              this._getList(this.currentPage);
              this.dialogAddVisible = false;
            }
            else {
              this.$message({type: 'warning',message: '新增失败——'+res.data.msg});
            }
          })
        }
      },
      handleEdit(index,row) {
        this.editStorageID = row.storage_ID;
        this.editStorageSize = row.size.split('*').map(item=>parseInt(item));
        this.editStorageNumber = row.article_num;
        this.editStorageWeight = row.weight;
        this.editStoragePic = row.pic;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if (this.editStorageSize[0]=='') {
          this.$message({type: 'warning',message: '请填写长度'});
        } else if (this.editStorageSize[1]=='') {
          this.$message({type: 'warning',message: '请填写宽度'});
        } else if (this.editStorageSize[2]=='') {
          this.$message({type: 'warning',message: '请填写高度'});
        } else if (this.editStorageWeight=='') {
          this.$message({type: 'warning',message: '请填写重量'});
        } else {
          this.dialogEditVisible = false;
          this.loading = true;
          editStorage({
            'storage_ID': this.editStorageID,
            'article_num': this.editStorageNumber,
            'size': this.editStorageSize.join('*'),
            'weight': this.editStorageWeight,
            'pic': this.editStoragePic,
          }).then(res=>{
            if(res.data.status=='200') {
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '修改成功'});
            } else {
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
              this.loading = false;
            }
          })
        }       
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