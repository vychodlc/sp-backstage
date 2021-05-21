import {request} from './request'

export function addAddress(address,user_id) {
  let formData = new FormData();
  formData.append('address',address)
  formData.append('user_id',user_id)
  return request({
    method: 'POST',
    url: '/add_address.php',
    data: formData
  })
}
export function changeDefaultAddress(address_ID,uuid) {
  let formData = new FormData();
  formData.append('address_ID',address_ID)
  formData.append('uuid',uuid)
  return request({
    method: 'POST',
    url: '/change_address_default.php',
    data: formData
  })
}
export function editAddress(address_ID,address) {
  console.log(address_ID,address);
  let formData = new FormData();
  formData.append('address_ID',address_ID)
  formData.append('address',address)
  return request({
    method: 'POST',
    url: '/edit_address.php',
    data: formData
  })
}
export function delAddress(address_ID) {
  let formData = new FormData();
  formData.append('address_ID',address_ID)
  return request({
    method: 'POST',
    url: '/del_address.php',
    data: formData
  })
}
export function getAddressList(p) {
  return request({
    url: '/get_address_list.php',
    params: {p}
  })
  // 数组，address_ID + addr + default + uuid
}
export function filterAddress(p,filter,value) {
  return request({
    url: '/filter_address.php',
    params: {p,filter,value}
  })
  // filter: address_ID，default，user_id, uuid, email
}
// 模糊搜索地址
export function searchAddress(p,addr) {
  return request({
    url: '/search_address.php',
    params: {p,addr}
  })
}