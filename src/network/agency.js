import {request} from './request'

// 增
export function addAgency(info) {
  let formData = new FormData();
  formData.append('user_id',info.user_id);
  formData.append('brand',info.brand);
  formData.append('storage_link',info.storage_link);
  formData.append('account_type',info.account_type);
  formData.append('size',info.size.join(','));
  formData.append('discount_type',info.discount_type);
  formData.append('discount_code',info.discount_code);
  formData.append('order_num',info.order_num);
  formData.append('interval',info.interval);
  formData.append('giftcard_type',info.giftcard_type);
  // let giftcards = info.giftcards;
  let giftcards = info.giftcards.filter(item=>{return item.right==true||item.right=='true'})
  console.log(giftcards);
  formData.append('giftcards',JSON.stringify(giftcards));
  info.price = parseFloat(info.price).toFixed(2)
  formData.append('price',info.price*100);
  return request({
    method: 'POST',
    url: '/add_agency.php',
    data: formData
  })
}
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
  formData.append('start_date',info.start_date);
  formData.append('valid_date',info.valid_date);
  formData.append('brand',info.brand);
  return request({
    method: 'POST',
    url: '/add_discount.php',
    data: formData
  })
}
export function addAccount(info) {
  let formData = new FormData();
  formData.append('card_num',info.card_num);
  formData.append('psd',info.psd);
  formData.append('card_type',info.card_type);
  formData.append('brand',info.brand);
  return request({
    method: 'POST',
    url: '/add_account.php',
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
export function delAccount(account_ID) {
  let formData = new FormData();
  formData.append('account_ID',account_ID);
  return request({
    method: 'POST',
    url: '/del_account.php',
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
export function getAccount(p,brand) {
  return request({
    url: '/get_account_list.php',
    params: {p,brand}
  })
}
export function filterAgency(filter,value,p) {
  return request({
    url: '/filter_agency.php',
    params: {filter,value,p}
  })
}
export function filterDiscount(filter,value,p) {
  return request({
    url: '/filter_discount.php',
    params: {filter,value,p}
  })
}
export function filterAccount(filter,value,p,brand) {
  return request({
    url: '/filter_account.php',
    params: {filter,value,p,brand}
  })
}
// 改
export function changeAgency(info) {
  let formData = new FormData()
  formData.append('agency_ID',info.agency_ID);
  formData.append('agency_status',info.agency_status);
  return request({
    method: 'POST',
    url: '/change_agency.php',
    data: formData
  })
}
export function changeAgencyPay(info) {
  let formData = new FormData()
  formData.append('agency_ID',info.agency_ID);
  formData.append('pay_status',info.pay_status);
  return request({
    method: 'POST',
    url: '/change_agency_pay_status.php',
    data: formData
  })
}
export function changeAccount(info) {
  let formData = new FormData()
  formData.append('account_ID',info.account_ID);
  formData.append('psd',info.psd);
  formData.append('card_type',info.card_type);
  formData.append('brand',info.brand);
  return request({
    method: 'POST',
    url: '/edit_account.php',
    data: formData
  })
}
export function getCrawlerGiftcard(info) {
  return request({
    url: '/get_crawler_giftcard.php',
    params: {
      'brand':info.brand,
      'card_num':info.card_num,
      'pin':info.pin
    }
  })
}

export function editAgency(info) {
  let formData = new FormData()
  formData.append('agency_ID',info.agency_ID)
  formData.append('price',parseInt(parseFloat(info.price)*100))
  return request({
    method: 'POST',
    url: '/edit_agency.php',
    data: formData
  })
}
export function delAgency(agency_ID) {
  let formData = new FormData()
  formData.append('agency_ID',agency_ID)
  return request({
    method: 'POST',
    url: '/del_agency.php',
    data: formData
  })
}