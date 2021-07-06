<template>
  <div>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column
        label="标签编号"
        prop="id">
      </el-table-column>
      <el-table-column
        label="标签名称"
        prop="name">
      </el-table-column>
      <!-- <el-table-column
        label="标签所属文章数"
        prop="posts">
      </el-table-column> -->
      <el-table-column label="操作" align="right">
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
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增标签" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form>
        <el-form-item label="标签名称">
          <el-input v-model="newTag" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑标签" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form>
        <el-form-item label="标签原名称">
          <el-input v-model="changedTag.oldname" disabled></el-input>
        </el-form-item>
        <el-form-item label="标签新名称">
          <el-input v-model="changedTag.newname" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getTag,addTag,delTag,editTag } from '@/network/tag.js'
  export default {
    name: "Tag",
    data () {
      return {
        loading: true,
        tableData: [],
        newTag: '',
        dialogAddVisible: false,
        changedTag: {
          id: '',
          oldname: '',
          newname: ''
        },
        dialogEditVisible: false,
      }
    },
    mounted() {
      this._getTag();
    },
    methods:{
      handleAdd() {
        this._addTag(this.newTag);
      },
      handleEdit(index, row) {
        this.changedTag = {id:row.id,oldname:row.name,newname:''};
        this.dialogEditVisible = true
      },
      goEdit() {
        editTag(this.changedTag).then(res=>{
          if(res.data.status=='200') {
            this.$message({type: 'success',message: '修改成功!'});
            this.dialogEditVisible = false;
            this._getTag();
          }else{
            this.$message({type: 'warning',message: '修改失败失败——'+res.data.msg});
          }
        })
      },
      handleDelete(index, row) {
        this.$confirm('此操作将永久删除标签：'+ row.name +', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delTag(row.id).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
              this._getTag();
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      _getTag() {
        getTag().then(res => {
          if(res.data.status=="200") {
            this.tableData = [];
            for(let tag in res.data.data) {
              this.tableData.push({id:tag,name:res.data.data[tag]})
            }      
            this.loading = false;
          }
        })
      },
      _addTag(tag) {
        addTag(tag).then(res => {
          if(res.data.status=="200") {
            this._getTag();
            this.dialogAddVisible = false;
            this.$message({type: 'success',message: '新增标签成功!'});
          } else {
            this.$alert(res.data.msg, '新增标签报错', {confirmButtonText: '确定',});
          }
        })
      }
    },
  }
</script>

<style scoped>
  
</style>