<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="编号" value="agency_ID"></el-option>
      <el-option label="商品链接" value="storage_link"></el-option>
      <el-option label="账户种类" value="account_type"></el-option>
      <el-option label="折扣码种类" value="discount_type"></el-option>
      <el-option label="礼品卡种类" value="giftcard_type"></el-option>
      <el-option label="订单状态" value="agency_status"></el-option>
      <el-option label="品牌" value="brand"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="转运码" value="code"></el-option>
    </el-select>
    <template v-if="this.filter=='account_type'">
      <el-radio v-model="search" @input="goSearch()" label="0">无</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">普通账号</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">生日账号</el-radio>
    </template>
    <template v-else-if="this.filter=='discount_type'">
      <el-radio v-model="search" @input="goSearch()" label="0">无</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">平台提供</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">单次码</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="3">复用码</el-radio>
    </template>
    <template v-else-if="this.filter=='giftcard_type'">
      <el-radio v-model="search" @input="goSearch()" label="0">无</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">平台提供</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">自行提供</el-radio>
    </template>
    <template v-else-if="this.filter=='agency_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">待支付</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">待受理</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">支付取消</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="3">已驳回</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="4">进行中</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="5">已完成</el-radio>
    </template>
    <template v-else-if="this.filter=='brand'">
      <el-radio v-model="search" @input="goSearch()" label="N">Nike</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="A">Adidas</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="JD">JDSports</el-radio>
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
      <el-table-column label="编号" prop="agency_ID"></el-table-column>
      <el-table-column label="商品链接" prop="storage_link"></el-table-column>
      <el-table-column label="用户" prop="code">
        <template slot-scope="scope">{{scope.row.user_id}}-{{scope.row.code}}</template>
      </el-table-column>
      <el-table-column label="价格" prop="price"></el-table-column>
      <el-table-column label="数量" prop="order_num"></el-table-column>
      <el-table-column label="尺寸" prop="size"></el-table-column>
      <el-table-column label="品牌" prop="brand">
        <template slot-scope="scope">
          <span v-if="scope.row.brand=='N'">Nike</span>
          <span v-if="scope.row.brand=='A'">Adidas</span>
          <span v-if="scope.row.brand=='JD'">JD</span>
        </template>
      </el-table-column>
      <el-table-column label="礼品卡" prop="giftcard_type">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" v-if="scope.row.giftcard_type==2">
            <p v-for="(card,index) in scope.row.giftcards" :key="index">卡号: {{ card.card_num }},PIN: {{ card.pin }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="mini" v-if="scope.row.giftcard_type==2" type="primary">自行提供</el-tag>
            </div>
          </el-popover>
          <template v-else>
            <el-tag size="mini" v-if="scope.row.giftcard_type==0" type="info">无</el-tag>
            <el-tag size="mini" v-if="scope.row.giftcard_type==1" type="success">平台</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="购物账号" prop="account_type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.account_type==0" type="info">无</el-tag>
          <el-tag size="mini" v-if="scope.row.account_type==1" type="success">普通账号</el-tag>
          <el-tag size="mini" v-if="scope.row.account_type==2" type="primary">生日账号</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="折扣码" prop="discount_type">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" v-if="scope.row.discount_type==3">
            <p>{{scope.row.discount_code}}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="mini" v-if="scope.row.discount_type==2" type="primary">单次码</el-tag>
              <el-tag size="mini" v-if="scope.row.discount_type==3" type="primary">复用码</el-tag>
            </div>
          </el-popover>
          <template v-else>
            <el-tag size="mini" v-if="scope.row.discount_type==0" type="info">无</el-tag>
            <el-tag size="mini" v-if="scope.row.discount_type==1" type="success">平台</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" prop="apply_time"></el-table-column>
      <el-table-column label="采购时间" prop="interval"></el-table-column>
      <el-table-column label="状态" prop="agency_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.agency_status==0" type="warning">待支付</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==1" type="primary">待受理</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==2" type="info">支付取消</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==3" type="info">已驳回</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==4" type="success">进行中</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==5" type="info">已完成</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="changeStatus(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="80">
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
    
    <el-dialog title="新增代购信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini" style="max-height:50vh;overflow-y:scroll;padding-right:5px">
        <el-form-item label="用户邮箱" label-width="80px">
          <!-- <el-input v-model="newItem.user_email"></el-input> -->
          <el-autocomplete
            class="inline-input"
            v-model="newItem.user_email"
            size="mini"
            style="width:100%"
            :fetch-suggestions="querySearch2"
            :trigger-on-focus="false"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="商品链接" label-width="80px">
          <el-input v-model="newItem.storage_link"></el-input>
        </el-form-item>
        <el-form-item label="品牌" label-width="80px">
          <el-radio v-model="newItem.brand" style="margin-right:20px" label="N">Nike</el-radio>
          <el-radio v-model="newItem.brand" style="margin-right:20px" label="A">Adidas</el-radio>
          <el-radio v-model="newItem.brand" style="margin-right:20px" label="JD">JD</el-radio>
        </el-form-item>
        <el-form-item label="尺码" label-width="80px">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <el-checkbox-group v-model="newItem.size">
            <el-checkbox v-for="(item,index) in sizeList" :key="index" :label="item"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="礼品卡" label-width="80px">
          <el-radio v-model="newItem.giftcard_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio v-model="newItem.giftcard_type" style="margin-right:20px" label="1">平台提供</el-radio>
          <el-radio v-model="newItem.giftcard_type" style="margin-right:20px" label="2">自行提供</el-radio>
          <el-table
            id="giftCardTable"
            v-if="newItem.giftcard_type=='2'"
            height="200"
            style="width:80%;overflow:hidden;"
            :data="newItem.giftcards">
            <el-table-column min-width="40%" label="卡号" prop="card_num"></el-table-column>
            <el-table-column min-width="20%" label="PIN" prop="pin"></el-table-column>
            <el-table-column min-width="20%" label="品牌" prop="brand"></el-table-column>
            <el-table-column min-width="20%" label="" prop="right">
              <template slot-scope="scope">
                <el-button v-if="scope.row.right==false" type="danger" icon="el-icon-delete" size="mini" circle @click="newItem.giftcards.splice(scope.$index,1)"></el-button>
                <el-tag v-else type="success" size="mini">OK</el-tag>
              </template>
              <template slot="header">
                <el-button
                  size="mini"
                  type="primary"
                  @click="dialogEditVisible=true">新增</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="折扣码" label-width="80px">
          <el-radio v-model="newItem.discount_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio v-model="newItem.discount_type" style="margin-right:20px" label="1">平台提供</el-radio>
          <el-radio v-model="newItem.discount_type" style="margin-right:20px" label="2">自行提供-单次码</el-radio>
          <el-radio v-model="newItem.discount_type" style="margin-right:20px" label="3">自行提供-复用码</el-radio>
          <el-input v-model="newItem.discount_code" v-if="newItem.discount_type=='2'" placeholder="输入单次码，用逗号隔开"></el-input>
          <el-input v-model="newItem.discount_code" v-if="newItem.discount_type=='3'" placeholder="输入复用码"></el-input>
        </el-form-item>
        <el-form-item label="购物账号" label-width="80px">
          <el-radio v-model="newItem.account_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio v-model="newItem.account_type" style="margin-right:20px" label="1">普通账号</el-radio>
          <el-radio v-model="newItem.account_type" style="margin-right:20px" label="2">生日账号</el-radio>
        </el-form-item>
        <el-form-item label="单数" label-width="80px">
          <el-input v-model="newItem.order_num"></el-input>
        </el-form-item>
        <el-form-item label="时限" label-width="80px">
          <el-input v-model="newItem.interval" placeholder="20~300小时"></el-input>
        </el-form-item>
        <!-- <el-form-item label="费用" label-width="80px">
          <el-input v-model="newItem.price" disabled></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-tag style="float:left;font-size:18px;font-weight:bold">价格：￡{{newItem.price}}</el-tag>
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()">确 定</el-button>
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
    <el-dialog title="订单状态修改" :visible.sync="dialogStatusVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogStatus" label="0">待支付</el-radio>
          <el-radio v-model="dialogStatus" label="1">待受理</el-radio>
          <el-radio v-model="dialogStatus" label="2">支付取消</el-radio>
          <el-radio v-model="dialogStatus" label="3">已驳回</el-radio>
          <el-radio v-model="dialogStatus" label="4">进行中</el-radio>
          <el-radio v-model="dialogStatus" label="5">已完成</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatusVisible = false">取 消</el-button>
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
  import { getGiftcard,addGiftcard,delGiftcard,addAgency,getAgency,changeAgency,filterAgency } from '@/network/agency.js'
  import { getUserByEmail,getUser } from '@/network/user.js'
  import { getOption } from '@/network/option.js'
  export default {
    name: "giftcard",
    data () {
      return {
        showDialog: true,
        brand: '',
        search: null,
        searchWord: null,
        filter: 'agency_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        sizeList: ['30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48'],

        dialogAddVisible: false,
        newItem: {
          user_email: '1@1.com',
          user_id: '',
          brand: '',
          storage_link: 'www.baidu.com',
          price: '123',
          size: [],
          account_type: '',
          discount_type: '',
          discount_code: '',
          giftcard_type: '',
          giftcards: [],
          order_num: '',
          interval: '',
        },
        isIndeterminate: true,
        checkAll: false,
        newItemText: '',
        newItems: [],
        handleNum: 0,

        dialogEditVisible: false,
        dialogStatusVisible: false,
        oldAgency: null,
        dialogStatus: '',
        editStorageID: '',
        editStorageSize: '',
        editStorageNumber: '',
        editStorageWeight: '',
        editStoragePic: '',
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldStorage: null,

        selectList: [],

        pageNum: null,
        currentPage: 1,
        options: {},
        interpret: {
          'agency_ID': {name:'编号'},
          'storage_link': {name:'商品链接'},
          'brand': {name:'品牌'},
          'account_type': {name:'账户种类'},
          'discount_type': {name:'折扣码种类'},
          'giftcard_type': {name:'礼品卡种类'},
          'agency_status': {name:'订单状态'},
          'user_id': {name:'用户编号'},
          'user_email': {name:'邮箱'},
          'code': {name:'转运码'},
        }
      }
    },
    methods:{
      test(index) {
      },
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          let filter = this.filter,search = this.search;
          if(filter=='user_email') {
            this.selectList.user_email.map(item=>{
              if(item.value==search) {
                filter = 'user_id';
                search = item.id;
              }
            })
          } else if(filter=='code') {
            this.selectList.code.map(item=>{
              if(item.value==search) {
                filter = 'user_id';
                search = item.id;
              }
            })
          }
          filterAgency(filter,search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.agencys_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          })
        } else {
          getAgency(pageIndex).then(res => {
            if(res.data.status=='200') {
              console.log(res.data.data);
              this.pageNum = parseInt(res.data.agencys_num);
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
          user_email: '',
          user_id: '',
          brand: '',
          storage_link: '',
          price: '123',
          size: [],
          account_type: '',
          discount_type: '',
          discount_code: '',
          giftcard_type: '',
          giftcards: [],
          order_num: '',
          interval: '',
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.user_email=='') {
          this.$message({type: 'warning',message: '请填写用户邮箱'});
        } else if(this.newItem.storage_link=='') {
          this.$message({type: 'warning',message: '请填写商品链接'});
        } else if(this.newItem.brand=='') {
          this.$message({type: 'warning',message: '请选择品牌'});
        } else if(this.newItem.size.length==0) {
          this.$message({type: 'warning',message: '请选择尺寸'});
        } else if(this.newItem.giftcard_type=='') {
          this.$message({type: 'warning',message: '请选择礼品卡类别'});
        } else if(this.newItem.giftcard_type=='2'&&this.newItem.giftcards.length==0) {
          this.$message({type: 'warning',message: '请添加礼品卡信息'});
        } else if(this.newItem.discount_type=='') {
          this.$message({type: 'warning',message: '请选择折扣码类别'});
        } else if(this.newItem.discount_type=='2'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写单次礼品卡'});
        } else if(this.newItem.discount_type=='3'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写复用礼品卡'});
        } else if(this.newItem.account_type=='') {
          this.$message({type: 'warning',message: '请选择购物账号类别'});
        } else if(this.newItem.order_num=='') {
          this.$message({type: 'warning',message: '请选择单数'});
        } else if(this.newItem.interval=='') {
          this.$message({type: 'warning',message: '请选择代购时限'});
        } else {
          getUserByEmail(this.newItem.user_email).then(res=>{
            if(res.data.status=='200') {
              this.newItem.user_id = res.data.user_ID;
              addAgency(this.newItem).then(res=>{
                if(res.data.status=='200') {
                  this.dialogAddVisible = false;
                  this.currentPage = 1;
                  this._getList(this.currentPage)
                }
              })
            } else {          
              this.$message({type: 'warning',message: '该用户不存在'});
            }
          })
        }
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.agency_ID +'的礼品卡, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delGiftcard(row.agency_ID).then(res=>{
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
          if(this.filter=='agency_status') {
            if(this.search=='0')this.searchWord='待支付'
            if(this.search=='1')this.searchWord='待受理'
            if(this.search=='2')this.searchWord='支付取消'
            if(this.search=='3')this.searchWord='已驳回'
            if(this.search=='4')this.searchWord='进行中'
            if(this.search=='5')this.searchWord='已完成'
          } else if(this.filter=='account_type') {
            if(this.search=='0')this.searchWord='无'
            if(this.search=='1')this.searchWord='普通账号'
            if(this.search=='2')this.searchWord='生日账号'
          } else if(this.filter=='discount_type') {
            if(this.search=='0')this.searchWord='无'
            if(this.search=='1')this.searchWord='平台提供'
            if(this.search=='2')this.searchWord='单次码'
            if(this.search=='3')this.searchWord='复用码'
          } else if(this.filter=='giftcard_type') {
            if(this.search=='0')this.searchWord='无'
            if(this.search=='1')this.searchWord='平台提供'
            if(this.search=='2')this.searchWord='自行提供'
          } else if(this.filter=='brand') {
            if(this.search=='N')this.searchWord='Nike'
            if(this.search=='A')this.searchWord='Adidas'
            if(this.search=='JD')this.searchWord='JDSports'
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
      changeBrand(brand) {
        this.brand = brand;
        this.pageIndex = 1;
        this._getList(this.pageIndex);
      },

      handleCheckAllChange(val) {
        this.newItem.size = val ? this.sizeList : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.sizeList.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.sizeList.length;
      },
      enterItems() {
        if(this.newItemText=='') {
          this.$message({type: 'warning',message: '请输入内容'});
        } else {
          let rows = this.newItemText.split('\n');
          rows.map(row=>{
            if(row!='') {
              let rowData = row.split(' ').filter(iii=>{return iii!=''&&iii!=' '});
              this._addGiftcard({card_num:rowData[0],pin:rowData[1],brand:rowData[2],right:false});
              this.dialogEditVisible = false;
            }
          })
          this.newItemText = '';
        }
      },
      _addGiftcard(item) {
        this.newItem.giftcards.push(item);
      },
      changeStatus(row) {
        this.dialogStatusVisible = true;
        this.dialogStatus = row.agency_status;
        this.oldAgency = row;
      },
      goStatusChange() {
        if(this.oldAgency.agency_status!=this.dialogStatus) {
          changeAgency({
            'agency_ID': this.oldAgency.agency_ID,
            'agency_status': this.dialogStatus,
          }).then(res => {
            this.$message({type: 'success',message: '状态修改成功'});
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogStatusVisible = false;
          })
        } else {
          this.$message({type: 'warning',message: '状态未修改'});
        }
      },
      querySearch(queryString, cb) {
        queryString = queryString.toString();

        if(this.filter=='agency_ID') {
          let query = this.selectList.agency_ID;
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
        } else if(this.filter=='code') {
          let query = this.selectList.code;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='storage_link') {
          let query = this.selectList.storage_link;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } 
      },
      querySearch2(queryString, cb) {
        queryString = queryString.toString();
        let query = this.selectList.user_email;
        let results = queryString ? query.filter(this.createFilter(queryString)) : query;
        cb(results)
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
      }
    },
    mounted() {
      getAgency(0).then(res=>{
        let data1 = [];
        let data2 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'agency_ID', key: 'agency_ID',value: item.agency_ID})
          data2.push({id: 'storage_link', key: 'storage_link',value: item.storage_link})
        })
        this.selectList.agency_ID = data1;
        this.selectList.storage_link = this.deWeight(data2);
        getUser().then(res=>{
          let users = res.data.data;
          let emails = [],ids = [],codes = [];
          users.map(user=>{
            emails.push({id: user.id, key: 'user_email',value: user.user_email})
            ids.push({id: user.id, key: 'id',value: user.id})
            codes.push({id: user.id, key: 'code',value: user.code})
          })
          this.selectList.user_email = emails;
          this.selectList.user_id = ids;
          this.selectList.code = codes;
          this.loading = false;
          getOption(0).then(res=>{
            let data = res.data.data;
            res.data.data.map(opt=>{
              this.options[opt.option] = opt.value
            })
            console.log(this.options);
            this.currentPage = 1;
            this._getList(this.currentPage);
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