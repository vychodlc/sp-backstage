<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="出库单号" value="outbound_ID"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="转运码" value="code"></el-option>
      <el-option label="出库方式" value="outbound_type"></el-option>
      <el-option label="支付状态" value="pay_status"></el-option>
      <el-option label="状态" value="outbound_status"></el-option>
    </el-select>
    <template v-if="filter=='outbound_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">待审核</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">已取消</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="2">已驳回</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="3">待出库</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="4">转运中</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="5">已完成</el-radio>
    </template>
    <template v-else-if="filter=='outbound_type'">
      <el-radio v-model="search" @input="goSearch()" label="0">普通出库</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">退税出库</el-radio>
    </template>
    <template v-else-if="filter=='pay_status'">
      <el-radio v-model="search" @input="goSearch()" label="0">未支付</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">已支付</el-radio>
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
      <el-table-column label="出库单号" prop="outbound_ID"></el-table-column>
      <el-table-column label="货物编号" width="150">
        <template slot-scope="scope">
          <el-tag size="mini" style="margin:2px" v-for="(item,index) in scope.row.storage_nums" :key="index">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" prop="price">
        <template slot-scope="scope">
          <span>￡{{parseFloat(scope.row.price/100).toFixed(2)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" prop="address"></el-table-column>
      <el-table-column label="用户编号" prop="user_id"></el-table-column>
      <el-table-column label="出库申请时间" prop="outbound_apply_time"></el-table-column>
      <el-table-column label="出库时间" prop="outbound_time"></el-table-column>
      <el-table-column label="出库方式" prop="outbound_type">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.outbound_type==0" type="success">普通出库</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_type==1" type="primary">退税出库</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退税材料" prop="material">
        <template slot-scope="scope" v-if="scope.row.outbound_type=='1'">
          <el-image class="material" v-for="(item,index) in scope.row.material.slice(0,1)" :key="index" :src="item" alt="" :preview-src-list="scope.row.material"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="outbound_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.outbound_status==0" type="success">待审核</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==1" type="info">已取消</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==2" type="info">已驳回</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==3" type="primary">待出库</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==4" type="warning">转运中</el-tag>
          <el-tag size="mini" v-if="scope.row.outbound_status==5" type="info">已完成</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row,0)"></el-link><br>
          <el-tag size="mini" v-if="scope.row.pay_status==0" type="warning">未支付</el-tag>
          <el-tag size="mini" v-if="scope.row.pay_status==1" type="success">已支付</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row,1)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="250">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            v-if="scope.row.amount==null&&scope.row.outbound_type==1"
            @click="handleTax(scope.$index, scope.row)">退税</el-button>
          <el-button
            size="mini"
            v-if="scope.row.outbound_status==0"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增出库信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <span>首先输入用户邮箱，在获取用户的库存信息之后，再选择出库的方式(普通/退税)</span>
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <!-- <el-form-item label="用户编号">
          <el-row>
            <el-col :span='18'>
              <el-input v-model="newOutput.user_id" @input="userStorage=[]"></el-input>
            </el-col>
            <el-col :span='1'>
              <el-button style="margin-left:20px" @click="_getUserStorage(newOutput.user_id)" size="mini">获取库存信息</el-button>
            </el-col>
          </el-row>
        </el-form-item> -->
        <el-form-item label="用户邮箱">
          <el-autocomplete
            class="inline-input"
            v-model="newOutput.email"
            size="small"
            :fetch-suggestions="querySearch2"
            placeholder="请输入用户邮箱···"
            style="width:100%"
            @input="userStorage=[];userAddress=[]"
            :trigger-on-focus="false"
            @select="handleSelect2"
          ></el-autocomplete>
          <!-- <el-input v-model="newOutput.email" @input="userStorage=[];userAddress=[]">
            <el-button slot="append" icon="el-icon-search" @click="_getUserStorage(newOutput.email)"></el-button>
          </el-input> -->
        </el-form-item>
        <el-form-item label="货品编号" v-if="userStorage.length>0">
          <el-select
            v-model="newOutput.storage_nums" 
            multiple 
            filterable
            default-first-option
            placeholder="请选择"
            style="width:100%"
            @change="selectChanged"
          >
            <el-option
              v-for="(item,index) in userStorage"
              :key="index"
              :label="item.storage_ID+' | '+item.description"
              :value="item.storage_ID">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址" v-if="userAddress.length>0">
          <el-select 
            v-model="newOutput.address"
            placeholder="请选择"
            style="width:100%">
            <el-option
              v-for="(item,index) in userAddress"
              :key="index"
              :label="item.user_name+' | '+item.addr+' | '+item.phone"
              :value="item.user_name+' | '+item.addr+' | '+item.phone">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出库费用(￡)" v-if="newOutput.storage_nums.length>0">
          <!-- <span>￡{{parseFloat(newOutput.price/100)}}</span> -->
          <!-- <el-input v-model="newOutput.price"></el-input> -->
          <el-input @input="priceFormat" :value="displayPrice"></el-input>
        </el-form-item>
        <el-form-item label="出库方式">
          <el-radio v-model="newOutput.outbound_type" label="0">普通出库</el-radio>
          <el-radio v-model="newOutput.outbound_type" label="1">退税出库</el-radio>
          <div style="color:#aaa" v-if="newOutput.outbound_type==='0'">之后无法申请选中商品的退税操作</div>
          <div style="color:#aaa" v-if="newOutput.outbound_type==1">请上传退税材料</div>
        </el-form-item>
        <el-form-item v-if="newOutput.outbound_type==1" label="退税材料">
          <el-upload
            ref="uploadImgOutputAdd"
            class="upload-demo"
            :on-change='handleChangeImgAdd'
            action="#"
            multiple
            accept="image/jpeg,image/gif,image/png"
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='出库状态修改' :visible.sync="dialogChangeVisible" :close-on-click-modal="false">
      <el-form v-if="changeType==0">
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">待审核</el-radio>
          <el-radio v-model="dialogChange" label="2">已驳回</el-radio>
          <el-radio v-model="dialogChange" label="3">待出库</el-radio>
          <el-radio v-model="dialogChange" label="4">转运中</el-radio>
          <el-radio v-model="dialogChange" label="5">已完成</el-radio>
        </el-form-item>
      </el-form>
      <el-form v-else>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">未支付</el-radio>
          <el-radio v-model="dialogChange" label="1">已支付</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改出库信息" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <span>首先输入用户邮箱，在获取用户的库存信息之后，再选择出库的方式(普通/退税)</span>
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <el-form-item label="用户邮箱">
          <el-input v-model="editOutput.email" disabled>
            <!-- <el-button slot="append" icon="el-icon-search" @click="_getUserStorage(editOutput.email)"></el-button> -->
          </el-input>
        </el-form-item>
        <el-form-item label="货品编号" v-if="userStorage.length>0">
          <el-select
            v-model="editOutput.storage_nums" 
            multiple 
            filterable
            default-first-option
            placeholder="请选择"
            style="width:100%"
            @change="selectChanged"
          >
            <el-option
              v-for="(item,index) in userStorage"
              :key="index"
              :label="item.storage_ID+' | '+item.description"
              :value="item.storage_ID">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址" v-if="userAddress.length>0">
          <el-select 
            v-model="editOutput.address"
            placeholder="请选择"
            style="width:100%">
            <el-option
              v-for="(item,index) in userAddress"
              :key="index"
              :label="item.user_name+' | '+item.addr+' | '+item.phone"
              :value="item.user_name+' | '+item.addr+' | '+item.phone">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出库费用">
          <!-- <span>￡{{parseFloat(editOutput.price/100)}}</span> -->
          <el-input @input="priceFormat2" :value="displayPrice2"></el-input>
        </el-form-item>
        <el-form-item label="出库方式">
          <el-radio v-model="editOutput.outbound_type" label="0">普通出库</el-radio>
          <el-radio v-model="editOutput.outbound_type" label="1">退税出库</el-radio>
          <div style="color:#aaa" v-if="editOutput.outbound_type==='0'">之后无法申请选中商品的退税操作</div>
          <div style="color:#aaa" v-if="editOutput.outbound_type==1">请上传退税材料</div>
          <div>
            <template v-if="(editOutput.outbound_type=='1')&&(editOutput.material.length!=0)">
              <div class="editImgBox" v-for="(item,index) in editOutput.material" :key="index">
                <el-image class="material" :src="item" alt="" :preview-src-list="editOutput.material"></el-image>
                <div class="boxDel" @click="editDelImg(index)">×</div>
              </div>
            </template>
          </div>
        </el-form-item>
        <el-form-item v-if="editOutput.outbound_type==1" label="退税材料">
          <el-upload
            ref="uploadImgOutputEdit"
            class="upload-demo"
            action="#"
            multiple
            accept="image/jpeg,image/gif,image/png"
            :on-change='handleChangeImgEdit'
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goEdit()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='退税通过' :visible.sync="dialogTaxVisible" :close-on-click-modal="false">
      <el-form size="mini">
        <el-form-item label="退税金额" v-if="taxItem">
          <!-- <el-input v-model="taxItem.amount" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input> -->
          <el-input @input="taxFormat" :value="displayTax"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTaxVisible = false">取 消</el-button>
        <el-button type="primary" @click="goTax()">确 定</el-button>
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
  import { getUserStorage,addOutput,delOutput,editOutput,getOutputList,changeOutput,changeOutputPay,filterOutput,filterStorage,addDrawback } from '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  import { payBalance } from '@/network/payment.js'
  import { getUserByEmail,getUserInfoById,getUser,getDrawbackFactor } from '@/network/user.js'
  import * as imageConversion from 'image-conversion';
  import { validateEmail } from '@/utils/validate.js';
  import { filterAddress } from '@/network/address.js'

  export default {
    name: "Transmit",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'outbound_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,

        dialogEditVisible: false,
        editOutput: {
          storage_nums: [],
          user_id: '',
          outbound_type: '',
          material: [],
          address: '',
          email: '',
          price: '',
        },
        
        dialogChangeVisible: false,
        changeType: null,
        dialogChange: '',
        oldRow: null,
        editStorages: [],

        newOutput: {
          storage_nums: [],
          user_id: '',
          outbound_type: '',
          material: [],
          address: '',
          email: '',
          price: '',
        },
        
        selectList: {},

        pageNum: null,
        currentPage: 1,
        interpret: {
          'outbound_ID': {name:'出库单号'},
          'user_id': {name:'用户ID'},
          'user_email': {name:'用户邮箱'},
          'outbound_type': {name:'出库方式'},
          'outbound_status': {name:'状态'},
          'pay_status': {name:'支付状态'},
          'code': {name:'转运码'},
        },
        userStorage: [],
        userAddress: [],
        displayPrice: null,
        displayPrice2: null,

        dialogTaxVisible: false,
        taxItem: null,
        displayTax: null,
      }
    },
    computed: {
      getStorage: function () {
        return []
      }
    },
    mounted() {
      getOutputList(0).then(res=>{
        let data1 = [];
        let items = res.data.data;
        
        items.map(item=>{
          data1.push({id: 'outbound_ID', key: 'outbound_ID',value: item.outbound_ID})
        })
        this.selectList.outbound_ID = data1;
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
          this._getList(this.currentPage);
        })
      })
    },
    methods:{
      querySearch(queryString, cb) {
        queryString = queryString.toString();

        if(this.filter=='outbound_ID') {
          let query = this.selectList.outbound_ID;
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
        }
      },
      handleSelect() {
        this.goSearch();
      },
      querySearch2(queryString, cb) {
        queryString = queryString.toString();
        let query = this.selectList.user_email;
        let results = queryString ? query.filter(this.createFilter(queryString)) :query;
        cb(results);
      },
      handleSelect2() {
        this._getUserStorage(this.newOutput.email);
      },
      createFilter(queryString) {
        return (item) => {
          return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
      },
      test() {
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
          filterOutput(filter,search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.outbounds_num);
              this.tableData = res.data.data;
              this.loading = false;
              for(let item in this.tableData) {
                this.tableData[item].storage_nums = this.tableData[item].storage_nums.split(',').map(item=>item.replace(/\"/g, "").replace(/\'/g, ""));
                this.tableData[item].material = this.tableData[item].material.split(',');
              }
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        } else {
          getOutputList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.outbounds_num);
              this.tableData = res.data.data;
              this.loading = false;
              for(let item in this.tableData) {
                this.tableData[item].storage_nums = this.tableData[item].storage_nums.split(',').map(item=>item.replace(/\"/g, "").replace(/\'/g, ""));
                this.tableData[item].material = this.tableData[item].material.split(',');
              }
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        this.userStorage = [];
        this.userAddress = [];
        this.newOutput = {
          storage_nums: [],
          user_id: '',
          outbound_type: '',
          material: [],
          address: '',
          price: 0,
          email: '',
        };
        this.dialogAddVisible = true;
      },
      goAdd() {
        let imgList = [];
        let imgNum = (this.$refs.uploadImgOutputAdd)?this.$refs.uploadImgOutputAdd.uploadFiles.length:0;
        if(this.newOutput.email=='') {
          this.$message({type: 'warning',message: '请填写用户邮箱'});
        } else if(this.newOutput.storage_nums.length==0) {
          this.$message({type: 'warning',message: '请选择货品编号'});
          // this._getUserStorage(this.newOutput.email);
        } else if(this.newOutput.address=='') {
          this.$message({type: 'warning',message: '请填写收货地址'});
        } else if(this.newOutput.outbound_type=='') {
          this.$message({type: 'warning',message: '请选择出库方式'});
        } else if(this.newOutput.outbound_type==1&&imgNum==0) {
          this.$message({type: 'warning',message: '请上传退税材料'});
        } else {
          if(this.newOutput.outbound_type==1) {
            while(this.$refs.uploadImgOutputAdd.uploadFiles.length!=0) {
              let file = this.$refs.uploadImgOutputAdd.uploadFiles.pop().raw;
              let fileName = new Date().getTime() + '-' +file.name;
              imageConversion.compress(file,0.6).then(res=>{
                let uploadFile = new File([res], fileName, {type: res.type});
                addCoverImg(uploadFile).then(res=>{
                  if(res.data.status=='201') {
                    imgList.push(res.data.cover_img_url);
                    if(imgList.length==imgNum) {
                      this.newOutput.material = imgList;
                      this.goDeploy('new')
                    }
                  } else {
                    this.$message({type: 'warning',message: '图片上传失败\n'+res.data.msg});
                  }
                })
              })
            }
          } else {
            this.goDeploy('new');
          }
        }
      },
      _getUserStorage(email) {
        this.newOutput.storage_nums = [];
        if(email=='') {
          this.$message({type: 'warning',message: '请输入用户注册邮箱地址'});
        } else {
          getUserByEmail(email).then(res=>{
            if(res.data.status=='200') {
              let user_id = res.data.user_ID;
              this.newOutput.user_id = user_id;
              getUserStorage(res.data.user_ID).then(res1=>{
                if(res1.data.status=='200') {
                  if(res1.data.data.length==0) {
                    this.$message({type: 'warning',message: '未查到该用户的库存信息'});
                  }
                  filterAddress(0,'user_id',user_id).then(res2=>{
                    if(res2.data.address_num=='0') {
                      this.$message({type: 'warning',message: '未查到该用户的地址信息'});
                    } else {
                      this.userStorage = res1.data.data;
                      this.userAddress = res2.data.data;
                      let defaultAddr = this.userAddress.filter(item=>item.default=='1');
                      this.newOutput.address = (defaultAddr.length==1)?defaultAddr[0].addr:this.userAddress[0].addr;
                    }
                  })
                } else {
                  this.$message({type: 'warning',message: '获取库存信息失败\n'+res.data.msg});
                }
              })
            } else {
              this.$message({type: 'warning',message: res.data.msg});
            } 
          })
        }
      },
      handleEdit(index,row) {
        this.loading = true;
        this.editOutput.user_id = row.user_id;
        this.editOutput.price = row.price;
        this.editOutput.outbound_ID = row.outbound_ID;
        this.editOutput.storage_nums = row.storage_nums;
        this.userStorage = row.storage_nums;
        this.editOutput.outbound_type = row.outbound_type;
        if(row.material[0]=='') {
          this.editOutput.material = []
        } else {
          this.editOutput.material = JSON.parse(JSON.stringify(row.material));
        }
        this.editOutput.address = row.address;
        
        getUserInfoById(row.user_id).then(res=>{
          this.editOutput.email = res.data.data.user_email;
          getUserStorage(row.user_id).then(res=>{
            if(res.data.status=='200') {
              this.userStorage = res.data.data;
              filterStorage('user_id',row.user_id,0).then(res=>{
                let data = res.data.data;
                for(let i=0;i<data.length;i++) {
                  if(this.editOutput.storage_nums.indexOf(data[i].storage_ID)!=-1) {
                    this.userStorage.push(data[i])
                  }
                }
                this.selectChanged(this.editOutput.storage_nums)
                filterAddress(0,'user_id',row.user_id).then(res=>{
                  this.userAddress = res.data.data;
                  this.loading = false;
                  this.dialogEditVisible = true;
                })
              })
            } else {
              this.$message({type: 'warning',message: '获取库存信息失败\n'+res.data.msg});
              this.loading = false;
            }
          })
        })
      },
      goEdit() {
        let imgList = this.editOutput.material;
        let imgNum = ((this.$refs.uploadImgOutputEdit)?this.$refs.uploadImgOutputEdit.uploadFiles.length:0)+this.editOutput.material.length;
        if(this.editOutput.email=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        } else if(this.editOutput.storage_nums.length==0) {
          this.$message({type: 'warning',message: '请选择货品编号'});
          this._getUserStorage(this.editOutput.email);
        } else if(this.editOutput.address=='') {
          this.$message({type: 'warning',message: '请填写收货地址'});
        } else if(this.editOutput.outbound_type=='') {
          this.$message({type: 'warning',message: '请选择出库方式'});
        } else if(this.editOutput.outbound_type==1&&imgNum==0) {
          this.$message({type: 'warning',message: '请上传退税材料'});
        } else {
          if(this.editOutput.outbound_type==1) {
            if(this.$refs.uploadImgOutputEdit.uploadFiles.length==0) {
              this.goDeploy('edit')
            } else {
              while(this.$refs.uploadImgOutputEdit.uploadFiles.length!=0) {
                let file = this.$refs.uploadImgOutputEdit.uploadFiles.pop().raw;
                let fileName = new Date().getTime() + '-' +file.name;
                imageConversion.compress(file,0.6).then(res=>{
                  let uploadFile = new File([res], fileName, {type: res.type});
                  addCoverImg(uploadFile).then(res=>{
                    if(res.data.status=='201') {
                      imgList.push(res.data.cover_img_url);
                      if(imgList.length==imgNum) {
                        this.editOutput.material = imgList;
                        this.goDeploy('edit')
                      }
                    } else {
                      this.$message({type: 'warning',message: '图片上传失败\n'+res.data.msg});
                    }
                  })
                })
              }
            }
          } else {
            this.editOutput.material = [];
            this.goDeploy('edit')
          }
        }
      },
      goDeploy(type) {
        if(type=='new') {
          addOutput(this.newOutput).then(res=>{
            if(res.data.status=='200') {
              this.dialogAddVisible = false;
              this.loading = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '添加成功'});
            } else {
              this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
            }
          })
        } else if(type=='edit') {
          editOutput(this.editOutput).then(res=>{
            if(res.data.status=='200') {
              this.dialogEditVisible = false;
              this.loading = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '修改成功'});
            } else {
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
          })
        }
      },
      editDelImg(index) {
        this.editOutput.material.splice(index,1);
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.outbound_ID +'的出库信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delOutput(row.outbound_ID).then(res=>{
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

      handleChangeImgAdd(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImgOutputAdd.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImgOutputAdd.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleChangeImgEdit(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImgOutputEdit.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImgOutputEdit.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleExceed() {
        this.$message({type: 'error',message: '请删除当前图片再上传其他图片!'});
      },

      handleChange(row,type) {
        this.dialogChange = (type==0)?row.outbound_status:row.pay_status;
        this.oldRow = row;
        this.changeType = type;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.oldRow.outbound_status!=this.dialogChange&&this.changeType==0) {
          changeOutput(this.oldRow.outbound_ID,this.dialogChange).then(res => {
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '状态修改成功'});
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.dialogChangeVisible = false;
            } else {
              this.$message({type: 'warning',message: '状态修改失败'});
            }
          })
        } else if(this.oldRow.pay_status!=this.dialogChange&&this.changeType==1) {
          changeOutputPay(this.oldRow.outbound_ID,this.dialogChange).then(res => {
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

      handlePay(row) {
        this.$confirm('此操作将为这条单号为：'+ row.outbound_ID +'的出库信息付款, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          payBalance({
            order_type: 'o',
            id: row.outbound_ID
          }).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '付款成功!'});
              this.currentPage = 1;
              this._getList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '付款失败'+res.data.msg});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消付款'});          
        });
      },
      handleRefuse(row) {
        this.$confirm('此操作将驳回这条单号为：'+ row.outbound_ID +'的出库信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          changeOutput(row.outbound_ID,3).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '驳回成功!'});
              this.currentPage = 1;
              this._getList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '驳回失败'+res.data.msg});
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
          this.$message({type: 'warning',message: '请输入搜索词'});
        } else {
          this.isSearch = true;
          this.searchWord = this.search;
          if(this.filter=='outbound_status') {
            if(this.search=='0') {
              this.searchWord = '待审核'
            } else if(this.search=='1') { 
              this.searchWord = '已取消'
            } else if(this.search=='2') { 
              this.searchWord = '已驳回'
            } else if(this.search=='3') { 
              this.searchWord = '待出库'
            } else if(this.search=='4') { 
              this.searchWord = '转运中'
            } else if(this.search=='5') { 
              this.searchWord = '已完成'
            }
          } else if(this.filter=='pay_status') {
            if(this.search=='0') {
              this.searchWord = '未支付'
            } else if(this.search=='1') { 
              this.searchWord = '已支付'
            }
          } else if(this.filter=='outbound_type') {
            if(this.search=='0') {
              this.searchWord = '普通出库'
            } else if(this.search=='1') { 
              this.searchWord = '退税出库'
            }
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
      selectChanged(value) {
        let data = this.userStorage;
        let weight = 0;
        data.filter(item=>value.indexOf(item.storage_ID)!=-1).map(item=>weight+=parseFloat(item.weight));
        weight = parseInt(weight/0.5);
        if(weight>59) {
          this.newOutput.price = 11800;
          this.editOutput.price = 11800;
        } else {
          this.newOutput.price = this.$store.state.expressPrice[weight]*100;
          this.editOutput.price = this.$store.state.expressPrice[weight]*100;
        }
        this.displayPrice = parseFloat(this.newOutput.price/100).toFixed(2);
        this.displayPrice2 = parseFloat(this.editOutput.price/100).toFixed(2);
      },
      priceFormat(target) {
        this.displayPrice = parseFloat(target).toFixed(2);
        this.newOutput.price = parseInt(target*100);
      },
      priceFormat2(target) {
        this.displayPrice2 = parseFloat(target).toFixed(2);
        this.editOutput.price = parseInt(target*100);
      },
      taxFormat(target) {
        this.displayTax = parseFloat(target).toFixed(2);
        this.taxItem.amount = parseInt(target*100);
      },

      handleTax(index,row) {
        this.taxItem = row;
        getDrawbackFactor(row.user_id).then(res=>{
          this.taxItem.drawback_factor = res.data.drawback_factor;
          this.displayTax = parseFloat(parseInt(this.taxItem.price) * parseInt(this.taxItem.drawback_factor) / 120).toFixed(2);
          this.taxItem.amount = this.displayTax * 100;
          this.dialogTaxVisible = true;
        })
      },
      goTax() {
        addDrawback({
          outbound_id: this.taxItem.outbound_ID,
          amount: this.taxItem.amount
        }).then(res=>{
          this.dialogTaxVisible = false;
          this.$message({type: 'success',message:'退税成功'})
          this.currentPage = 1;
          this._getList(this.currentPage);
        })
      }
    }
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
  .editImgBox {
    position: relative;
  }
  .material {
    width: 80px;
  }
  .editImgBox .material {
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