import {request} from './request'

export function addRole(name,permissions) {
  let formData = new FormData()
  formData.append('name',name)
  // formData.append('desc',desc)
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

export function editRole(roleID,permission_text) {
  let formData = new FormData()
  formData.append('roleID',roleID)
  formData.append('permission_text',permission_text)
  return request({
    method: 'POST',
    url: '/edit_role.php',
    data: formData
  })
}