import {request} from './request'

export function addRole(name,description,permissions) {
  let formData = new FormData()
  formData.append('name',name)
  formData.append('description',description)
  formData.append('permissions',JSON.stringify(permissions))
  return request({
    method: 'POST',
    url: '/add_role.php',
    data: formData
  })
}

export function getRoleList(p) {
  return request({
    url: '/get_role_list.php',
    params: {p}
  })
}

export function editRole(role_ID,permissions,name,description) {
  let formData = new FormData()
  formData.append('role_ID',role_ID)
  formData.append('name',name)
  formData.append('description',description)
  formData.append('permissions',JSON.stringify(permissions))
  return request({
    method: 'POST',
    url: '/edit_role.php',
    data: formData
  })
}

export function delRole(role_ID) {
  let formData = new FormData()
  formData.append('role_ID',role_ID)
  return request({
    method: 'POST',
    url: '/del_role.php',
    data: formData
  })
}