import { request } from "./request";

export function addTag(tag) {
  let formData = new FormData();
  formData.append('name', tag);

  return request({
    method: 'POST',
    url: '/add_tag.php',
    data: formData
  })
}

export function getTag(tag) {
  return request({
    url: '/get_tag.php',
  })
}

export function delTag(id) {
  let formData = new FormData();
  formData.append('tag_id', id);

  return request({
    method: 'POST',
    url: '/del_tag.php',
    data: formData
  })
}

export function editTag(tag) {
  let formData = new FormData();
  formData.append('tag_id', parseInt(tag.id));
  formData.append('name', tag.newname);

  return request({
    method: 'POST',
    url: '/edit_tag.php',
    data: formData
  })
}