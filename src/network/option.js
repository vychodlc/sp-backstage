import { request } from "./request.js"

export function addOption(info) {
  let formData = new FormData()
  formData.append('option',info.option)
  formData.append('value',info.value)
  formData.append('description',info.description)
  return request({
    method: 'POST',
    url: '/add_option.php',
    data: formData
  })
}
export function editOption(info) {
  let formData = new FormData()
  formData.append('option_ID',info.option_ID)
  formData.append('value',info.value)
  if(info.description==''||info.description==null||info.description==undefined) {
    info.description = ''
  }
  formData.append('description',info.description)
  return request({
    method: 'POST',
    url: '/edit_option.php',
    data: formData
  })
}
export function getOption(p) {
  return request({
    url: '/get_options.php',
    params: {p}
  })
}
export function delOption(option_ID) {
  let formData = new FormData()
  formData.append('option_ID',option_ID)
  return request({
    method: 'POST',
    url: '/del_option.php',
    data: formData
  })
}