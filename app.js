//app.js
// 引入工具类库 
import util from './utils/index';

App({
  onLaunch: function () {
    console.log('app init...');
    this.getDevideInfo();

    // 增加初始化缓存数据功能
    util.getStorageData('visited', (data) => {
      this.globalData.visitedArticles = data;
    });
  },
  globalData: {
    user: {
      name: '',
      avator: ''
    },
    visitedArticles: '',
    deviceInfo:{}
  },
  getDevideInfo() {
    let self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.globalData.deviceInfo = res;
      }
    })
  },
})