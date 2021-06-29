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
      <el-table-column label="用户组" prop="role_key"></el-table-column>
      <el-table-column label="称呼" prop="role_key"></el-table-column>
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
      <el-table-column label="操作" align="right" width="150">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
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
    
    <el-dialog title="新增用户组信息" :visible.sync="dialogAddVisible">
      <el-form label-width="100px" size="mini" style="margin-top:30px">
        <el-form-item label="名称">
          <el-input v-model="newItem.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newItem.desc"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="newItem.permissions">
            <el-checkbox v-for="(item,index) in permissionList" :key="index" :label="item" style="width:30%"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="goAdd()" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='出库状态修改' :visible.sync="dialogChangeVisible">
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
    <el-dialog title="修改出库信息" :visible.sync="dialogEditVisible">
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
          <span>￡{{parseFloat(editOutput.price/100)}}</span>
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
  import { addCoverImg } from '@/network/post.js'
  import { payBalance } from '@/network/payment.js'
  import { getUserByEmail,getUserInfoById,getUser } from '@/network/user.js'
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

        newItem: {
          name: '',desc: '',permissions: [],
        },
        editItem: {
          name: '',desc: '',permissions: [],
        },
        
        permissionList: [
          "文章简单查看",
          "文章高级查看",
          "文章创建&编辑",
          "文章删除",
          "文章审稿",
          "标签页面查看",
          "标签创建",
          "标签删除",
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
        this.newItem = {name: '',desc: '',permissions: []};
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newItem.name == '') {
          this.$message({type: 'warning',message: '请输入用户组名称'});
        } else if(this.newItem.desc == '') {
          this.$message({type: 'warning',message: '请输入用户组描述'});
        } else if(this.newItem.permissions.length == 0) {
          this.$message({type: 'warning',message: '选择用户权限'});
        } else {
          console.log('go go go');
        }
      },
      handleEdit(index,row) {
      },
      goEdit() {
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