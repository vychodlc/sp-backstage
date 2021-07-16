import {request} from './request'

export function getWithdrawl(p) {
  return request({
    url: '/get_withdrawl_list.php',
    params: {p}
  })
}

export function changeWithdrawl(info) {
  let formData = new FormData()
  formData.append('withdraw_ID',info.withdraw_ID)
  formData.append('withdraw_status',info.withdraw_status)
  return request({
    method: 'POST',
    url: '/change_withdrawl.php',
    data: formData
  })
}

export function addWithdrawl(info) {
  let formData = new FormData()
  formData.append('user_id',info.user_id)
  formData.append('amount',parseInt(info.amount)*100)
  formData.append('bankcard',info.bankcard)
  return request({
    method: 'POST',
    url: '/add_withdrawl.php',
    data: formData
  })
}

export function filterWithdrawl(filter,value,p) {
  return request({
    url: '/filter_withdrawl.php',
    params: {filter,value,p}
  })
}

export function getPayment(p) {
  return request({
    url: '/get_payment.php',
    params: {p}
  })
}

export function filterPayment(p,filter,value) {
  return request({
    url: '/filter_payment.php',
    params: {p,filter,value}
  })
}

export function addCharge(user_id,amount) {
  let formData = new FormData()
  formData.append('user_id',user_id)
  formData.append('amount',parseInt(parseFloat(amount)*100))
  return request({
    method: 'POST',
    url: '/add_charge.php',
    data: formData
  })
}

export function getCharge(p) {
  return request({
    url: '/get_charge_list.php',
    params: {p}
  })
}