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
      <el-radio v-model="search" @input="goSearch()" label="0">待受理</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">已驳回</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">进行中</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="3">已完成</el-radio>
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
      <el-table-column label="价格" prop="price">
        <template slot-scope="scope">
          <span>{{parseFloat(scope.row.price/100).toFixed(2)}}</span>
        </template>
      </el-table-column>
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
          <el-popover trigger="hover" placement="top" v-if="scope.row.discount_type==3||scope.row.discount_type==2">
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
          <el-tag size="mini" v-if="scope.row.agency_status==0" type="warning">待受理</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==1" type="info">已驳回</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==2" type="success">进行中</el-tag>
          <el-tag size="mini" v-if="scope.row.agency_status==3" type="info">已完成</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" v-if="$store.state.user.right.indexOf('agency_change')!=-1" @click="changeStatus(scope.row,0)"></el-link><br>
          <el-tag size="mini" v-if="scope.row.pay_status==0" type="warning">未支付</el-tag>
          <el-tag size="mini" v-if="scope.row.pay_status==1" type="success">已支付</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" v-if="$store.state.user.right.indexOf('agency_pay')!=-1" @click="changeStatus(scope.row,1)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="150" v-if="$store.state.user.right.indexOf('agency_edit')!=-1">
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
            v-if="scope.row.agency_status==0&&scope.row.pay_status==0"
            size="mini"
            type="danger"
            @click="handleDelete(scope.index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增代购信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false" v-loading='addLoading'>
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
            @input="priceOk=false"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="品牌" label-width="80px">
          <el-radio @input="priceOk=false;newItem.giftcards=[]" v-model="newItem.brand" style="margin-right:20px" label="N">Nike</el-radio>
          <el-radio @input="priceOk=false;newItem.giftcards=[]" v-model="newItem.brand" style="margin-right:20px" label="A">Adidas</el-radio>
          <el-radio @input="priceOk=false;newItem.giftcards=[]" v-model="newItem.brand" style="margin-right:20px" label="JD">JD</el-radio>
        </el-form-item>
        <el-form-item label="商品链接" label-width="80px">
          <el-input v-model="newItem.storage_link" @input="priceOk=false"></el-input>
        </el-form-item>
        <el-form-item label="尺码" label-width="80px">
          <el-checkbox @input="priceOk=false" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <el-checkbox-group @input="priceOk=false" v-model="newItem.size">
            <el-checkbox v-for="(item,index) in sizeList" :key="index" :label="item"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="礼品卡" label-width="80px">
          <el-radio @input="priceOk=false" v-model="newItem.giftcard_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.giftcard_type" style="margin-right:20px" label="1">平台提供</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.giftcard_type" style="margin-right:20px" label="2">自行提供</el-radio>
          <el-table
            id="giftCardTable"
            v-if="newItem.giftcard_type=='2'"
            height="200"
            style="width:80%;overflow:hidden;"
            :data="newItem.giftcards">
            <el-table-column min-width="40%" label="卡号" prop="card_num"></el-table-column>
            <el-table-column min-width="20%" label="PIN" prop="pin"></el-table-column>
            <el-table-column min-width="20%" label="有效性" prop="right">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.right==false" type="warning" size="mini">无效</el-tag>
                <el-tag v-else type="success" size="mini">{{parseFloat(scope.row.balance/100).toFixed(2)}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column min-width="20%" label="" prop="right">
              <template slot-scope="scope">
                <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="newItem.giftcards.splice(scope.$index,1)"></el-button>
              </template>
              <template slot="header">
                <el-button
                  size="mini"
                  type="primary"
                  @click="goAddGiftcard()">新增</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="折扣码" label-width="80px">
          <el-radio @input="priceOk=false" v-model="newItem.discount_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.discount_type" style="margin-right:20px" label="1">平台提供</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.discount_type" style="margin-right:20px" label="2">自行提供-单次码</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.discount_type" style="margin-right:20px" label="3">自行提供-复用码</el-radio>
          <el-input v-model="newItem.discount_code" v-if="newItem.discount_type=='2'" placeholder="输入单次码，用逗号隔开"></el-input>
          <el-input v-model="newItem.discount_code" v-if="newItem.discount_type=='3'" placeholder="输入复用码"></el-input>
        </el-form-item>
        <el-form-item label="购物账号" label-width="80px">
          <el-radio @input="priceOk=false" v-model="newItem.account_type" style="margin-right:20px" label="0">不用</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.account_type" style="margin-right:20px" label="1">普通账号</el-radio>
          <el-radio @input="priceOk=false" v-model="newItem.account_type" style="margin-right:20px" label="2">生日账号</el-radio>
        </el-form-item>
        <el-form-item label="单数" label-width="80px">
          <el-input @input="priceOk=false" v-model="newItem.order_num" onkeyup="value=value.replace(/[^\d]/g,'')" oninput="if(value>9999)value=9999;if(value<1)value=1"></el-input>
        </el-form-item>
        <el-form-item label="时限" label-width="80px">
          <el-input @input="priceOk=false" v-model="newItem.interval" placeholder="20~300小时"></el-input>
        </el-form-item>
        <!-- <el-form-item label="费用" label-width="80px">
          <el-input v-model="newItem.price" disabled></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" style="font-weight:bold;margin-right:10px" size="small" @click="generatePrice">生成价格</el-button>
        <!-- <el-tag style="float:left;font-size:18px;font-weight:bold">价格：￡{{newItem.price}}</el-tag> -->
        <br>
        <el-input size="mini" style="margin:10px 0;width:100px" v-model="newItem.price"></el-input>
        <br>
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()" :disabled="!priceOk">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量导入礼品卡" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini">
        <el-form-item label="文本信息">
          <el-input type="textarea" rows="10" v-model="newItemText" placeholder="xxxx xxxx
xxxx xxxx
卡号 PIN"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="enterItems()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="订单状态修改" :visible.sync="dialogStatusVisible" :close-on-click-modal="false">
      <el-form v-if="changeType==0">
        <el-form-item>
          <el-radio v-model="dialogStatus" label="0">待受理</el-radio>
          <el-radio v-model="dialogStatus" label="1">已驳回</el-radio>
          <el-radio v-model="dialogStatus" label="2">进行中</el-radio>
          <el-radio v-model="dialogStatus" label="3">已完成</el-radio>
        </el-form-item>
      </el-form>
      <el-form v-else>
        <el-form-item>
          <el-radio v-model="dialogStatus" label="0">未支付</el-radio>
          <el-radio v-model="dialogStatus" label="1">已支付</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatusVisible = false">取 消</el-button>
        <el-button type="primary" @click="goStatusChange()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="订单价格修改" :visible.sync="dialogPriceEdit" :close-on-click-modal="false">
      <el-form>
        <el-form-item>
          <el-input v-model="editItemPrice"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPriceEdit = false">取 消</el-button>
        <el-button type="primary" @click="goPriceEdit()">确 定</el-button>
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
  import { getGiftcard,addGiftcard,delGiftcard,addAgency,delAgency,getAgency,editAgency,changeAgency,changeAgencyPay,filterAgency,getCrawlerGiftcard } from '@/network/agency.js'
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
          price: '0',
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
        changeType: null,

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
        },
        priceOk: false,
        addLoading: false,

        dialogPriceEdit: false,
        editItem: null,
        editItemPrice: null,
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
          price: '0',
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
        let regExp = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
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
        } else if(this.newItem.giftcard_type=='2'&&this.newItem.giftcards.filter(card=>{return card.right==true}).length==0) {
          this.$message({type: 'warning',message: '请添加有效的礼品卡信息'});
        } else if(this.newItem.discount_type=='') {
          this.$message({type: 'warning',message: '请选择折扣码类别'});
        } else if(this.newItem.discount_type=='2'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写单次礼品卡'});
        } else if(this.newItem.discount_type=='3'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写复用礼品卡'});
        } else if(this.newItem.account_type=='') {
          this.$message({type: 'warning',message: '请选择购物账号类别'});
        } else if(this.newItem.order_num=='') {
          this.$message({type: 'warning',message: '请填入单数'});
        } else if(this.newItem.order_num!=parseInt(this.newItem.order_num)||parseFloat(this.newItem.order_num)<1) {
          this.$message({type: 'warning',message: '请填入正确的单数'});
        } else if(this.newItem.interval=='') {
          this.$message({type: 'warning',message: '请选择代购时限'});
        } else if(this.newItem.interval!=parseFloat(this.newItem.interval)) {
          this.$message({type: 'warning',message: '请填入正确的代购时限'});
        } else if(parseFloat(this.newItem.interval)<20||parseFloat(this.newItem.interval)>300) {
          this.$message({type: 'warning',message: '请确认代购时限在 20~300 小时'});
        } else if(parseFloat(this.newItem.price)!=this.newItem.price&&regExp.test(this.newItem.price)==false) {
          this.$message({type: 'warning',message: '请输入正确的价格'});
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
      goAddGiftcard() {
        if(this.newItem.brand == '') {
          this.$message({type:'warning',message:'请选择代购品牌'})
        } else if(this.newItem.brand=='A') {
          this.$message({type:'warning',message:'暂不支持Adidas的礼品卡'})
        } else {
          this.dialogEditVisible = true
        }
      },
      handleEdit(index, row) {
        this.editItem = row;
        this.editItemPrice = parseFloat(row.price/100).toFixed(2);
        this.dialogPriceEdit = true;
      },
      goPriceEdit() {
        let regExp = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
        if((this.editItemPrice=='')||(parseFloat(this.editItemPrice)!=this.editItemPrice&&regExp.test(this.editItemPrice)==false)) {
          this.$message({type:'warning',message:'请输入正确的价格'})
        } else {
          editAgency({
            agency_ID: this.editItem.agency_ID,
            price: this.editItemPrice
          }).then(res=>{
            if(res.data.status=='200') {
              this.$message({type:'success',message:'修改价格成功'})
            } else {
              this.$message({type:'warning',message:'修改价格失败'+res.data.msg})
            }
            this.currentPage = 1;
            this._getList(this.currentPage)
            this.dialogPriceEdit = false
          })
        }
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.agency_ID +'的代购订单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delAgency(row.agency_ID).then(res=>{
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
            if(this.search=='0')this.searchWord='待受理'
            if(this.search=='1')this.searchWord='已驳回'
            if(this.search=='2')this.searchWord='进行中'
            if(this.search=='3')this.searchWord='已完成'
          } else if(this.filter=='pay_status') {
            if(this.search=='0')this.searchWord='未支付'
            if(this.search=='1')this.searchWord='已支付'
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
          let cardAmount = rows.length;
          this.dialogEditVisible = false;
          this.addLoading = true;
          rows.map(row=>{
            if(row!='') {
              let rowData = row.split(' ').filter(iii=>{return iii!=''&&iii!=' '});
              let flag = false;
              let balance = null;
              getCrawlerGiftcard({card_num:rowData[0],pin:rowData[1],brand:this.newItem.brand}).then(res=>{
                flag = false
                if(res.data.status=='200') {
                  balance = res.data.balance;
                  flag = true
                }
                this.newItem.giftcards.push({card_num:rowData[0],pin:rowData[1],brand:this.newItem.brand,right:flag,balance:balance});
                cardAmount-=1;
                if(cardAmount==0) {
                  this.addLoading = false;
                }
              });
            }
          })
          this.newItemText = '';
        }
      },
      _addGiftcard(item) {
        this.newItem.giftcards.push(item);
      },
      changeStatus(row,type) {
        this.dialogStatusVisible = true;
        this.dialogStatus = (type==0)?row.agency_status:row.pay_status;
        this.changeType = type;
        this.oldAgency = row;
      },
      goStatusChange() {
        if(this.oldAgency.agency_status!=this.dialogStatus&&this.changeType==0) {
          changeAgency({
            'agency_ID': this.oldAgency.agency_ID,
            'agency_status': this.dialogStatus,
          }).then(res => {
            this.$message({type: 'success',message: '状态修改成功'});
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogStatusVisible = false;
          })
        } else if(this.oldAgency.pay_status!=this.dialogStatus&&this.changeType==1) {
          changeAgencyPay({
            'agency_ID': this.oldAgency.agency_ID,
            'pay_status': this.dialogStatus,
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
      },
      generatePrice() {
        let linkMsg = {
          'N': {link:'www.nike.com/gb',msg:'请填写https://www.nike.com/gb中的商品链接'},
          'A': {link:'www.adidas.co.uk',msg:'请填写https://www.adidas.co.uk/中的商品链接'},
          'JD': {link:'www.jdsports.co.uk',msg:'请填写https://www.jdsports.co.uk/中的商品链接'},
        }
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
        } else if(this.newItem.giftcard_type=='2'&&this.newItem.giftcards.filter(card=>{return card.right==true}).length==0) {
          this.$message({type: 'warning',message: '请添加有效的礼品卡信息'});
        } else if(this.newItem.discount_type=='') {
          this.$message({type: 'warning',message: '请选择折扣码类别'});
        } else if(this.newItem.discount_type=='2'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写单次礼品卡'});
        } else if(this.newItem.discount_type=='3'&&this.newItem.discount_code=='') {
          this.$message({type: 'warning',message: '请填写复用礼品卡'});
        } else if(this.newItem.account_type=='') {
          this.$message({type: 'warning',message: '请选择购物账号类别'});
        } else if(this.newItem.order_num=='') {
          this.$message({type: 'warning',message: '请填入单数'});
        } else if(this.newItem.order_num!=parseInt(this.newItem.order_num)||parseFloat(this.newItem.order_num)<1) {
          this.$message({type: 'warning',message: '请填入正确的单数'});
        } else if(this.newItem.interval=='') {
          this.$message({type: 'warning',message: '请选择代购时限'});
        } else if(this.newItem.interval!=parseFloat(this.newItem.interval)) {
          this.$message({type: 'warning',message: '请填入正确的代购时限'});
        } else if(parseFloat(this.newItem.interval)<20||parseFloat(this.newItem.interval)>300) {
          this.$message({type: 'warning',message: '请确认代购时限在 20~300 小时'});
        } else {
          this.addLoading = true
          if(this.newItem.brand=='N') {
            this.$axios({
              method: 'get',
              url: this.newItem.storage_link,
            }).then(res=>{
              let price,totalPrice;
              if(this.newItem.brand=='N') {
                let index = res.data.indexOf('currentPrice')
                price = res.data.slice(index,index+20).split(':')[1].split(',')[0]
              } else if(this.newItem.brand=='A') {
                let index1 = res.data.indexOf('"priceCurrency":"GBP","price":')
                let index2 = res.data.indexOf(',"availability":"')
                price = res.data.slice(index1+30,index2)
              } else if(this.newItem.brand=='JD') {
                let index = res.data.indexOf('<meta name="twitter:data1" content="')
                price = res.data.slice(index+30,index+50)
              }
              price = parseFloat(price)
              totalPrice = parseFloat((this.newItem.account_type==2?this.options.account_birthday:0)
              + (this.newItem.account_type==1?this.options.account_common:0)
              + (this.newItem.discount_type==1?this.options.discount:0)
              + (price * this.options.k)
              + (this.newItem.giftcard_type==1?price*this.options.giftcard:0))
              this.newItem.price = parseFloat(totalPrice*parseInt(this.newItem.order_num)).toFixed(2)
              this.priceOk = true;
              this.addLoading = false;
            }).catch(e=>{
              this.$message({type: 'warning',message: '获取商品价格失败'})
              this.addLoading = false;
            })
          } else {
            let price,totalPrice;
            price = parseFloat(120)
            totalPrice = parseFloat((this.newItem.account_type==2?this.options.account_birthday:0)
            + (this.newItem.account_type==1?this.options.account_common:0)
            + (this.newItem.discount_type==1?this.options.discount:0)
            + (price * this.options.k)
            + (this.newItem.giftcard_type==1?price*this.options.giftcard:0))
            this.newItem.price = parseFloat(totalPrice*parseInt(this.newItem.order_num)).toFixed(2)
            this.priceOk = true;
            this.addLoading = false;
          }
        }
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
        getUser(0).then(res=>{
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
              this.options[opt.option] = parseFloat(opt.value)
            })
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