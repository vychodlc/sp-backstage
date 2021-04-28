<template>
  <div>
    <el-table
    v-loading="loading"
    ref="userTable"
    :data="tableData.filter(data => !search || data.user_nickname.toLowerCase().includes(search.toLowerCase()))"
    style="width: 100%"
    height="80vh"
    @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55"
      >
      </el-table-column>
      <el-table-column
        prop="uuid"
        label="uid">
      </el-table-column>
      <el-table-column
        prop="user_nickname"
        label="nickname"
        width="100">
      </el-table-column>
      <el-table-column
        prop="user_email"
        label="email"
        width="150">
      </el-table-column>      
      <el-table-column
        width="100"
        prop="user_right"
        label="right">
        <template slot-scope="scope">
          {{scope.row.user_right}}
          <el-button
            style="margin-left:10px"
            @click="handleEditRight(scope.$index, scope.row)"
            type="text"
            size="small">
            修改权限
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="permissions">
        <template slot-scope="scope">
          <span 
          style="background-color:#ecf5ff;color:#47a2ff;border-radius:5px;margin-left:5px;padding:5px;line-height:30px"
          v-for="(item,index) in scope.row.permissions" :key="index">
            {{ item | getPermission }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="option" width='300' align ='right'>
        <template slot="header">
          <el-input
            style="width:200px;margin-right:10px"
            v-model="search"
            size="mini"
            placeholder="输入NICKNAME进行搜索"/>
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
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="新增用户" :visible.sync="dialogAddVisible">
      <el-form :model="dialogAdd">
        <el-form-item label="nickname">
          <el-input v-model="dialogAdd.nickname"></el-input>
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="dialogAdd.email"></el-input>
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="dialogAdd.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户信息编辑" :visible.sync="dialogFormVisible">
      <el-form :model="dialogForm">
        <el-form-item label="nickname">
          <el-input v-model="dialogForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户权限编辑" :visible.sync="dialogRightVisible">
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
  </div>
</template>

<script>
  import { getUser,editUserinfo,delUser,register,setUserRight } from '@/network/user.js'
  import { validateEmail } from '@/utils/validate.js'
  export default {
    name: "User",
    data () {
      return {
        loading: true,
        tableData: [],
        multipleSelection: [],
        search: '',
        permissionList: [
          "文章简单查看",
          "文章高级查看",
          "文章创建&编辑",
          "文章删除",
          "文章审稿",
          "Tag页面查看",
          "Tag创建",
          "Tag删除",
          "仓库页面查看",
          "仓库添加记录",
          "仓库删除记录",
          "仓库编辑记录",
          "仓库出库",
          "仓库退税查看",
          "仓库退税审核",
          "银行卡页面查看",
          "银行卡页面修改",
          "银行卡页面审核",
          "用户页面查看",
          "APP用户信息查看",
          "APP用户注册权限分配",
          "APP用户信息修改",
          "后台用户信息查看",
          "后台用户信息修改",
          "后台用户权限分配",
          "后台用户组设置",
        ],
        dialogAddVisible: false,
        dialogAdd: {nickname:'',email:'',password:''},
        dialogFormVisible: false,
        dialogForm: {uuid:'',nickname:'',email:'',right:''},
        dialogRightVisible: false,
        dialogRight: {uuid:'',nickname:'',email:'',right:''},
        oldUser: null,
      }
    },
    filters: {
      getPermission(index) {
        let permissionList = [
          "文章简单查看",
          "文章高级查看",
          "文章创建&编辑",
          "文章删除",
          "文章审稿",
          "Tag页面查看",
          "Tag创建",
          "Tag删除",
          "仓库页面查看",
          "仓库添加记录",
          "仓库删除记录",
          "仓库编辑记录",
          "仓库出库",
          "仓库退税查看",
          "仓库退税审核",
          "银行卡页面查看",
          "银行卡页面修改",
          "银行卡页面审核",
          "用户页面查看",
          "APP用户信息查看",
          "APP用户注册权限分配",
          "APP用户信息修改",
          "后台用户信息查看",
          "后台用户信息修改",
          "后台用户权限分配",
          "后台用户组设置",
        ];
        return permissionList[index-1]
      }
    },
    mounted() {
      this._getUser()
    },
    methods:{
      _getUser() {
        getUser().then(res=>{
          this.tableData = res.data.data;
          this.loading = false;
        })
      },
      handleEdit(index, row) {
        this.dialogFormVisible = true;
        this.dialogForm.uuid = this.tableData[index].uuid;
        this.dialogForm.nickname = this.tableData[index].user_nickname;
        this.dialogForm.email = this.tableData[index].user_email;
        this.dialogForm.right = this.tableData[index].user_right;
        // this.dialogForm.permissions = this.tableData[index].user_permissions;
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
          editUserinfo(this.dialogForm).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '修改成功!'});
              this.dialogFormVisible = false;
              this._getUser();
            }else{
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }          
            this.loading = false;
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
              this._getUser();
            }else{
              this.$message({type: 'warning',message: '新增失败——'+res.data.msg});
            }          
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
              this._getUser();
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
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
              this._getUser();
            }else{
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
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
      }
    }
  }
</script>

<style scoped>
  
</style>