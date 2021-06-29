<template>
  <div class="post-container">
    <el-table
    v-loading="loading"
    ref="userTable"
    :data="tableData.filter(data => !search || data.user_nickname.toLowerCase().includes(search.toLowerCase()))"
    class="elTable"
    style="width: 100%;height: calc(100vh - 110px);overflow-y:scroll"
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
    <el-dialog title="用户信息编辑" :visible.sync="dialogFormVisible">
      <el-form label-width="100px" :model="dialogForm" size="mini">
        <el-form-item label="昵称">
          <el-input v-model="dialogForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="权限" v-if="dialogForm.right==1">
          <el-checkbox-group v-model="dialogForm.permissions">
            <el-checkbox v-for="(item,index) in permissionList" :key="index" :label="item" style="width:20%"></el-checkbox>
          </el-checkbox-group>
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
  import { getUser,editUserinfo,delUser,register,setUserRight,getUserRight,editUserRight } from '@/network/user.js'
  import { validateEmail } from '@/utils/validate.js'
  export default {
    name: "User",
    data () {
      return {
        currentPage: 1,
        loading: true,
        tableData: [],
        multipleSelection: [],
        search: '',
        permissionList: [
          'post_page',
          'post_page_all',
          'post_edit',
          'post_delete',
          'post_audit',
          'tag_page',
          'tag_add',
          'tag_edit',
          'tag_del',
          'repo_page',
          'repo_add',
          'repo_edit',
          'repo_del',
          'repo_page',
          'repo_out',
          'tax_page',
          'tax_audit',
          'card_page',
          'card_edit',
          'card_audit',
          'user_page',
          'a_user_page',
          'a_user_audit',
          'a_user_edit',
          'b_user_page',
          'b_user_audit',
          'b_user_edit',
          'user_group',
          'user_block',
          'system_set',
        ],
        permissionDict: {
          'post_page':0,
          'post_page_all':0,
          'post_edit':0,
          'post_delete':0,
          'post_audit':0,
          'tag_page':0,
          'tag_add':0,
          'tag_edit':0,
          'tag_del':0,
          'repo_page':0,
          'repo_add':0,
          'repo_edit':0,
          'repo_del':0,
          'repo_page':0,
          'repo_out':0,
          'tax_page':0,
          'tax_audit':0,
          'card_page':0,
          'card_edit':0,
          'card_audit':0,
          'user_page':0,
          'a_user_page':0,
          'a_user_audit':0,
          'a_user_edit':0,
          'b_user_page':0,
          'b_user_audit':0,
          'b_user_edit':0,
          'user_group':0,
          'user_block':0,
          'system_set':0,
        },
        dialogAddVisible: false,
        dialogAdd: {nickname:'',email:'',password:''},
        dialogFormVisible: false,
        dialogForm: {nickname:'',email:'',right:'',permissions:[]},
        dialogRightVisible: false,
        dialogRight: {uuid:'',nickname:'',email:'',right:''},
        oldUser: null,
        pageNum: null,
      }
    },
    mounted() {
      getUser(0).then(res=>{
        this.pageNum = parseInt(res.data.data.length);
        this.currentPage = 1;
        this._getUser(this.currentPage)
      })
    },
    methods:{
      _getUser(currentPage) {
        getUser(currentPage).then(res=>{
          this.tableData = res.data.data;
          this.loading = false;
        })
      },
      handleEdit(index, row) {
        if(row.user_right==1) {
          getUserRight(row.uuid).then(res=>{
            this.dialogForm.permissions = [];
            let pms = res.data.data;
            for(let item in pms) {
              if(item!='uuid'&&item!='role_ID'&&item!='id'&&pms[item]=='1') {
                this.dialogForm.permissions.push(item)
              }
            }
            this.dialogFormVisible = true;
            this.dialogForm.uuid = this.tableData[index].uuid;
            this.dialogForm.nickname = this.tableData[index].user_nickname;
            this.dialogForm.email = this.tableData[index].user_email;
            this.dialogForm.right = this.tableData[index].user_right;
          })
        } else {
          this.dialogFormVisible = true;
          this.dialogForm.uuid = this.tableData[index].uuid;
          this.dialogForm.nickname = this.tableData[index].user_nickname;
          this.dialogForm.email = this.tableData[index].user_email;
          this.dialogForm.right = this.tableData[index].user_right;
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
        this._getList(this.currentPage)
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