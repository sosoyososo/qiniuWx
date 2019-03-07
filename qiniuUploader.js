// created by gpake
var config = {
    qiniuUploadURL: '', // 指的是上传到哪个区域,参考(https://developer.qiniu.com/kodo/manual/1671/region-endpoint),比如华东使用 http(s)://upload.qiniup.com
    qiniuImageURLPrefix: '', //bucket对应下载地址的根目录前缀,创建空间时候,七牛默认给一个,但你可以用自定义域名
    qiniuUploadToken: '', //上传时候使用的token
    qiniuUploadTokenURL: '',//服务端提供的生成token的地址
    qiniuUploadTokenFunction: null,//自定义生成token的函数,唯一参数是一个带有token的callback
    qiniuUploadTokenExpireDuration: 30 * 60 * 1000, //token超时时间,七牛默认是一小时超时,为了稳妥这里减半
}

export function needUpdateToken() {
    if (config.qiniuUploadToken &&  config.qiniuUploadTokenUpdateTimeStamp) {                
        //三十分钟内不更新
        if (Date.now() - config.qiniuUploadTokenUpdateTimeStamp < config.qiniuUploadTokenExpireDuration) {
            return false;
        }
    }
    return true;
}

export function updateConfigWithOptions(options) {
    if (options.uploadURL) {
        config.qiniuUploadURL = options.uploadURL;
    } 
    if (!config.qiniuUploadURL) {
        console.error('qiniu uploader need uploadURL');
    }
    if (options.uploadToken) {
        config.qiniuUploadToken = options.uploadToken;
        config.qiniuUploadTokenUpdateTimeStamp = Date.now();
    } else if (options.uptokenURL) {
        config.qiniuUploadTokenURL = options.uptokenURL;
    } else if(options.uptokenFunc) {
        config.qiniuUploadTokenFunction = options.uptokenFunc;
    }
    if (options.domain) {
        config.qiniuImageURLPrefix = options.domain;
    }
}

export function upload(filePath, success, fail, options) {
    if (null == filePath) {
        console.error('qiniu uploader need filePath to upload');
        return;
    }
    if (options) {
        updateConfigWithOptions(options);
    }
     if (needUpdateToken()) {
        if (config.qiniuUploadTokenURL) {
            getQiniuToken(function() {
                doUpload(filePath, success, fail, options);
            });
        } else if (config.qiniuUploadTokenFunction) {
            config.qiniuUploadTokenFunction(function(token) {
                updateConfigWithOptions({uploadToken:token})
                doUpload(filePath, success, fail, options);
            });
        } else {
            console.error('qiniu uploader need one of [uploadToken, uptokenURL, uptokenFunc]');
            return;
        }
    } else {
        doUpload(filePath, success, fail, options);
    }
}

function doUpload(filePath, success, fail, options) {
    var url = config.qiniuUploadURL;
    var fileName = filePath.split('//')[1];
    if (options && options.key) {
        fileName = options.key;
    }
    var formData = {
        'token': config.qiniuUploadToken,
        'key': fileName
    };
    wx.uploadFile({
        url: url,
        filePath: filePath,
        name: 'file',
        formData: formData,
        success: function (res) {
            var dataString = res.data
            var dataObject = JSON.parse(dataString);            
            var imageUrl = config.qiniuImageURLPrefix + dataObject.key;
            dataObject.imageURL = imageUrl;
            console.log(dataObject);
            success(dataObject);
        },
        fail: function (error) {
            console.error(error);
            fail(error);
        }
    })
}

function getQiniuToken(callback) {
  wx.request({
    url: config.qiniuUploadTokenURL,
    success: function (res) {
      var token = res.data.uploadToken;
      updateConfigWithOptions({uploadToken:token})
      if (callback) {
          callback();
      }
    },
    fail: function (error) {
      console.error(error);
    }
  })
}