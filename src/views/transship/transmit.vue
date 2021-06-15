<template>
  <div class="post-container">
    <el-select v-model="filter" size="small" @change='filterChange' style="width:8vw;margin-right:10px" placeholder="请选择">
      <el-option label="申报单号" value="apply_ID"></el-option>
      <!-- <el-option label="邮箱地址" value="email"></el-option> -->
      <el-option label="订单号" value="expressid"></el-option>
      <el-option label="用户编号" value="user_id"></el-option>
      <el-option label="用户邮箱" value="user_email"></el-option>
      <el-option label="转运码" value="code"></el-option>
      <el-option label="状态" value="apply_status"></el-option>
    </el-select>
    <template v-if="this.filter=='apply_status'">
      <el-radio v-model="search" label="0">未入库</el-radio>
      <el-radio v-model="search" label="1">已入库</el-radio>
      <el-radio v-model="search" label="2">已驳回</el-radio>
    </template>
    <el-autocomplete
      v-else
      class="inline-input"
      v-model="search"
      size="small"
      id="searchBox"
      ref="searchBox"
      style="width:30vw;margin-right:10px"
      :fetch-suggestions="querySearch"
      placeholder="请输入内容"
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
      <el-table-column label="申报单号" prop="apply_ID"></el-table-column>
      <el-table-column label="订单号" prop="expressid"></el-table-column>
      <el-table-column label="邮箱地址" prop="email"></el-table-column>
      <el-table-column label="品牌" prop="brand"></el-table-column>
      <el-table-column label="用户编号" prop="user_id">
        <template slot-scope="scope">
          <span>{{scope.row.user_id}}-{{scope.row.code}}</span>
        </template>
      </el-table-column>
      <el-table-column label="申报时间" prop="apply_time"></el-table-column>
      <el-table-column label="状态" prop="apply_status">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.apply_status==0" type="warning">未入库</el-tag>
          <el-tag size="mini" v-if="scope.row.apply_status==1" type="success">已入库</el-tag>
          <el-tag size="mini" v-if="scope.row.apply_status==2" type="info">已驳回</el-tag>
          <el-link style="margin-left:10px" icon="el-icon-edit" @click="handleChange(scope.row)"></el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right" width="300">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="dialogAddVisible=true">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="warning"
            v-if="scope.row.apply_status==0"
            @click="handleRefuse(scope.row)">驳回</el-button>
          <el-button
            size="mini"
            type="success"
            v-if="scope.row.apply_status==0"
            @click="handleStorage(scope.row)">入库</el-button>
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
    
    <el-dialog title="新增申报信息" :visible.sync="dialogAddVisible" :modal-append-to-body="false" :append-to-body="true" >
      <el-form size="mini">
        <el-form-item label="用户邮箱">
          <el-input v-model="newApplyUserEmail" autocomplete="off" :disabled='loading'></el-input>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="newApplyExpressid" autocomplete="off" :disabled='loading'></el-input>
        </el-form-item>
        <el-form-item label="品牌">
          <el-radio v-model="newApplyBrand" :disabled='loading' label="N">Nike</el-radio>
          <el-radio v-model="newApplyBrand" :disabled='loading' label="A">Adidas</el-radio>
          <el-radio v-model="newApplyBrand" :disabled='loading' label="JD">JDSports</el-radio>
          <el-radio v-model="newApplyBrand" :disabled='loading' label="U">通用</el-radio>
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="newApplyEmail" autocomplete="off" :disabled='loading'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false" :disabled='loading'>取 消</el-button>
        <el-button type="primary" @click="handleAdd()" :disabled='loading'>确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'修改申报信息——申报单号:'+editApplyID" :visible.sync="dialogEditVisible">
      <el-form>
        <el-form-item label="订单号">
          <el-input v-model="editApplyExpressid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="editApplyEmail" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="goEdit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title='申报状态修改' :visible.sync="dialogChangeVisible">
      <el-form>
        <el-form-item>
          <el-radio v-model="dialogChange" label="0">未入库</el-radio>
          <el-radio v-model="dialogChange" label="1">已入库</el-radio>
          <el-radio v-model="dialogChange" label="2">已驳回</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeVisible = false">取 消</el-button>
        <el-button type="primary" @click="goChange()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增库存信息(入库)" :visible.sync="dialogStorageVisible">
      <el-form label-width="100px" size="mini">
        <el-form-item label="申报单号">
          <el-input v-model="newStorage.expressid" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="newStorage.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="货品尺寸">
          <el-row>
            <el-col>
              <el-form-item label="长(cm)">
                <el-input type="number" v-model="newStorage.size[0]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="宽(cm)">
                <el-input type="number" v-model="newStorage.size[1]"></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="高(cm)">
                <el-input type="number" v-model="newStorage.size[2]"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="货品重量">
          <el-input v-model="newStorage.weight" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="货品描述">
          <el-input v-model="newStorage.description" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="货品图片">
          <el-upload
            ref="uploadImg"
            class="upload-demo"
            action="#"
            accept="image/jpeg,image/gif,image/png"
            :on-change='handleChangeImg'
            :on-exceed='handleExceed'
            :limit='1'
            list-type="picture"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过1MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStorageVisible = false">取 消</el-button>
        <el-button type="primary" @click="goStorage()">确 定</el-button>
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
  import { addApply,delApply,editApply,getApplyList,changeApply, addStorage,filterApply,getCrawlerOrder } from '@/network/transship.js'
  import { addCoverImg } from '@/network/post.js'
  import { getUserByEmail,getUser } from '@/network/user.js'
  import * as imageConversion from 'image-conversion';
  import { validateEmail } from '@/utils/validate.js'
  export default {
    name: "Transmit",
    data () {
      return {
        search: null,
        searchWord: null,
        filter: 'apply_ID',
        filterWord: null,
        isSearch: false,
        loading: true,
        tableData: [],
        tags: null,

        dialogAddVisible: false,
        newApplyUserEmail: '', 
        newApplyExpressid: '',
        newApplyEmail: '',
        newApplyBrand: 'N',

        dialogEditVisible: false,
        editApplyID: '',
        editApplyExpressid: '',
        editApplyEmail: '',
        
        dialogChangeVisible: false,
        dialogChange: '',
        oldApply: null,

        dialogStorageVisible: false,
        newStorage: {
          user_id: '',
          email: '',
          expressid: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: '',
          description: '',
        },
        selectList: {},

        pageNum: null,
        currentPage: 1,
        interpret: {
          'apply_ID': {name:'申报单号'},
          'expressid': {name:'订单号'},
          'user_id': {name:'用户ID'},
          'user_email': {name:'用户邮箱'},
          'email': {name:'邮箱地址'},
          'code': {name:'转运码'},
          'apply_status': {name:'状态'},
        },
      }
    },
    mounted() {
      getApplyList(0).then(res=>{
        let data1 = [];
        let data2 = [];
        let data3 = [];
        let applys = res.data.data;
        
        applys.map(apply=>{
          data1.push({key: 'apply_ID',value: apply.apply_ID})
          data2.push({key: 'expressid',value: apply.expressid})
          data3.push({key: 'email',value: apply.email})
        })
        this.selectList.apply_ID = data1;
        this.selectList.expressid = data2;
        this.selectList.email = data3;
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
          this._getApplyList(this.currentPage);
        })
      })
    },
    methods:{
      querySearch(queryString, cb) {
        queryString = queryString.toString();
        let results = [];
        if(this.filter=='apply_ID') {
          let query = this.selectList.apply_ID;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='expressid') {
          let query = this.selectList.expressid;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='email') {
          let query = this.selectList.email;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_email') {
          let query = this.selectList.user_email;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='user_id') {
          let query = this.selectList.user_id;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
          cb(results);
        } else if(this.filter=='code') {
          let query = this.selectList.code;
          results = queryString ? query.filter(this.createFilter(queryString)) : query;
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
      _getApplyList(pageIndex) {
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
          filterApply(filter,search,pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.applications_num);
              this.tableData = res.data.data;
              this.loading = false;
            } else {
              this.$message({type: 'error',message: res.data.msg})
            }      
            this.loading = false;
          });
        } else {
          getApplyList(pageIndex).then(res => {
            if(res.data.status=='200') {
              this.pageNum = parseInt(res.data.applications_num);
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
        if(this.newApplyUserEmail=='') {
          this.$message({type: 'warning',message: '请填写用户邮箱'});
        // } else if(validateEmail(this.newApplyUserEmail)==false) {
        //   this.$message({type: 'warning',message: '用户邮箱格式不符合规范'});
        } else if(this.newApplyExpressid=='') {
          this.$message({type: 'warning',message: '请填写订单号'});
        } else if(this.newApplyBrand==null) {
          this.$message({type: 'warning',message: '请选择品牌'});
        } else if(this.newApplyEmail=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        // } else if(validateEmail(this.newApplyEmail)==false) {
        //   this.$message({type: 'warning',message: '邮箱格式不符合规范'});
        } else {
          this.checkOrder(this.newApplyExpressid,this.newApplyEmail)
        }
      },
      handleEdit(index,row) {
        this.editApplyID = row.apply_ID;
        this.editApplyExpressid = row.expressid;
        this.editApplyEmail = row.email;
        this.dialogEditVisible = true;
      },
      goEdit() {
        if(this.editApplyExpressid=='') {
          this.$message({type: 'warning',message: '请填写订单号'});
        } else if(this.editApplyEmail=='') {
          this.$message({type: 'warning',message: '请填写邮箱地址'});
        } else if(validateEmail(this.editApplyEmail)==false) {
          this.$message({type: 'warning',message: '邮箱格式不符合规范'});
        } else {
          editApply(this.editApplyID,this.editApplyExpressid,this.editApplyEmail).then(res=>{
            if(res.data.status=='200') {
              this.dialogEditVisible = false;
              this.currentPage = 1;
              this._getApplyList(this.currentPage);
              this.$message({type: 'success',message: '修改成功'});
            } else {
              this.$message({type: 'warning',message: '修改失败——'+res.data.msg});
            }
          })
        }       
      },
      handleDelete(index,row) {
        this.$confirm('此操作将永久删除这条单号为：'+ row.apply_ID +'的申报信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delApply(row.apply_ID).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '删除成功!'});
              this.currentPage = 1;
              this._getApplyList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '删除失败'});
            }
          })
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      handleRefuse(row) {
        this.$confirm('此操作将驳回这条单号为：'+ row.apply_ID +'的申报信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          changeApply(row.apply_ID,2).then(res=>{
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '驳回成功!'});
              this.currentPage = 1;
              this._getApplyList(this.currentPage);
            }else {
              this.$message({type: 'warning',message: '驳回失败'+res.data.msg});
            }
          })
        }).catch(() => {
          // this.$message({type: 'info',message: '已取消删除'});          
        });
      },
      handleStorage(row) {
        this.newStorage = {
          user_id: '',
          email: '',
          expressid: '',
          apply_id: '',
          article_num: '',
          size: ['','',''],
          weight: '',
          pic: ''
        };
        this.newStorage.user_id = row.user_id;
        this.newStorage.expressid = row.expressid;
        this.newStorage.apply_id = row.apply_ID;
        this.newStorage.email = row.email;
        this.dialogStorageVisible = true;
      },
      goStorage() {
        let file = this.$refs.uploadImg.uploadFiles.pop().raw;
        let fileName = new Date().getTime() + '-' +file.name;
        imageConversion.compress(file,0.6).then(res=>{
          let uploadFile = new File([res], fileName, {type: res.type});
          addCoverImg(uploadFile).then(res=>{
            if(res.data.status=='201') {
              addStorage({
                article_num: this.newStorage.article_num, 
                user_id: this.newStorage.user_id,
                apply_id: this.newStorage.apply_id,
                size: this.newStorage.size.join('*'), 
                weight: this.newStorage.weight,
                description: this.newStorage.description,
                pic: res.data.cover_img_url,
              }).then(resAdd=>{
                if(resAdd.data.status=='200') {
                  changeApply(this.newStorage.apply_id,1).then(res=>{
                    this.dialogStorageVisible = false;
                    this.currentPage = 1;
                    this._getApplyList(this.currentPage);
                    this.$message({type: 'success',message: '入库成功'});
                  });
                }else{
                  this.$message({type: 'warning',message: '入库失败——'+resAdd.data.msg});
                }
              })
            } else {
              this.$message({type: 'warning',message: '图片上传失败——'+res.data.msg});
            }
          })
        })
      },
      handleChangeImg(file,filelist) {
        const isIMAGE = (file.raw.type === 'image/jpeg')||(file.raw.type === 'image/gif')||(file.raw.type === 'image/png');
        const isLt1M = file.raw.size / 1024 / 1024 < 1;
        if (!isIMAGE) {
          this.$refs.uploadImg.uploadFiles.pop().raw;
          this.$message.error('上传文件只能是图片格式!');
        }
        if (!isLt1M) {
          this.$refs.uploadImg.uploadFiles.pop().raw;
          this.$message.error('上传文件大小不能超过 1MB!');
        }
        return isIMAGE && isLt1M;
      },
      handleExceed() {
        this.$message({type: 'error',message: '请删除当前图片再上传其他图片!'});
      },
      handleChange(row) {
        this.dialogChange = row.apply_status;
        this.oldApply = row;
        this.dialogChangeVisible = true;
      },
      goChange() {
        if(this.oldApply.apply_status!=this.dialogChange) {
          changeApply(this.oldApply.apply_ID,this.dialogChange).then(res => {
            if(res.data.status=='200') {
              this.$message({type: 'success',message: '状态修改成功'});
              this.currentPage = 1;
              this._getApplyList(this.currentPage);
              this.dialogChangeVisible = false;
            } else {
              this.$message({type: 'warning',message: '状态修改失败'});
            }
          })
        } else {
          this.$message({type: 'warning',message: '状态未修改'});
        }
      },
      handleCurrentChange() {
        this._getApplyList(this.currentPage)
      },
      goSearch() {
        if(this.search==''||this.search==null) {
          this.$message({type: 'warning',message: '请输入搜索词'});
        } else {
          this.isSearch = true;
          this.searchWord = this.search;
          if(this.filter=='apply_status') {
            if(this.search=='0') {
              this.searchWord = '未入库'
            } else if(this.search=='1') { 
              this.searchWord = '已入库'
            } else if(this.search=='2') { 
              this.searchWord = '已驳回'
            }
          } else {
            this.searchWord = this.search;
          }
          this.filterWord = this.interpret[this.filter].name;
          this.loading = true;
          this.currentPage = 1;
          this._getApplyList(this.currentPage)
        }
      },
      goBack() {
        this.isSearch=false;
        this.search=null;
        this.currentPage = 1;
        this._getApplyList(this.currentPage)
      },
      filterChange() {
        this.search = '';
      },

      checkOrder(id,email) {
        let returnItem = {
          order_time: [],
          price: [],
          maxOrderLineStatus:[],
          minOrderLineStatus:[],
          rolledUpStatus:[],
          size:[],
          style:[],
          op_date:[],
          op_description:[],
          op_quantity:[],
          first_address:[],
          second_address:[],
          city:[],
          postal:[],
          country:[],
          gift:[],
          tracker:[],
        }
        
        if(this.newApplyBrand=='N') {
          let headers = {
            "Content-Type": "application/x-www-form-urlencoded;",
            "accept":"application/json",
            "accept-language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja-JP;q=0.6,ja;q=0.5",
            "appid":"orders",
            "x-nike-visitid":"1",
            "x-nike-visitorid":this.guid(),
          }
          let url1 = "https://api.nike.com/order_mgmt/user_order_details/v2/" + id + "?filter=email(" + email + ")";
          let url2 = "https://api.nike.com/ship/user_shipments/v1?locale=en_us&filter=orderNumber(" + id +")&filter=email("+email+")";

          this.$axios.all([
            this.$axios.get(url1, {
              headers: headers,
            }).catch(e=>{
              this.$message({type: 'warning',message: '订单不存在'});
            }),
            this.$axios.get(url2, {
              headers: headers,
            })
          ]).then(this.$axios.spread((res1,res2)=>{
            let data = res1.data;
            returnItem.order_time.push(data.orderCreateDate?data.orderCreateDate:'');
            returnItem.price.push(data.totalAmount?data.totalAmount:'');
            data.orderLines.map(orderline=>{
              returnItem.maxOrderLineStatus.push(orderline.maxOrderLineStatus?orderline.maxOrderLineStatus:'');
              returnItem.minOrderLineStatus.push(orderline.minOrderLineStatus?orderline.minOrderLineStatus:'');
              returnItem.rolledUpStatus.push(orderline.rolledUpStatus?orderline.rolledUpStatus:'');
              returnItem.size.push(orderline.displaySize?orderline.displaySize:'');
              returnItem.style.push(orderline.styleNumber?orderline.styleNumber+'-'+orderline.colorCode:'');
              if(orderline.statuses) {
                orderline.statuses.map(status=>{
                  returnItem.op_date.push(status.date?status.date:'');
                  returnItem.op_description.push(status.description?status.description:'');
                  returnItem.op_quantity.push(status.quantity?status.quantity:'');
                });
              }
              if(orderline.shipTo&&orderline.shipTo.address) {
                returnItem.first_address.push(orderline.shipTo.address.address1?orderline.shipTo.address.address1:'');
                returnItem.second_address.push(orderline.shipTo.address.address2?orderline.shipTo.address.address2:'');
                returnItem.city.push(orderline.shipTo.address.city?orderline.shipTo.address.city:'');
                returnItem.postal.push(orderline.shipTo.address.zipCode?orderline.shipTo.address.zipCode:'');
                returnItem.country.push(orderline.shipTo.address.country?orderline.shipTo.address.country:'');
              }
            });
            if(data.paymentMethods) {
              data.paymentMethods.map(paymentMethod=>{
                returnItem.gift.push(paymentMethod.displayGiftCardNumber?paymentMethod.displayGiftCardNumber:'');
              });
            }
            data = res2.data;
            if(data.objects) {
              data.objects.map(object=>{
                if(object.containers) {
                  object.containers.map(container=>{
                    returnItem.tracker.push(container.trackingNumber?container.trackingNumber:'')
                  })
                }
              })
            }

            for(let item in returnItem) {
              returnItem[item] = returnItem[item].join(',')
            }
            
            returnItem.id = this.newApplyExpressid;
            returnItem.email = this.newApplyEmail;

            getUserByEmail(this.newApplyUserEmail).then(res=>{
              if(res.data.status=='200') {
                addApply(res.data.user_ID,[returnItem],this.newApplyBrand).then(res=>{
                  if(res.data.status=='200') {
                    this.dialogAddVisible = false;
                    this.currentPage = 1;
                    this._getApplyList(this.currentPage);
                    this.$message({type: 'success',message: '添加成功'});
                    this.newApplyExpressid = '';
                    this.newApplyEmail = '';
                  } else {
                    this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
                  }
                })
              } else {
                this.$message({type: 'warning',message: '查无用户'});
              }
            })
          }))
        } else if(this.newApplyBrand=='JD') {
          let url = "https://data.smartagent.io/v1/jdsports/track-my-order?orderNumber=" + id + "&facia=jdsportsuk&emailAddress=" + email;
          let header = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'content-type': 'application/json',
            'origin': 'https:/trackmyorder-v2.smartagent.io',
            'referer': 'https://trackmyorder-v2.smartagent.io/',
          }
          this.$axios.get(url,
            {headers: header,}
          ).catch(e=>{
            this.$message({type: 'warning',message: '订单不存在'});
          }).then(res=>{
            let data = res.data;
            returnItem.order_time.push(data.date?data.date:'');
            returnItem.price.push(data.totals?data.totals.total.amount:'');
            if(data.status&&data.status.full) {
              data.status.full.map(fullItem=>{
                if(fullItem.state=='done') {
                  returnItem.op_description.push(fullItem.description?fullItem.description:fullItem.title);
                  returnItem.op_date.push(fullItem.date?fullItem.date:'')
                }
              })
            }
            if(data.vendors&&data.vendors[0]&&data.vendors[0].items) {
              data.vendors[0].items.map(item=>{
                returnItem.op_quantity.push(item.qty?item.qty:'')
                returnItem.size.push(item.size?item.size:'')
                returnItem.style.push(item.sku?item.sku:'')
                returnItem.rolledUpStatus.push(item.status?item.status:'')
              })
            }
            if(data.addresses&&data.addresses.billing) {
              returnItem.first_address.push(data.addresses.billing.address1)
              returnItem.second_address.push(data.addresses.billing.address2)
              returnItem.city.push(data.addresses.billing.town)
              returnItem.postal.push(data.addresses.billing.postcode)
              returnItem.country.push(data.addresses.billing.locale)
            }
            if(data.delivery) {
              returnItem.tracker.push(data.delivery.trackingURL?data.delivery.trackingURL:'');
            }
            if(data.payment&&data.payment.giftCard) {
              returnItem.gift.push(data.payment.giftCard.cardNumber?data.payment.giftCard.cardNumber:'');
            }
            for(let item in returnItem) {
              returnItem[item] = returnItem[item].join(',')
            }
            
            returnItem.id = this.newApplyExpressid;
            returnItem.email = this.newApplyEmail;
            
            getUserByEmail(this.newApplyUserEmail).then(res=>{
              if(res.data.status=='200') {
                addApply(res.data.user_ID,[returnItem],this.newApplyBrand).then(res=>{
                  if(res.data.status=='200') {
                    this.dialogAddVisible = false;
                    this.currentPage = 1;
                    this._getApplyList(this.currentPage);
                    this.$message({type: 'success',message: '添加成功'});
                    this.newApplyExpressid = '';
                    this.newApplyEmail = '';
                  } else {
                    this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
                  }
                })
              } else {
                this.$message({type: 'warning',message: '查无用户'});
              }
            })
          })
        } else if(this.newApplyBrand=='A') {
          getCrawlerOrder({
            id:id,
            email:email,
            brand:'A'
          }).then(res=>{
            let data = res.data;
            returnItem.order_time = data[1];
            returnItem.price = data[2];
            returnItem.maxOrderLineStatus = data[3].filter(item=>{return item!=''}).join(',');
            returnItem.minOrderLineStatus = data[4].filter(item=>{return item!=''}).join(',');
            returnItem.rolledUpStatus = data[5].filter(item=>{return item!=''}).join(',');
            returnItem.size = data[6].filter(item=>{return item!=''}).join(',');
            returnItem.style = data[7].filter(item=>{return item!=''}).join(',');
            returnItem.op_date = data[8];
            returnItem.op_description = data[9];
            returnItem.op_quantity = data[10].filter(item=>{return item!=''}).join(',');
            returnItem.first_address = data[11];
            returnItem.second_address = data[12];
            returnItem.city = data[13];
            returnItem.postal = data[14];
            returnItem.country = data[15];
            returnItem.gift = data[16];
            returnItem.tracker = data[17];

            returnItem.id = this.newApplyExpressid;
            returnItem.email = this.newApplyEmail;
            
            getUserByEmail(this.newApplyUserEmail).then(res=>{
              if(res.data.status=='200') {
                addApply(res.data.user_ID,[returnItem],this.newApplyBrand).then(res=>{
                  if(res.data.status=='200') {
                    this.dialogAddVisible = false;
                    this.currentPage = 1;
                    this._getApplyList(this.currentPage);
                    this.$message({type: 'success',message: '添加成功'});
                    this.newApplyExpressid = '';
                    this.newApplyEmail = '';
                  } else {
                    this.$message({type: 'warning',message: '添加失败——'+res.data.msg});
                  }
                })
              } else {
                this.$message({type: 'warning',message: '查无用户'});
              }
            })
          }).catch(res=>{
            this.$message({type: 'warning',message: '订单不存在'});
          })
        } else {
          this.$message({type: 'warning',message: '当前只支持 Nike Adidas 和 JD'});
        }
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
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