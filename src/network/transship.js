import { request } from "./request";

export function post(token) {
  let formData = new FormData();
  formData.append('token',token);
  return request({
    method: 'POST',
    url: '/post.php',
    data: formData
  })
}

export function get(id) {
  return request({
    url: '/get.php',
    params: {
      uuid: id
    }
  })
}