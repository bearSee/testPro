// 下载Blob文件
// export default function downloadData(fileName, data) {
//   if (!data) return;

//   if (window.navigator && window.navigator.msSaveOrOpenBlob) {
//   // for IE
//     window.navigator.msSaveOrOpenBlob(data, fileName);
//   } else {
//     // for Non-IE (chrome, firefox etc.)
//     const url = window.URL.createObjectURL(new Blob([data]));
//     const link = document.createElement('a');
//     link.style.display = 'none';
//     link.href = url;
//     link.setAttribute('download', fileName);

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     // 释放掉blob对象
//     window.URL.revokeObjectURL(url);
//   }
// }

function otherBro(bool, data, name) {
  // for Non-IE (chrome, firefox etc.)
  const url = bool ? data : window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // 释放掉blob对象
  window.URL.revokeObjectURL(url);
}


// 判断浏览器类型
function myBrowser() {
  // 取得浏览器的userAgent字符串
  const userAgent = navigator.userAgent;
  const isOpera = userAgent.indexOf('Opera') > -1;
  if (isOpera) {
    return 'Opera';
  }
  if (userAgent.indexOf('Firefox') > -1) {
    return 'FF';
  }
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  }
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    return 'IE';
  }
  if (userAgent.indexOf('Trident') > -1) {
    return 'Edge';
  }
  return '';
}

// IE浏览器图片保存本地
function SaveAs5(imgURL) {
  const oPop = window.open(imgURL, '', 'width=1, height=1, top=5000, left=5000');
  for (; oPop.document.readyState !== 'complete';) {
    if (oPop.document.readyState === 'complete') break;
  }
  oPop.document.execCommand('SaveAs');
  oPop.close();
}

export default function downloadData(fileName, data) {
  if (!data) return;
  const bool = typeof data === 'string';
  if (bool) {
    if (myBrowser() === 'IE' || myBrowser() === 'Edge') {
      SaveAs5(data);
    } else {
      otherBro(bool, data, fileName);
    }
  } else if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(data, fileName);
  } else {
    otherBro(bool, data, fileName);
  }
}
// //谷歌，360极速等浏览器下载
// function download(fileName, src) {
//     var $a = document.createElement('a');
//     $a.setAttribute('href', src);
//     $a.setAttribute('download', fileName);

//     var evObj = document.createEvent('MouseEvents');
//     evObj.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
//     $a.dispatchEvent(evObj);
// };
