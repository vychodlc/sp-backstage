import { request } from "./request";

let sha1 = require('js-sha1');

export function auth(token) {
  let formData = new FormData();
  formData.append('token',token);
  return request({
    method: 'POST',
    url: '/auth.php',
    data: formData
  })
}

export function getUserInfo(id) {
  return request({
    url: '/get_user_info.php',
    params: {
      uuid: id
    }
  })
}
export function getUserInfoById(id) {
  return request({
    url: '/get_user_info.php',
    params: {
      id: id
    }
  })
}

export function login(loginForm) {
  let formData = new FormData();
  loginForm.password = sha1(loginForm.password).toString();
  formData.append('user_email',loginForm.email);
  formData.append('user_password',loginForm.password);
  return request({
    method: 'POST',
    url: '/login.php',
    data: formData
  })
}

export function register(form) {
  let formData = new FormData();
  form.password = sha1(form.password).toString();
  formData.append('user_email',form.email);
  formData.append('user_nickname',form.nickname);
  formData.append('user_password',form.password);
  return request({
    method: 'POST',
    url: '/register.php',
    data: formData
  })
}

export function getUser() {
  return request({
    url: '/get_user.php',
  })
}

export function editUserinfo(userinfo) {
  let form = new FormData();
  form.append("uuid", userinfo.uuid);
  form.append("user_email", userinfo.email);
  form.append("user_nickname", userinfo.nickname);
  form.append("user_right", userinfo.right);
  form.append("drawback_factor", userinfo.factor);
  return request({
    method: 'POST',
    url: '/edit_user_info.php',
    data: form
  })
}

export function delUser(id) {
  let form = new FormData();
  form.append("uuid", id);
  return request({
    method: 'POST',
    url: '/del_user.php',
    data: form
  })
}

export function setUserRight(id,newRight) {
  let form = new FormData();
  form.append("uuid", id);
  form.append('user_right', newRight);
  return request({
    method: 'POST',
    url: '/set_user_right.php',
    data: form
  })
}

export function getUserByEmail(user_email) {
  return request({
    url: '/get_user_by_email.php',
    params: {user_email}
  })
}

export function getUserRight(uuid) {
  return request({
    url: '/get_user_right.php',
    params: {uuid}
  })
}

export function editUserRight(uuid,permission_text) {
  let formData = new FormData()
  formData.append('uuid',uuid)
  formData.append('permission_text',JSON.stringify(permission_text))
  return request({
    method: 'POST',
    url: '/edit_user_right.php',
    data: formData
  })
}

export function getBackRight() {
  return request({
    url: '/get_back_right.php'
  })
}

export function getDrawbackFactor(user_id) {
  return request({
    url: '/get_drawback_factor.php',
    params: {user_id}
  })
}