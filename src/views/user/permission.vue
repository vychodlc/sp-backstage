<template>
  <div class="post-container">
    <!-- <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
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
    ></el-autocomplete> -->
    <!-- <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input> -->
    <!-- <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag> -->
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="编号" prop="role_ID"></el-table-column>
      <el-table-column label="用户组名称" prop="name"></el-table-column>
      <el-table-column label="描述信息" prop="description"></el-table-column>
      <el-table-column label="编辑时间" prop="edit_time"></el-table-column>
      <el-table-column label="编辑人" prop="edit_user"></el-table-column>
      <el-table-column label="操作" align="right" width="150" v-if="$store.state.user.right.indexOf('permission_edit')!=-1||$store.state.user.right.indexOf('permission_del')!=-1">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini" v-if="$store.state.user.right.indexOf('permission_edit')!=-1"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini" v-if="$store.state.user.right.indexOf('permission_del')!=-1"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增用户组信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form label-width="100px" size="mini">
        <el-form-item label="名称">
          <el-input v-model="newItem.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newItem.description"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="newItem.permissions">
            <el-checkbox v-for="(item,index) in permissionList" :key="index" :label="item.value" style="width:25%">{{item.name}}</el-checkbox>
          </el-checkbox-group>
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
    <el-dialog title="修改用户组信息" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <span>首先输入用户邮箱，在获取用户的库存信息之后，再选择出库的方式(普通/退税)</span>
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <el-form-item label="名称">
          <el-input v-model="editItem.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editItem.description"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="editItem.permissions">
            <el-checkbox v-for="(item,index) in permissionList" :key="index" :label="item.value" style="width:25%">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goEdit()" size="mini">确 定</el-button>
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
  import { getUserStorage,addOutput,delOutput,editOutput,getOutputList,changeOutput,changeOutputPay,filterOutput,filterStorage } from '@/network/transship.js'
  import { getRoleList,addRole,editRole,delRole } from '@/network/permission.js'
  import { getUserByEmail,getUserInfoById,getUser,getUserRight } from '@/network/user.js'

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

        newItem: {
          name: '',description: '',permissions: [],
        },
        editItem: {
          name: '',description: '',permissions: [],
        },
        
        permissionList: [
          {value:'post_page',name:'文章页面查看'},
          {value:'post_page_all',name:'文章查看（所有人）'},
          {value:'post_edit',name:'文章创建&编辑'},
          {value:'post_del',name:'文章删除'},
          {value:'post_audit',name:'文章审稿'},
          {value:'tag_page',name:'Tag页面查看'},
          {value:'tag_add',name:'Tag创建'},
          {value:'tag_edit',name:'Tag编辑'},
          {value:'tag_del',name:'Tag删除'},
          {value:'repo_page',name:'仓库页面查看'},
          {value:'repo_add',name:'仓库添加记录'},
          {value:'repo_edit',name:'仓库编辑记录'},
          {value:'repo_del',name:'仓库删除记录'},
          {value:'repo_out_page',name:'仓库出库页面查看'},
          {value:'repo_out_edit',name:'仓库出库编辑'},
          {value:'repo_out_change',name:'仓库出库改状态'},
          {value:'repo_out_pay',name:'仓库出库支付'},
          {value:'tax_page',name:'仓库退税查看'},
          {value:'tax_audit',name:'仓库退税审核'},
          {value:'card_page',name:'银行卡&申请页面查看'},
          {value:'card_edit',name:'银行卡页面修改'},
          {value:'card_audit',name:'银行卡申请页面修改审核'},
          {value:'user_page',name:'用户管理页面查看'},
          {value:'user_right_edit',name:'用户信息/权限编辑 * '},
          {value:'user_del',name:'用户删除 * '},
          {value:'permission_page',name:'权限管理界面查看 * '},
          {value:'permission_edit',name:'权限管理-新增/编辑 * '},
          {value:'permission_del',name:'权限管理-删除 * '},
          {value:'address_page',name:'地址管理查看'},
          {value:'address_edit',name:'地址编辑'},
          {value:'address_del',name:'地址删除'},
          {value:'factor_page',name:'代购参数管理查看'},
          {value:'factor_edit',name:'代购参数管理修改'},
          {value:'charge_page',name:'充值页面查看'},
          {value:'charge_edit',name:'充值页面修改'},
          {value:'agency_page',name:'代购订单查看'},
          {value:'agency_edit',name:'代购订单编辑'},
          {value:"agency_change",name:'代购状态修改'},
          {value:"agency_pay",name:'代购付款'},
          {value:'discount_page',name:'代购折扣码查看'},
          {value:'discount_edit',name:'代购折扣码修改'},
          {value:'account_page',name:'代购账户查看'},
          {value:'account_edit',name:'代购账户修改'},
          {value:'giftcard_page',name:'代购礼品卡查看'},
          {value:'giftcard_edit',name:'代购礼品卡修改'},
          {value:'withdraw_page',name:'提现页面查看'},
          {value:'withdraw_edit',name:'提现页面修改&审核'},
          {value:'payment_page',name:'流水记录页面查看'},
        ],
        permissionDict: {
          "post_page": "0",
          "post_page_all": "1",
          "post_edit": "0",
          "post_del": "0",
          "post_audit": "1",
          "tag_page": "1",
          "tag_add": "1",
          "tag_edit": "0",
          "tag_del": "0",
          "repo_page": "1",
          "repo_add": "1",
          "repo_edit": "0",
          "repo_del": "1",
          "repo_out_page": "0",
          "repo_out_edit": "0",
          "repo_out_change": "0",
          "repo_out_pay": "0",
          "tax_page": "1",
          "tax_audit": "1",
          "card_page": "0",
          "card_edit": "0",
          "card_audit": "1",
          "user_page": "1",
          "user_right_edit": "0",
          "user_del": "0",
          "permission_page": "0",
          "permission_edit": "0",
          "permission_del": "0",
          "address_page": "0",
          "address_edit": "0",
          "address_del": "0",
          "factor_page": "0",
          "factor_edit": "0",
          "charge_page": "0",
          "charge_edit": "0",
          "agency_page": "0",
          "agency_edit": "0",
          "agency_change": "0",
          "agency_pay": "0",
          "discount_page": "0",
          "discount_edit": "0",
          "account_page": "0",
          "account_edit": "0",
          "giftcard_page": "0",
          "giftcard_edit": "0",
          "withdraw_page": "0",
          "withdraw_edit": "0",
          "payment_page": "0"
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
      }
    },
    computed: {
      getStorage: function () {
        return []
      }
    },
    mounted() {
      this.currentPage = 1;
      this._getList(this.currentPage);
      // getRoleList(0).then(res=>{
      //   let data1 = [];
      //   let items = res.data.data;
        
      //   items.map(item=>{
      //     data1.push({id: 'outbound_ID', key: 'outbound_ID',value: item.outbound_ID})
      //   })
      //   this.selectList.outbound_ID = data1;
      //   getUser(0).then(res=>{
      //     let users = res.data.data;
      //     let emails = [],ids = [],codes = [];
      //     users.map(user=>{
      //       emails.push({id: user.id, key: 'user_email',value: user.user_email})
      //       ids.push({id: user.id, key: 'id',value: user.id})
      //       codes.push({id: user.id, key: 'code',value: user.code})
      //     })
      //     this.selectList.user_email = emails;
      //     this.selectList.user_id = ids;
      //     this.selectList.code = codes;
      //     this.loading = false;
      //     this._getList(this.currentPage);
      //   })
      // })
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
        } else {
          getRoleList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.roles_num);
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
        this.newItem = {name: '',description: '',permissions: []};
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.name == '') {
          this.$message({type: 'warning',message: '请输入用户组名称'});
        } else if(this.newItem.description == '') {
          this.$message({type: 'warning',message: '请输入用户组描述'});
        } else if(this.newItem.permissions.length == 0) {
          this.$message({type: 'warning',message: '请选择用户权限'});
        } else {
          for(let item in this.permissionDict) {
            if(this.newItem.permissions.indexOf(item)!=-1) {
              this.permissionDict[item] = 1
            } else {
              this.permissionDict[item] = 0
            }
          }
          console.log(this.permissionDict);
          addRole(this.newItem.name,this.newItem.description,this.permissionDict).then(res=>{
            console.log(res.data);
            if(res.data.status=='200') {
              this.$message({type:'success',message:'添加成功'})
            } else {
              this.$message({type:'warning',message:'添加失败'+res.data.msg})
            }
            this.dialogAddVisible = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          })
        }
      },
      handleEdit(index,row) {
        this.editItem = {role_ID:row.role_ID,name:row.name,description:row.description,permissions:[]};
        let pms = row;
        for(let item in pms) {
          if(item!='name'&&item!='role_ID'&&item!='edit_time'&&item!='edit_user'&&pms[item]=='1') {
            this.editItem.permissions.push(item)
          }
        }
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editItem.name == '') {
          this.$message({type: 'warning',message: '请输入用户组名称'});
        } else if(this.editItem.description == '') {
          this.$message({type: 'warning',message: '请输入用户组描述'});
        } else if(this.editItem.permissions.length == 0) {
          this.$message({type: 'warning',message: '请选择用户权限'});
        } else {
          for(let item in this.permissionDict) {
            if(this.editItem.permissions.indexOf(item)!=-1) {
              this.permissionDict[item] = 1
            } else {
              this.permissionDict[item] = 0
            }
          }
          editRole(this.editItem.role_ID,this.permissionDict,this.editItem.name,this.editItem.description).then(res=>{
            if(res.data.status=='200') {
              this.$message({type:'success',message:'修改成功'})
            } else {
              this.$message({type:'warning',message:'修改失败'})
            }
            this.dialogEditVisible = false;
            this.currentPage = 1;
            this._getList(this.currentPage);
          })
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
        this.$confirm('此操作将永久删除这条名称为：'+ row.name +'的用户组, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delRole(row.role_ID).then(res=>{
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