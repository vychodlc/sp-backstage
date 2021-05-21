import {request} from './request'

// 增
export function addGiftcard(info) {
  let formData = new FormData();
  formData.append('card_num',info.card_num);
  formData.append('pin',info.pin);
  formData.append('balance',info.balance);
  formData.append('brand',info.brand);
  return request({
    method: 'POST',
    url: '/add_giftcard.php',
    data: formData
  })
}
export function addDiscount(info) {
  let formData = new FormData();
  formData.append('code',info.code);
  formData.append('type',info.type);
  formData.append('valid_date',info.valid_date);
  formData.append('brand',info.brand);
  return request({
    method: 'POST',
    url: '/add_discount.php',
    data: formData
  })
}
// 删
export function delGiftcard(giftcard_ID) {
  let formData = new FormData();
  formData.append('giftcard_ID',giftcard_ID);
  return request({
    method: 'POST',
    url: '/del_giftcard.php',
    data: formData
  })
}
export function delDiscount(discount_ID) {
  let formData = new FormData();
  formData.append('discount_ID',discount_ID);
  return request({
    method: 'POST',
    url: '/del_discount.php',
    data: formData
  })
}
// 查
export function getGiftcard(p,brand) {
  return request({
    url: '/get_giftcard_list.php',
    params: {p,brand}
  })
}
export function getDiscount(p,brand) {
  return request({
    url: '/get_discount_list.php',
    params: {p,brand}
  })
}
// 改