<template>
  <div class="post-container">
    <!-- <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="详细地址" value="addr"></el-option>
      <el-option label="地址编号" value="option_ID"></el-option>
      <el-option label="地址种类" value="default"></el-option>
      <el-option label="用户ID" value="user_id"></el-option>
      <el-option label="uuid" value="uuid"></el-option>
      <el-option label="邮箱地址" value="email"></el-option>
      <el-option label="收货人" value="user_name"></el-option>
      <el-option label="手机号" value="phone"></el-option>
    </el-select>
    <template v-if="this.filter=='default'">
      <el-radio v-model="search" label="0">默认地址</el-radio>
      <el-radio v-model="search" label="1">普通地址</el-radio>
    </template>
    <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input>
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag> -->
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;max-height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="编号" prop="option_ID"></el-table-column>
      <el-table-column label="参数名称" prop="option"></el-table-column>
      <el-table-column label="参数值" prop="value"></el-table-column>
      <el-table-column label="描述信息" prop="description"></el-table-column>
      <el-table-column label="操作时间" prop="edit_time"></el-table-column>
      <el-table-column label="操作" align="right" width="200">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="dialogAddVisible=true;newItem={user_id:'',addr:''};">新增</el-button>
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
    
    <el-dialog title="新增参数信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form size="mini">
        <el-form-item label="参数名称">
          <el-input v-model="newItem.option"></el-input>
        </el-form-item>
        <el-form-item label="参数值">
          <el-input v-model="newItem.value"></el-input>
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input v-model="newItem.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改地址信息" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form size="mini">
        <el-form-item label="参数名称">
          <el-input v-model="editItem.option" disabled></el-input>
        </el-form-item>
        <el-form-item label="参数值">
          <el-input v-model="editItem.value"></el-input>
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input v-model="editItem.description"></el-input>
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
  import { addOption,getOption,editOption,delOption } from '@/network/option.js'
  export default {
    name: "Option",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'option_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],

        dialogAddVisible: false,
        newItem: {option: '',value: '',description: ''},

        dialogEditVisible: false,
        editItem: {option_ID: '',option: '',value: '',description: ''},

        pageNum: null,
        currentPage: 1,
        interpret: {
          'addr': {name:'详细地址'},
          'option_ID': {name:'参数编号'},
          'default': {name:'地址种类'},
          'user_id': {name:'用户ID'},
          'uuid': {name:'uuid'},
          'email': {name:'邮箱地址'},
          'user_name': {name:'收货人'},
          'phone': {name:'手机号'},
        }
      }
    },
    mounted() {
      this._getList(this.currentPage);
    },
    methods:{
      _getList(pageIndex) {
        this.loading = true;
        if(this.isSearch==true) {
          if(this.filter=='addr') {
            searchAddress(pageIndex,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.address_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }      
              this.loading = false;
            });
          } else {
            (pageIndex,this.filter,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.address_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {filterAddress
                this.$message({type: 'error',message: res.data.msg})
              }      
              this.loading = false;
            });
          }
        } else {
          getOption(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.options_num);
              this.tableData = res.data.data;
              this.tableData.map(item=>{
                item.description = item.description=='undefined'?'':item.description;
              })
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        }
      },
      handleAdd() {
        this.newItem = {option: '',value: '',description: ''};
        this.dialogAddVisible = true
      },
      goAdd() {
        if(this.newItem.option=='') {
          this.$message({type: 'warning',message: '请填写参数名称'});
        } else if(this.newItem.value=='') {
          this.$message({type: 'warning',message: '请填写参数值'});
        } else {
          addOption(this.newItem).then(res=>{
            if(res.data.status=='200') {
              this.dialogAddVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '添加成功'});
              this.newItem = {option: '',value: '',description: ''};
            } else {
              this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
            }
          })
        }
      },
      handleEdit(index,row) {
        this.editItem.option_ID = row.option_ID;
        this.editItem.value = row.value;
        this.editItem.description = row.description;
        this.editItem.option = row.option;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editItem.value=='') {
          this.$message({type: 'warning',message: '请填写参数值'});
        } else {
          editOption(this.editItem).then(res=>{
            if(res.data.status=='200') {
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '修改成功'});
            } else {
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
          })
        }       
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.option_ID +'的参数信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delOption(row.option_ID).then(res=>{
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
        this.searchWord = this.search;
        if(this.filter=='default') {
          if(this.search=='0') {
            this.searchWord = '普通地址'
          } else if(this.search=='1') { 
            this.searchWord = '默认地址'
          }
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
</style>