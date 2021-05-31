import {request} from './request'

export function payBalance(info) {
  let formData = new FormData();
  formData.append('order_type',info.order_type)
  formData.append('id',info.id)
  return request({
    method: 'POST',
    url: '/payment_balance.php',
    data: formData
  })
}