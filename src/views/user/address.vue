<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="地址编号" value="address_ID"></el-option>
      <el-option label="地址种类" value="default"></el-option>
      <el-option label="用户ID" value="user_id"></el-option>
      <el-option label="uuid" value="uuid"></el-option>
      <el-option label="邮箱地址" value="email"></el-option>
      <el-option label="收货人" value="user_name"></el-option>
      <el-option label="手机号" value="phone"></el-option>
      <el-option label="详细地址" value="addr"></el-option>
    </el-select>
    <template v-if="this.filter=='default'">
      <el-radio v-model="search" @input="goSearch()" label="1">默认地址</el-radio>
      <el-radio v-model="search" @input="goSearch()" label="0">普通地址</el-radio>
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
      style="width: 100%;max-height: calc(100vh - 142px);overflow-y:scroll"
      class="elTable">
      <el-table-column label="地址编号" prop="address_ID"></el-table-column>
      <el-table-column label="收货人" prop="user_name"></el-table-column>
      <el-table-column label="手机号" prop="phone"></el-table-column>
      <el-table-column label="详细地址" prop="addr"></el-table-column>
      <el-table-column label="地址种类" prop="default">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.default==0" type="info">普通地址</el-tag>
          <el-tag size="mini" v-if="scope.row.default==1" type="primary">默认地址</el-tag>
          <el-link v-if="scope.row.default==0||$store.state.user.right.indexOf('address_edit')!=-1" style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="user_nickname"></el-table-column>
      <el-table-column label="操作" align="right" width="200" v-if="$store.state.user.right.indexOf('address_edit')!=-1||$store.state.user.right.indexOf('address_del')!=-1">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="handleAdd()">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini" v-if="$store.state.user.right.indexOf('address_edit')!=-1"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger" v-if="$store.state.user.right.indexOf('address_del')!=-1"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="新增地址信息" :visible.sync="dialogAddVisible" :close-on-click-modal="false">
      <el-form size="mini">
        <el-form-item label="用户邮箱">
          <!-- <el-input v-model="newAddress.user_id"></el-input> -->
          <el-autocomplete
            class="inline-input"
            v-model="newAddress.user_email"
            size="small"
            style="width:100%"
            :fetch-suggestions="querySearch2"
            :trigger-on-focus="false"
            @input="dialogAddMore=false"
            @select="handleSelect2"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item v-if="dialogAddMore==true" label="收货人">
          <el-input v-model="newAddress.name"></el-input>
        </el-form-item>
        <el-form-item v-if="dialogAddMore==true" label="手机号">
          <el-input v-model="newAddress.phone"></el-input>
        </el-form-item>
        <el-form-item v-if="dialogAddMore==true" label="详细地址">
          <el-input v-model="newAddress.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="goAdd()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改地址信息" :visible.sync="dialogEditVisible" :close-on-click-modal="false">
      <el-form size="mini">
        <el-form-item label="地址编号">
          <el-input v-model="editAddress.address_ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="收货人">
          <el-input v-model="editAddress.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editAddress.phone"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="editAddress.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='地址种类修改' :visible.sync="dialogChangeVisible" :close-on-click-modal="false">
      <span>确认将此条地址设置为用户的默认地址</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </span>
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
  import { addAddress,delAddress,editAddress,getAddressList,filterAddress,searchAddress,changeDefaultAddress } from '@/network/address.js'
  import { getUser } from '@/network/user.js'
  export default {
    name: "Address",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'address_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,

        dialogAddVisible: false,
        newApplyUserId: '', 
        newApplyExpressid: '',
        newApplyEmail: '',
        newAddress: {
          user_id: '',
          address: '',
          name: '',
          phone: '',
        },

        dialogEditVisible: false,
        editApplyID: '',
        editApplyExpressid: '',
        editApplyEmail: '',
        editAddress: {
          address_ID: '',
          address: '',
          name: '',
          phone: '',
        },
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldAddress: null,

        dialogStorageVisible: false,
        newStorage: {
          user_id: '',
          email: '',
          expressid: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: ''
        },

        pageNum: null,
        currentPage: 1,
        interpret: {
          'addr': {name:'详细地址'},
          'address_ID': {name:'地址编号'},
          'default': {name:'地址种类'},
          'user_id': {name:'用户ID'},
          'uuid': {name:'uuid'},
          'email': {name:'邮箱地址'},
          'user_name': {name:'收货人'},
          'phone': {name:'手机号'},
        },
        selectList: [],
        dialogAddMore: false
      }
    },    
    mounted() {
      this._getList(this.currentPage);
    },
    methods:{
      defaultData() {
        getUser(0).then(res=>{
          let users = res.data.data;
          getAddressList(0).then(res=>{
            let data1=[],data2=[],data3=[],data4=[],data5=[],data6=[],data7=[],data8=[],data9=[];
            let items = res.data.data;
            let user_id;
            items.map(item=>{
              data1.push({id: 'address_ID', key: 'address_ID',value: item.address_ID})
              data2.push({id: 'addr', key: 'addr',value: item.addr})
              data3.push({id: 'email', key: 'email',value: item.user_email})
              data4.push({id: 'phone', key: 'phone',value: item.phone})
              data5.push({id: 'user_name', key: 'user_name',value: item.user_name})
              data6.push({id: 'user_nickname', key: 'user_nickname',value: item.user_nickname})
              data7.push({id: 'uuid', key: 'uuid',value: item.uuid})
              users.map(user=>{
                if(user.uuid==item.uuid)user_id=user.id
              })
              data8.push({id: 'user_id', key: 'user_id', value: user_id})
            })
            users.map(user=>{
              data9.push({id:user.id,key:'user_email',value:user.user_email})
            })
            this.selectList.address_ID = data1;
            this.selectList.addr = this.deWeight(data2);
            this.selectList.email = this.deWeight(data3);
            this.selectList.phone = this.deWeight(data4);
            this.selectList.user_name = this.deWeight(data5);
            this.selectList.user_nickname = this.deWeight(data6);
            this.selectList.uuid = this.deWeight(data7);
            this.selectList.user_id = this.deWeight(data8);
            this.selectList.user_email = this.deWeight(data9);
            this.loading = false;
          })
        })
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
      _getList(pageIndex) {
        this.defaultData();
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
            filterAddress(pageIndex,this.filter,this.search).then(res => {
              if(res.data.status=='200') {
                this.pageNum = parseInt(res.data.address_num);
                this.tableData = res.data.data;
                this.loading = false;
              } else {
                this.$message({type: 'error',message: res.data.msg})
              }      
              this.loading = false;
            });
          }
        } else {
          getAddressList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.address_num);
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
        this.newAddress = {user_id:'',name:'',phone:'',address:'',user_email:''}
        this.dialogAddVisible = true;
      },
      goAdd() {
        if(this.newAddress.user_email=='') {
          this.$message({type: 'warning',message: '请填写用户邮箱'});
        } else if(this.dialogAddMore==false) {
          this.$message({type: 'warning',message: '请选择正确的用户'});
        } else if(this.newAddress.name=='') {
          this.$message({type: 'warning',message: '请填写收货人'});
        } else if(this.newAddress.phone=='') {
          this.$message({type: 'warning',message: '请填写手机号码'});
        } else if(this.newAddress.address=='') {
          this.$message({type: 'warning',message: '请填写详细地址'});
        } else {
          this.selectList.user_email.map(item=>{
            if(item.value==this.newAddress.user_email)this.newAddress.user_id = item.id
          })
          addAddress(this.newAddress).then(res=>{
            if(res.data.status=='200') {
              this.dialogAddVisible = false;
              this.currentPage = 1;
              this._getList(this.currentPage);
              this.$message({type: 'success',message: '添加成功'});
              this.newAddress = {user_id:'',name:'',phone:'',address:'',user_email:''}
            } else {
              this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
            }
          })
        }
      },
      handleEdit(index,row) {
        this.editAddress.address_ID = row.address_ID;
        this.editAddress.address = row.addr;
        this.editAddress.name = row.user_name;
        this.editAddress.phone = row.phone;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editAddress.name=='') {
          this.$message({type: 'warning',message: '请填写收货人'});
        } else if(this.editAddress.phone=='') {
          this.$message({type: 'warning',message: '请填写手机号码'});
        } else if(this.editAddress.address=='') {
          this.$message({type: 'warning',message: '请填写收获地址'});
        } else {
          editAddress(this.editAddress).then(res=>{
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
        this.$confirm('此操作将永久删除这条单号为：'+ row.address_ID +'的地址信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAddress(row.address_ID).then(res=>{
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

      handleChange(row) {
        this.dialogChange = row.default;
        this.oldAddress = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        changeDefaultAddress(this.oldAddress.address_ID,this.oldAddress.uuid).then(res => {
          if(res.data.status=='200') {
            this.$message({type: 'success',message: '修改成功'});
            this.currentPage = 1;
            this._getList(this.currentPage);
            this.dialogChangeVisible = false;
          } else {
            this.$message({type: 'warning',message: '修改失败'});
          }
        })
      },

      handleCurrentChange() {
        this._getList(this.currentPage)
      },
      goSearch() {
        if(this.search==''||this.search==null) {
          this.$message({type:'warning',message:'请输入搜索词'})
        } else {
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
      
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        if(this.filter=='address_ID') {
          let query = this.selectList.address_ID;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_id') {
          let query = this.selectList.user_id;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='uuid') {
          let query = this.selectList.uuid;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='email') {
          let query = this.selectList.email;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_name') {
          let query = this.selectList.user_name;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='phone') {
          let query = this.selectList.phone;
          let results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='addr') {
          let query = this.selectList.addr;
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
      handleSelect2() {
        this.dialogAddMore = true;
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