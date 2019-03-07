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

function updateQNConfig(token) {
    var options = {
      region: 'ECN', // 华东区
      domain: 'your bucker domain name',
      uploadURL:'https://upload.qiniup.com/',
      uploadToken:token,
    };
    qiniuUploader.updateConfigWithOptions(options);
}

function uploadFile1(filePath) {
  if (qiniuUploader.needUpdateToken()) {    
    return getQiniuUploaadToken(filePath).then(res => {
      updateQNConfig(res.token);      
      let imageUrl = pathOfAbsoluteUrl(res.imageUrl);
      qiniuUploader.upload(filePath, resolve, reject, {key:imageUrl})
    })
  } else {    
    return getQiniuUploadFileName(filePath).then(res => {            
      let imageUrl = pathOfAbsoluteUrl(res.imageUrl);
      qiniuUploader.upload(filePath, resolve, reject, {key:imageUrl})
    })
  }
}
```

### 方式2
```
const qiniuUploader = require('./qiniuUploader');

function updateQNConfig() {
    var options = {
      region: 'ECN', // 华东区
      domain: 'your bucker domain name',
      uploadURL:'https://upload.qiniup.com/',
      qiniuUploadTokenURL:'token generator service url',
    };
    qiniuUploader.updateConfigWithOptions(options);
}

function uploadFile1(filePath) {
	 updateQNConfig();      
	 return getQiniuUploadFileName(filePath).then(res => {    
	  let imageUrl = pathOfAbsoluteUrl(res.imageUrl);
	  qiniuUploader.upload(filePath, resolve, reject, {key:imageUrl})
	})     
}
```

### 方式3
```
const qiniuUploader = require('./qiniuUploader');

function updateQNConfig() {
    var options = {
      region: 'ECN', // 华东区
      domain: 'your bucker domain name',
      uploadURL:'https://upload.qiniup.com/',
      qiniuUploadTokenFunction: function(callBack) {
	      	getTokenFromServer().then(token => {
		      	callBack(token)
	      	})
      },
    };
    qiniuUploader.updateConfigWithOptions(options);
}

function uploadFile1(filePath) {
	 updateQNConfig();      
	 return getQiniuUploadFileName(filePath).then(res => {    
	  let imageUrl = pathOfAbsoluteUrl(res.imageUrl);
	  qiniuUploader.upload(filePath, resolve, reject, {key:imageUrl})
	})     
}
```