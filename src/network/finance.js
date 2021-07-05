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
  formData.append('amount',info.amount)
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