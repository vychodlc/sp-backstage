import { request } from "./request.js";

export function getData() {
  return request({
    url: '/get_panel.php'
  })
}