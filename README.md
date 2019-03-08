# qiNiuUploaderWx

#### 改造自 [官方推荐 https://github.com/gpake/qiniu-wxapp-sdk](https://github.com/gpake/qiniu-wxapp-sdk)

## 改动了哪里以及为什么重写

1. 删除 init(options),公开updateConfigWithOptions(options) (公开updateConfigWithOptions而非init是我感觉更合适的方式)
2. 增加token的超时判断机制(没啥好说,这个是必须的)
3. 修改qiniuUploadTokenFunction的使用方式(自我感觉好用一些而增加的)

## 使用方式
#### 方式1

```
const qiniuUploader = require('./qiniuUploader');

function uploadFile0(filePath) {
  if (qiniuUploader.needUpdateToken()) {
    return new Promise((resolve, reject) => { 
      getToken(token => {
        var options = {
          region: 'ECN',
          domain: '',
          uploadURL:'https://upload.qiniup.com/',
          uploadToken:token,      
        };
        qiniuUploader.updateConfigWithOptions(options);
        getFilePath((path) => {
          qiniuUploader.upload(filePath, resolve, reject, {key:path})
        })
      })
    })
  } else {    
    return new Promise((resolve, reject) => {
      getFilePath((path) => {
        qiniuUploader.upload(filePath, resolve, reject, {key:path})
      })
    })
  }
}
```

#### 方式2

```
function uploadFile2(filePath) {
    var options = {
      region: 'ECN', 
      domain: '',
      uploadURL:'https://upload.qiniup.com/',          
      uptokenURL:''
    };
    qiniuUploader.updateConfigWithOptions(options);    
    return new Promise((resolve, reject) => {
      getFilePath((path) => {
        qiniuUploader.upload(filePath, resolve, reject, {key:path})
      })
    })
}
```

#### 方式3
```
function uploadFile3(filePath) { 
  var options = {
      region: 'ECN', 
      domain: '',
      uploadURL:'https://upload.qiniup.com/',          
      uptokenFunc:getToken
    };
    qiniuUploader.updateConfigWithOptions(options);
    return new Promise((resolve, reject) => {
      getFilePath((path) => {
        qiniuUploader.upload(filePath, resolve, reject, {key:path})
      })
    })
}

```