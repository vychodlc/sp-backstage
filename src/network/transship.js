import { request } from "./request";


/* 申报api */ 
export function addApply(user_id,order) {
  let formData = new FormData();
  formData.append('user_id',user_id);
  formData.append('order',JSON.stringify(order));
  return request({
    method: 'POST',
    url: '/add_transship_apply.php',
    data: formData
  })
}
export function delApply(apply_ID) {
  let formData = new FormData();
  formData.append('apply_ID',apply_ID);
  return request({
    method: 'POST',
    url: '/del_transship_apply.php',
    data: formData
  })
}
export function getApplyList(p) {
  return request({
    url: '/get_transship_apply_list.php',
    params: {p}
  })
}
export function filterApply(filter,value,p) {
  return request({
    url: '/filter_transship_apply.php',
    params: {filter,value,p}
    /** filter: apply_ID,expressid,user_id,email,apply_status **/ 
  })
}
export function editApply(apply_ID,expressid,email) {
  let formData = new FormData();
  formData.append('apply_ID',apply_ID);
  formData.append('expressid',expressid);
  formData.append('email',email);
  return request({
    method: 'POST',
    url: '/edit_transship_apply.php',
    data: formData
  })
}
export function changeApply(apply_ID,apply_status) {
  let formData = new FormData();
  formData.append('apply_ID',apply_ID);
  formData.append('apply_status',apply_status);
  return request({
    method: 'POST',
    url: '/change_transship_apply.php',
    data: formData
  })
}
/* 库存api */
export function addStorage(info) {
  console.log(info);
  let formData = new FormData();
  formData.append('article_num',info.article_num);
  formData.append('user_id',info.user_id);
  formData.append('apply_id',info.apply_id);
  formData.append('size',info.size);
  formData.append('weight',info.weight);
  formData.append('pic',info.pic);
  return request({
    method: 'POST',
    url: '/add_transship_storage.php',
    data: formData
  })
}
export function delStorage(storage_ID) {
  let formData = new FormData();
  formData.append('storage_ID',storage_ID);
  return request({
    method: 'POST',
    url: '/del_transship_storage.php',
    data: formData
  })
}
export function getStorageList(p) {
  return request({
    url: '/get_transship_storage_list.php',
    params: {p}
  })
}
export function filterStorage(filter,value,p) {
  return request({
    url: '/filter_transship_storage.php',
    params: {filter,value,p}
    /** filter: storage_ID,expressid,user_id,email,apply_status **/ 
  })
}
export function editStorage(info) {
  console.log(info);
  let formData = new FormData();
  formData.append('storage_ID',info.storage_ID);
  formData.append('article_num',info.article_num);
  formData.append('size',info.size);
  formData.append('weight',info.weight);
  formData.append('pic',info.pic);
  return request({
    method: 'POST',
    url: '/edit_transship_storage.php',
    data: formData
  })
}
export function changeStorage(storage_ID,storage_status) {
  let formData = new FormData();
  formData.append('storage_ID',storage_ID);
  formData.append('storage_status',storage_status);
  return request({
    method: 'POST',
    url: '/change_transship_storage.php',
    data: formData
  })
}
/* 出库api */
export function addOutput(info) {
  console.log(info);
  let formData = new FormData();
  formData.append('article_nums',info.article_nums);
  formData.append('user_id',info.user_id);
  formData.append('outbound_type',info.outbound_type);
  formData.append('material',info.material);
  formData.append('address',info.address);
  return request({
    method: 'POST',
    url: '/add_transship_outbound.php',
    data: formData
  })
}
export function delOutput(outbound_ID) {
  let formData = new FormData();
  formData.append('outbound_ID',outbound_ID);
  return request({
    method: 'POST',
    url: '/del_transship_outbound.php',
    data: formData
  })
}
export function getOutputList(p) {
  return request({
    url: '/get_transship_outbound_list.php',
    params: {p}
  })
}
export function filterOutput(filter,value,p) {
  return request({
    url: '/filter_transship_outbound.php',
    params: {filter,value,p}
  })
}
export function editOutput(info) {
  let formData = new FormData();
  formData.append('outbound_ID',info.outbound_ID);
  formData.append('article_nums',info.article_nums);
  formData.append('outbound_type',info.outbound_type);
  formData.append('material',info.material);
  return request({
    method: 'POST',
    url: '/edit_transship_outbound.php',
    data: formData
  })
}
export function changeOutput(outbound_ID,outbound_status) {
  let formData = new FormData();
  formData.append('outbound_ID',outbound_ID);
  formData.append('outbound_status',outbound_status);
  return request({
    method: 'POST',
    url: '/change_transship_outbound.php',
    data: formData
  })
}
/* 货号api */
export function addTransshipCode(user_id) {
  let formData = new FormData();
  formData.append('user_id',user_id);
  return request({
    method: 'POST',
    url: '/add_transship_code.php',
    data: formData
  })
}
export function getTransshipCode(user_id) {
  return request({
    url: '/get_transship_code.php',
    params: {user_id}
  })
}

// export function post(token) {
//   let formData = new FormData();
//   formData.append('token',token);
//   return request({
//     method: 'POST',
//     url: '/post.php',
//     data: formData
//   })
// }

// export function get(id) {
//   return request({
//     url: '/get.php',
//     params: {
//       user_id: id
//     }
//   })
// }