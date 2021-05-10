<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="标题" value="title"></el-option>
      <el-option label="作者" value="author"></el-option>
      <el-option label="菜单" value="menu"></el-option>
      <el-option label="标签" value="tag"></el-option>
      <el-option label="评级" value="rank"></el-option>
      <el-option label="活动" value="activity"></el-option>
      <el-option label="状态" value="post_status"></el-option>
    </el-select>
    <template v-if="this.filter=='activity'||this.filter=='post_status'||this.filter=='rank'||this.filter=='menu'">
      <template v-if="this.filter=='activity'">
        <el-radio v-model="search" label="0">无</el-radio>
        <el-radio v-model="search" label="1">有</el-radio>
      </template>
      <template v-else-if="this.filter=='rank'">
        <el-radio v-model="search" label="1">1</el-radio>
        <el-radio v-model="search" label="2">2</el-radio>
        <el-radio v-model="search" label="3">3</el-radio>
        <el-radio v-model="search" label="4">4</el-radio>
        <el-radio v-model="search" label="5">5</el-radio>
      </template>
      <template v-else-if="this.filter=='menu'">
        <el-radio v-model="search" label="种类">种类</el-radio>
        <el-radio v-model="search" label="品牌">品牌</el-radio>
        <el-radio v-model="search" label="年代">年代</el-radio>
      </template>
      <template v-else>
        <el-radio v-model="search" label="0">未发布</el-radio>
        <el-radio v-model="search" label="1">已发布</el-radio>
        <el-radio v-model="search" label="2">已下架</el-radio>
      </template>
    </template>
    <el-input v-else placeholder="请输入内容" size="small" style="width:30vw;margin-right:10px" v-model="search" class="input-with-select"></el-input>
    <el-button size="small" type="" @click="goSearch">搜索</el-button>
    <el-button size="small" v-if="isSearch==true" type="primary" @click="goBack">返回</el-button>
    <el-tag size="small" closable v-if="isSearch==true" style="margin-left:10px" @close="goBack">{{filterWord}} : {{searchWord}}</el-tag>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      height="75vh">
      <el-table-column label="编号" prop="ID"></el-table-column>
      <el-table-column label="标题" prop="post_title"></el-table-column>
      <el-table-column label="作者" prop="author"></el-table-column>
      <el-table-column label="菜单" prop="menu"></el-table-column>
      <el-table-column label="标签" width="200">
        <template slot-scope="scope">
          <el-tag size="mini" style="margin:2px" v-for="(item,index) in scope.row.tags" :key="index">{{ tags[item] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评级" prop="rank"></el-table-column>
      <el-table-column label="活动">
        <template slot-scope="scope">
          <el-popover v-if="scope.row.activity!=0" trigger="hover" placement="top">
            <p>活动链接: {{ scope.row.link }}</p>
            <p>活动起始时间: {{ scope.row.start_time }}</p>
            <p>活动结束时间: {{ scope.row.end_time }}</p>
            <div slot="reference" class="name-wrapper">
              <!-- <el-tag size="medium">{{ scope.row.activity }}</el-tag> -->
              <el-tag size="medium">有</el-tag>
            </div>
          </el-popover>
          <!-- <span v-else>{{scope.row.activity}}</span> -->
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="post_status" width="100">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.post_status==0" type="warning">未发布</el-tag>
          <el-tag size="mini" v-if="scope.row.post_status==1" type="success">发布中</el-tag>
          <el-tag size="mini" v-if="scope.row.post_status==2" type="info">已下架</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="changeStatus(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="200">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="$router.push({name:'PostEdit'})">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="$router.push({name:'PostEdit',params:{id:scope.row.ID}})">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="文章状态修改" :visible.sync="dialogStatusVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogStatus" label="0">未发布</el-radio>
          <el-radio v-model="dialogStatus" label="1">已发布</el-radio>
          <el-radio v-model="dialogStatus" label="2">已下架</el-radio>
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
  import { getPostList,delPost,changePostStatus,getPostFilter,getPostFilterByTag,searchPost } from '@/network/post.js'
  import { getTag } from '@/network/tag.js'
  export default {
    name: "Post",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'title',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,
        dialogStatusVisible: false,
        dialogStatus: null,
        oldPost: null,
        pageNum: null,
        currentPage: 1,
        interpret: {
          'title': {name:'标题'},
          'author': {name:'作者'},
          'menu': {name:'菜单'},
          'tag': {name:'标签'},
          'rank': {name:'评级'},
          'activity': {name:'活动'},
          'post_status': {name:'状态'}
        }
      }
    },
    mounted() {
      this._getPostList(this.currentPage)
    },
    methods:{
      _getPostList(pageIndex) {
        this.loading = true;
        getTag().then(res=> {
          if(res.data.status=='200') {
            this.tags = res.data.data;
            if(this.isSearch==true) {
              if(this.filter=='tag') {
                let index = 0;
                for(let key in this.tags) {
                  if(this.tags[key]==this.search) {
                    index = key;
                  }
                }
                getPostFilterByTag(index,this.currentPage).then(res => {
                  if(res.data.status=='200') {
                    this.pageNum = parseInt(res.data.filter_num);
                    this.tableData = res.data.data;
                    this.loading = false;
                    for(let item in this.tableData) {
                      this.tableData[item].tags = this.tableData[item].tags.split(',');
                    }
                  } else {
                    this.$message({type: 'error',message: res.data.msg})
                  }      
                  this.loading = false;
                });
              } else if(this.filter=='title') {
                searchPost(this.search,pageIndex).then(res=> {
                  if(res.data.status=='200') {
                    this.pageNum = parseInt(res.data.search_num);
                    this.tableData = res.data.data;
                    this.loading = false;
                    for(let item in this.tableData) {
                      this.tableData[item].tags = this.tableData[item].tags.split(',');
                    }
                  } else {
                    this.$message({type: 'error',message: res.data.msg})
                  }      
                  this.loading = false;
                })
              } else {
                getPostFilter(this.filter,this.search,pageIndex).then(res => {
                  if(res.data.status=='200') {
                    this.pageNum = parseInt(res.data.filter_num);
                    this.tableData = res.data.data;
                    this.loading = false;
                    for(let item in this.tableData) {
                      this.tableData[item].tags = this.tableData[item].tags.split(',');
                    }
                  } else {
                    this.$message({type: 'error',message: res.data.msg})
                  }      
                  this.loading = false;
                });
              }
            } else {
              getPostList(pageIndex).then(res => {
                if(res.data.status=='200') {
                  this.pageNum = parseInt(res.data.posts_num);
                  this.tableData = res.data.data;
                  this.loading = false;
                  for(let item in this.tableData) {
                    this.tableData[item].tags = this.tableData[item].tags.split(',');
                  }
                } else {
                  this.$message({type: 'error',message: res.data.msg})
                }      
                this.loading = false;
              });
            }
          }
        });
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除文章：'+ row.post_title +', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delPost(row.ID).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
              this.currentPage = 1;
              this._getPostList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      changeStatus(row) {
        this.dialogStatusVisible = true;
        this.dialogStatus = row.post_status;
        this.oldPost = row;
      },
      goStatusChange() {
        if(this.oldPost.post_status!=this.dialogStatus) {
          changePostStatus(this.oldPost.ID,this.dialogStatus,localStorage.nickname).then(res => {
            this.$message({type: 'success',message: '状态修改成功'});
            this.currentPage = 1;
            this._getPostList(this.currentPage);
            this.dialogStatusVisible = false;
          })
        } else {
          this.$message({type: 'warning',message: '状态未修改'});
        }
      },
      handleCurrentChange() {
        this._getPostList(this.currentPage)
      },
      goSearch() {
        this.isSearch = true;
        this.searchWord = this.search;
        this.filterWord = this.interpret[this.filter].name;
        // if(thi.search=='title') {
        //   this.searchWord = '标题'
        // }
        this.loading = true;
        this.currentPage = 1;
        this._getPostList(this.currentPage)
      },
      goBack() {
        this.isSearch=false;
        this.search=null;
        this.currentPage = 1;
        this._getPostList(this.currentPage)
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