import { request } from "./request.js"

export function addBankcardApply(info) {
  let formData = new FormData()
  formData.append('pic',info.pic.join(','))
  formData.append('addr',info.addr)
  formData.append('user_id',info.user_ID)
  return request({
    method: 'POST',
    url: '/add_bankcard_apply.php',
    data: formData
  })
}
export function changeBankcardApply(info) {
  let formData = new FormData()
  formData.append('apply_ID',info.apply_ID)
  formData.append('apply_status',info.apply_status)
  formData.append('cardnum',info.cardnum)
  return request({
    method: 'POST',
    url: '/change_bankcard_apply.php',
    data: formData
  })
}
export function changeBankcard(info) {
  let formData = new FormData()
  formData.append('bankcard_ID',info.bankcard_ID)
  formData.append('bankcard_status',info.bankcard_status)
  return request({
    method: 'POST',
    url: '/change_bankcard.php',
    data: formData
  })
}
export function editBankcardApply(info) {
  let formData = new FormData()
  formData.append('pic',info.pic.join(','))
  formData.append('addr',info.addr)
  formData.append('apply_ID',info.apply_ID)
  formData.append('bankcard_id',info.bankcard_id?info.bankcard_id:null)
  return request({
    method: 'POST',
    url: '/edit_bankcard_apply.php',
    data: formData
  })
}
export function editBankcard(info) {
  let formData = new FormData()
  formData.append('bankcard_ID',info.bankcard_ID)
  formData.append('addr',info.addr)
  formData.append('cardnum',info.cardnum)
  return request({
    method: 'POST',
    url: '/edit_bankcard.php',
    data: formData
  })
}
export function delBankcardApply(apply_ID) {
  let formData = new FormData()
  formData.append('apply_ID',apply_ID)
  return request({
    method: 'POST',
    url: '/del_bankcard_apply.php',
    data: formData
  })
}
export function delBankcard(bankcard_ID) {
  let formData = new FormData()
  formData.append('bankcard_ID',bankcard_ID)
  return request({
    method: 'POST',
    url: '/del_bankcard.php',
    data: formData
  })
}
export function filterBankcardApply(p,filter,value) {
  return request({
    url: '/filter_bankcard_apply_list.php',
    params: {filter,value,p}
  })
}
export function filterBankcard(p,filter,value) {
  return request({
    url: '/filter_bankcard_list.php',
    params: {filter,value,p}
  })
}
export function getBankcardApply(p) {
  return request({
    url: '/get_bankcard_apply_list.php',
    params: {p}
  })
}
export function getBankcard(p) {
  return request({
    url: '/get_bankcard_list.php',
    params: {p}
  })
}