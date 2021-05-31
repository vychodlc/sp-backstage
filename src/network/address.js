import {request} from './request'

export function addAddress(info) {
  let formData = new FormData();
  formData.append('address',info.address)
  formData.append('user_id',info.user_id)
  formData.append('phone',info.phone)
  formData.append('name',info.name)
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
export function editAddress(info) {
  let formData = new FormData();
  formData.append('address_ID',info.address_ID)
  formData.append('address',info.address)
  formData.append('name',info.name)
  formData.append('phone',info.phone)
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