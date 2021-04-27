import { request } from "./request";

export function getPostList(p) {
  return request({
    url: '/get_post_list.php',
    params: {p:p}
  })
}

export function getPostDetail(id) {
  return request({
    url: '/get_post.php',
    params: {id:id}
  })
}

export function searchPost(s,p) {
  return request({
    url: '/search_post.php',
    params: {s,p}
  })
}

export function getPostFilter(filter,value,p) {
  return request({
    url: '/filter_post.php',
    params: {filter:filter,value:value,p:p}
  })
}

export function getPostFilterByTag(id,p) {
  return request({
    url: '/filter_post_by_tag.php',
    params: {id,p}
  })
}

export function addCoverImg(file) {
  let formData = new FormData();
  formData.append('cover_img',file);
  return request({
    method: 'POST',
    url: '/add_cover_img.php',
    data: formData
  })
}

export function changePostStatus(id,status,audit) {
  let formData = new FormData();
  formData.append('id',id);
  formData.append('post_status',status);
  formData.append('audit',audit);
  return request({
    method: 'POST',
    url: '/audit_post.php',
    data: formData
  })
}

export function addPost(postForm) {
  let form = new FormData();
  form.append("author", postForm.author);
  form.append("author_id", postForm.author_id);
  form.append("post_title", postForm.title);
  form.append("post_content", postForm.content);
  form.append("menu", postForm.menu);
  form.append("tags", postForm.tags);
  form.append("rank", postForm.rank);
  form.append("activity", postForm.activity);
  form.append("link", postForm.act_link);
  form.append("cover_img", postForm.cover);
  form.append("start_time", postForm.act_start_time.toString())
  form.append("end_time", postForm.act_end_time.toString());;
  return request({
    method: 'POST',
    url: '/add_post.php',
    data: form
  })
}

export function editPost(postForm) {
  let form = new FormData();
  form.append("id", postForm.id);
  form.append("author", postForm.author);
  form.append("author_id", postForm.author_id);
  form.append("post_title", postForm.title);
  form.append("post_content", postForm.content);
  form.append("menu", postForm.menu);
  form.append("tags", postForm.tags);
  form.append("rank", postForm.rank);
  form.append("activity", postForm.activity);
  form.append("link", postForm.act_link);
  form.append("cover_img", postForm.cover);
  form.append("end_time", postForm.act_end_time);
  form.append("start_time", postForm.act_start_time);
  return request({
    method: 'POST',
    url: '/edit_post.php',
    data: form
  })
}

export function delPost(id) {
  let formData = new FormData();
  formData.append('id',id);
  return request({
    method: 'POST',
    url: '/del_post.php',
    data: formData
  })
}