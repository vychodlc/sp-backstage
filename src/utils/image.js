function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  var dataURL = canvas.toDataURL("image/" + ext);
  return dataURL;
}
function base64toBlob(base64) {
  let arr = base64.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
function blobToFile(blob, filename) {
  // edge浏览器不支持new File对象，所以用以下方法兼容
  blob.lastModifiedDate = new Date();
  blob.name = filename;
  return blob;
}
function getFileName(url) {
  // 获取到文件名
  let pos = url.lastIndexOf("/"); // 查找最后一个/的位置
  return url.substring(pos + 1); // 截取最后一个/位置到字符长度，也就是截取文件名
}

export function imgUrlToFile(url) {
  var self = this;
  var imgLink = url;
  var tempImage = new Image();
  //如果图片url是网络url，要加下一句代码
  tempImage.crossOrigin = "*";
  tempImage.onload = function() {
    var base64 = getBase64Image(tempImage);
    var imgblob = base64toBlob(base64);
    var filename = getFileName(url);
    return blobToFile(imgblob, filename);
  };
  tempImage.src = imgLink;
}

export function dataURLtoFile(dataurl) {
  // let filename = dataurl.split('/')[5];
  // let mime = filename.split('.')[1];
  // let bstr = 
  // // var arr = dataurl,
  // // mime = arr[0].match(/:(.*?);/)[1],
  // // bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  // // while(n--){
  // //   u8arr[n] = bstr.charCodeAt(n);
  // // }
  // // return new File([u8arr], filename, {type:mime});
}

export function Url2Base64(url, callback) {
  var Img = new Image(),dataURL = '';
  // Img.src = url + '?v=' + Math.random();
  Img.setAttribute('crossOrigin', 'Anonymous');
  Img.onload = function() {
    var canvas = document.createElement('canvas'),
      width = Img.width,
      height = Img.height;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(Img, 0, 0, width, height);
    dataURL = canvas.toDataURL('image/jpeg');
    return callback ? callback(dataURL) : null;
  };
}