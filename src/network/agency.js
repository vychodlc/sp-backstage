import {request} from './request'

// 增
export function addAgency(info) {
  let formData = new FormData();
  formData.append('user_id',info.user_id);
  formData.append('brand',info.brand);
  formData.append('storage_link',info.storage_link);
  formData.append('account_type',info.account_type);
  formData.append('size',info.size);
  formData.append('discount_type',info.discount_type);
  formData.append('discount_code',info.discount_code);
  formData.append('order_num',info.order_num);
  formData.append('interval',info.interval);
  formData.append('giftcard_type',info.giftcard_type);
  formData.append('giftcards',info.giftcards.join(''));
  formData.append('price',info.price);
  return request({
    method: 'POST',
    url: '/add_agency.php',
    data: formData
  })
}
export function addGiftcard(info) {
  console.log(info);
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
export function getAgency(p) {
  return request({
    url: '/get_agency_list.php',
    params: {p}
  })
}
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