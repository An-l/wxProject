import config from './config.js'
import * as Mock from './mock'

/**
 * 默认请求配置
 */
const DEFAULT_REQUEST_OPTIONS = {
  url: '',
  data: {},
  header: {
    'Content-Type': 'application/json'
  },
  method: 'GET',
  dataType: 'json'
}


let util = {
  isDev: config.isDev,
  log() {
    this.isDev && console.log(...arguments)
  },
  
  /**
 * 封装 alert 弹出窗口
 */
  alert(title = '提示', content = config.defaultAlertMsg) {
    if ('object' === typeof content) {
      content = this.isDev && JSON.stringify(content) || config.defaultAlertMsg
    }
    wx.showModal({
      title,
      content,
    })
  },

  /**
   * 封装本地缓存数据
   */
  getStorageData(key, callback) {
    let self = this;
    wx.getStorage({
      key,
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (err) {
        let msg = err.errMsg || '';
        if (/getStorage:fail/.test(msg)) {
          self.setStorageData(key)
        }
      }
    });
  },

  setStorageData(key, value = '', callback) {
    wx.setStorage({
      key,
      data: value,
      success() {
        callback && callback();
      }
    })
  },

  /**
   * 封装请求方法
   */
  request(opt) {
    let self = this;
    let options = Object.assign({}, DEFAULT_REQUEST_OPTIONS, opt);
    let { url, data, header, method, dataType, mock = false } = options;

    return new Promise((resolve, reject) => {
      // mock数据请求
      if (mock) {
        let res = {
          statusCode: 200,
          data: Mock[url]
        }
        if (res && res.statusCode == 200 && res.data) {
          resolve(res.data);
        } else {
          self.alert('提示', res);
          reject(res);
        }
      } else {
        // 正常请求
        wx.request({
          url: url,
          data: data,
          header: header,
          method: method,
          dataType: dataType,
          success: function (res) {
            if (res && res.statusCode == 200 && res.data) {
              resolve(res.data)
            } else {
              self.alert('提示', res);
              reject(res);
            }
          },
          fail: function (res) {
            self.log(res);
            self.alert('提示', res);
            reject(res)
          },
          complete: function (res) { },
        })
      }
    })
  }
}

export default util