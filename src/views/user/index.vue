<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="用户编号" value="id"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="用户昵称" value="user_nickname"></el-option>
      <el-option label="转运码" value="code"></el-option>
      <el-option label="用户权限" value="user_right"></el-option>
    </el-select>
    <template v-if="filter=='user_right'">
      <el-radio v-model="search" @input="goSearch()" label="0">前台用户</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="1">后台用户</el-radio>
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
      <!-- <el-table-column
        type="selection"
        width="55"
      >
      </el-table-column> -->
      <el-table-column
        prop="uuid"
        label="uid">
      </el-table-column>
      <el-table-column
        label="用户">
        <template slot-scope="scope">
          <span>{{scope.row.id+'-'+scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="user_nickname"
        label="昵称"
        width="100">
      </el-table-column>
      <el-table-column
        prop="user_email"
        label="邮箱"
        width="150">
      </el-table-column>      
      <el-table-column
        width="150"
        prop="user_right"
        label="权限">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.user_right==-1" type="info">冻结</el-tag>
          <el-tag size="mini" v-if="scope.row.user_right==0" type="success">前台</el-tag>
          <el-tag size="mini" v-if="scope.row.user_right==1" type="warning">后台</el-tag>
          <el-button
            style="margin-left:10px"
            @click="handleEditRight(scope.$index, scope.row)"
            type="text"
            v-if="$store.state.user.right.indexOf('user_right_edit')!=-1"
            size="small">
            修改权限
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="permissions">
        <template slot-scope="scope">
          <span 
          style="background-color:#ecf5ff;color:#47a2ff;border-radius:5px;margin-left:5px;padding:5px;line-height:30px"
          v-for="(item,index) in scope.row.permissions" :key="index">
            {{ item | getPermission }}
          </span>
        </template>
      </el-table-column> -->
      <el-table-column label="option" width='300' align ='right'>
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="dialogAddVisible = true">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger" v-if="$store.state.user.right.indexOf('user_del')!=-1"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="新增用户" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form :model="dialogAdd" size="mini">
        <el-form-item label="昵称">
          <el-input v-model="dialogAdd.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogAdd.email"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="dialogAdd.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户信息编辑" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form label-width="100px" :model="dialogForm" size="mini">
        <el-form-item label="昵称">
          <el-input v-model="dialogForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="退税系数">
          <el-input @input="factorFormat" :value="displayFactor"></el-input>
        </el-form-item>
        <el-form-item label="权限" v-if="dialogForm.right==1">
          <el-select v-model="dialogForm.role_ID" placeholder="请选择" style="width:100%">
            <el-option
              v-for="item in roles"
              :key="item.role_ID"
              :label="item.name"
              :value="item.role_ID">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogForm.right==1&&dialogForm.role_ID=='0'">
          <el-checkbox-group v-model="dialogForm.permissions">
            <el-checkbox v-for="(item,index) in permissionList" :key="index" :label="item.value" style="width:25%">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户权限编辑" :visible.sync="dialogRightVisible" :close-on-click-modal="false">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogRight.right" label="-1">冻结</el-radio>
          <el-radio v-model="dialogRight.right" label="0">前台</el-radio>
          <el-radio v-model="dialogRight.right" label="1">后台</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRightVisible = false">取 消</el-button>
        <el-button type="primary" @click="goRightEdit()">确 定</el-button>
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
  import { getUser,editUserinfo,delUser,register,setUserRight,getUserRight,editUserRight,getDrawbackFactor } from '@/network/user.js'
  import { validateEmail } from '@/utils/validate.js'
  import { getRoleList } from '@/network/permission.js'
  export default {
    name: "User",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'id',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        currentPage: 1,
        tableData: [],
        multipleSelection: [],
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
          {value:'agency_change',name:'代购订单状态'},
          {value:'agency_pay',name:'代购订单支付'},
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
        dialogAddVisible: false,
        dialogAdd: {nickname:'',email:'',password:''},
        dialogFormVisible: false,
        dialogForm: {nickname:'',email:'',right:'',permissions:[],factor:'',role_ID:''},
        dialogRightVisible: false,
        dialogRight: {uuid:'',nickname:'',email:'',right:''},
        oldUser: null,
        pageNum: null,
        displayFactor: null,
        roles: [],
        user_right: null,
        selectList: [],

        interpret: {
          'id': {name:'用户编号'},
          'user_email': {name:'用户邮箱'},
          'user_nickname': {name:'用户昵称'},
          'code': {name:'转运码'},
          'user_right': {name:'用户权限'}
        },
      }
    },
    mounted() {
      getRoleList(0).then(res=>{
        let data = res.data.data;
        this.roles = data;
        this.roles.push({name:'自定义',role_ID:'0'})
      })
      this._getUser(this.currentPage);
    },
    methods:{
      defaultData() {
        getUser(0).then(res=>{
          console.log(res);
          let users = res.data.data;
          this.selectList.id = [];
          this.selectList.user_email = [];
          this.selectList.user_nickname = [];
          this.selectList.code = [];
          users.map(item=>{
            this.selectList.id.push({id: 'id', key: 'id',value: item.id})
            this.selectList.user_email.push({id: 'user_email', key: 'user_email',value: item.user_email})
            this.selectList.user_nickname.push({id: 'user_nickname', key: 'user_nickname',value: item.user_user_nickname})
            this.selectList.code.push({id: 'code', key: 'code',value: item.user_code})
          })
          this.loading = false;
        })
      },
      _getUser(currentPage) {
        this.defaultData();        
        this.loading = true;
        getUser(currentPage).then(res=>{
          if(res.data.status=='200') {
            this.pageNum = parseInt(res.data.users_num);
            this.tableData = res.data.data;
            this.loading = false;
          } else {
            this.$message({type: 'error',message: res.data.msg})
          }      
          this.loading = false;
        })
      },
      factorFormat(target) {
        if(target=='') {
          this.displayFactor = 0
          this.dialogForm.factor = 0
        } else {
          this.displayFactor = parseFloat(target).toFixed(2);
          this.dialogForm.factor = parseFloat(target).toFixed(2);
        }
      },
      handleEdit(index, row) {
        this.user_right = row.user_right;
        if(row.user_right==1) {
          getUserRight(row.uuid).then(res=>{
            this.dialogForm.permissions = [];
            let pms = res.data.data;
            this.dialogForm.role_ID = pms.role_ID;
            for(let item in pms) {
              if(item!='uuid'&&item!='role_ID'&&item!='id'&&pms[item]=='1') {
                this.dialogForm.permissions.push(item)
              }
            }
            getDrawbackFactor(row.id).then(res=>{
              this.dialogForm.uuid = this.tableData[index].uuid;
              this.dialogForm.nickname = this.tableData[index].user_nickname;
              this.dialogForm.email = this.tableData[index].user_email;
              this.dialogForm.right = this.tableData[index].user_right;
              this.displayFactor = parseFloat(res.data.drawback_factor).toFixed(2);
              this.dialogForm.factor = parseFloat(res.data.drawback_factor).toFixed(2);
              this.dialogFormVisible = true;
            })
          })
        } else {          
          getDrawbackFactor(row.id).then(res=>{
            this.dialogForm.uuid = this.tableData[index].uuid;
            this.dialogForm.nickname = this.tableData[index].user_nickname;
            this.dialogForm.email = this.tableData[index].user_email;
            this.dialogForm.right = this.tableData[index].user_right;
            this.displayFactor = parseFloat(res.data.drawback_factor).toFixed(2);
            this.dialogForm.factor = parseFloat(res.data.drawback_factor).toFixed(2);
            this.dialogFormVisible = true;
          })
        }
      },
      goEdit() {
        if(this.dialogForm.nickname=='') {
          this.$message({type: 'warning',message: '昵称不能为空'});
        }else if(this.dialogForm.nickname.length<2) {
          this.$message({type: 'warning',message: '昵称最短2位'});
        }else if(this.dialogForm.nickname.length>20) {
          this.$message({type: 'warning',message: '昵称最长20位'});
        }else if(validateEmail(this.dialogForm.email)==false) {
          this.$message({type: 'warning',message: '邮箱不符合规范'});
        }else{
          this.loading = true;
          editUserinfo(this.dialogForm).then(res1=>{
            for(let item in this.permissionDict) {
              if(this.dialogForm.permissions.indexOf(item)!=-1) {
                this.permissionDict[item] = 1;
              } else {
                this.permissionDict[item] = 0;
              }
            }
            this.permissionDict.role_ID = parseInt(this.dialogForm.role_ID)
            if(this.user_right==1) {
              editUserRight(this.dialogForm.uuid.toString(),this.permissionDict).then(res2=>{
                if(res1.data.status=='403'&&res2.data.status=='403') {
                  this.$message({type:'warning',message:'未做任何改变'})
                } else {
                  this.$message({type:'success',message:'修改成功'})
                  this.dialogFormVisible = false;
                  this.currentPage = 1;
                  this._getUser(this.currentPage)
                }
                this.loading = false;
              })
            } else {
              if(res1.data.status=='403') {
                this.$message({type:'warning',message:'未做任何改变'})
              } else {
                this.$message({type:'success',message:'修改成功'})
                this.dialogFormVisible = false;
                this.currentPage = 1;
                this._getUser(this.currentPage)
              }
              this.loading = false;
            }
          })
        }
      },
      goAdd() {
        if(this.dialogAdd.nickname=='') {
          this.$message({type: 'warning',message: '昵称不能为空'});
        }else if(this.dialogAdd.nickname.length<2) {
          this.$message({type: 'warning',message: '昵称最短2位'});
        }else if(this.dialogAdd.nickname.length>20) {
          this.$message({type: 'warning',message: '昵称最长20位'});
        }else if(validateEmail(this.dialogAdd.email)==false) {
          this.$message({type: 'warning',message: '邮箱不符合规范'});
        }else if(this.dialogAdd.password.length<6) {
          this.$message({type: 'warning',message: '密码最短6位'});
        }else if(this.dialogAdd.password.length>40) {
          this.$message({type: 'warning',message: '密码最长40位'});
        }else{
          this.loading = true;
          register(this.dialogAdd).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '新增成功!'});
              this.dialogAdd = {nickname:'',email:'',password:''},
              this.dialogAddVisible = false;
            }else{
              this.$message({type: 'warning',message: '新增失败——'+res.data.msg});
            }          
            this.currentPage = 1;
            this._getUser(this.currentPage)
            this.loading = false;
          })
        }
      },
      handleDelete(index, row) {
        this.$confirm('此操作将永久删除用户：'+ row.user_nickname +', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          delUser(row.uuid).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
            this.currentPage = 1;
            this._getUser(this.currentPage)
            this.loading = false;
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      handleEditRight(index, row) {
        this.dialogRightVisible = true;
        this.dialogRight.uuid = this.tableData[index].uuid;
        this.dialogRight.right = this.tableData[index].user_right;
        this.oldUser = this.tableData[index];
      },
      goRightEdit() {
        if(this.dialogRight.right == this.oldUser.user_right) {
          this.$message({type: 'warning',message: '权限未变动'});
        } else {
          setUserRight(this.oldUser.uuid,parseInt(this.dialogRight.right)).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '权限修改成功!'});
              this.dialogRightVisible = false;
            }else{
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
            this.currentPage = 1;
            this._getUser(this.currentPage)
          })
        }
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.userTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.userTable.clearSelection();
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleCurrentChange() {
        this._getUser(this.currentPage)
      },
      goSearch() {
        if(this.search==''||this.search==null) {
          this.$message({type:'warning',message:'请输入搜索词'})
        } else {
          this.isSearch = true;
          this.searchWord = this.search;
          if(this.filter=='user_right') {
            if(this.search=='0') {
              this.searchWord = '前台用户'
            } else if(this.search=='1') { 
              this.searchWord = '后台用户'
            }
          } else {
            this.searchWord = this.search;
          }
          this.filterWord = this.interpret[this.filter].name;
          this.loading = true;
          this.currentPage = 1;
          this._getUser(this.currentPage)
        }
      },
      goBack() {
        this.isSearch=false;
        this.search=null;
        this.currentPage = 1;
        this._getUser(this.currentPage)
      },
      filterChange() {
        this.search = '';
      },
      
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        if(this.filter=='id') {
          let query = this.selectList.id;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_id') {
          let query = this.selectList.user_id;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_email') {
          let query = this.selectList.user_email;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_nickname') {
          let query = this.selectList.user_nickname;
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
</style>