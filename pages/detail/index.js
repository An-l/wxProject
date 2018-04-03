// pages/detail/index.js
import util from '../../utils/index';
import config from '../../utils/config';

// WxParse HtmlFormater 用来解析 content 文本为小程序视图
import WxParse from '../../lib/wxParse/wxParse';
// 把 html 转为化标准安全的格式
import HtmlFormater from '../../lib/htmlFormater';

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    detailData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.contentId || 0;
    this.setData({
      isFromShare: !!options.share
    });

    this.init(id);
  },

  init(contentId) {
    this.goTop()
    if (contentId) {
      this.requestDetail(contentId)
        .then(data => {
          this.configPageData(data)
        })
        .then(() => {
          this.articleRevert()
        })
    }
  },
  requestDetail(contentId) {
    return util.request({
      url: 'detail',
      mock: true,
      data: {
        source: 1
      }
    })
      .then(res => {
        let formateUpdateTime = this.formateTime(res.data.lastUpdateTime)
        // 格式化后的时间
        res.data.formateUpdateTime = formateUpdateTime
        return res.data
      })
  },
  configPageData(data) {
    if (data) {
      // 同步数据到 Model 层，Model 层数据发生变化的话，视图层会自动渲染
      this.setData({
        detailData: data
      });

      //设置标题
      let title = this.data.detailData.title || config.defaultBarTitle

      wx.setNavigationBarTitle({
        title: title
      })
    }
  },
  formateTime(timeStr = '') {
    let year = timeStr.slice(0, 4),
      month = timeStr.slice(5, 7),
      day = timeStr.slice(8, 10);
    return `${year}/${month}/${day}`;
  },
  articleRevert() {
    let htmlContent = this.data.detailData && this.data.detailData.content;
    WxParse.wxParse('article', 'html', htmlContent, this, 0);
  },
  next() {
    this.requestNextContentId()
      .then(data => {
        let contentId = data && data.contentId || 0;
        this.init(contentId);
      })
  },
  requestNextContentId() {
    let pubDate = this.data.detailData && this.data.detailData.lastUpdateTime || ''
    let contentId = this.data.detailData && this.data.detailData.contentId || 0
    return util.request({
      url: 'detail',
      mock: true,
      data: {
        tag: '微信热门',
        pubDate: pubDate,
        contentId: contentId,
        langs: config.appLang || 'en'
      }
    })
      .then(res => {
        if (res && res.status === 0 && res.data && res.data.contentId) {
          util.log(res)
          return res.data
        } else {
          util.alert('提示', '没有更多文章了!')
          return null
        }
      })
  },
  goTop() {
    this.setData({
      scrollTop: 0
    })
  },
  onShareAppMessage() {
    let title = this.data.detailData && this.data.detailData.title || config.defaultShareText;
    let contentId = this.data.detailData && this.data.detailData.contentId || 0;
    return {
      // 分享出去的内容标题
      title: title,

      // 用户点击分享出去的内容，跳转的地址
      // contentId为文章id参数；share参数作用是说明用户是从分享出去的地址进来的，我们后面会用到
      path: `/pages/detail/index?share=1&contentId=${contentId}`,

      // 分享成功
      success: function (res) { },

      // 分享失败
      fail: function (res) { }
    }
  },
  notSupportShare() {
    // deviceInfo 是用户的设备信息，我们在 app.js 中已经获取并保存在 globalData 中
    let device = app.globalData.deviceInfo;
    let sdkVersion = device && device.SDKVersion || '1.0.0';
    return /1\.0\.0|1\.0\.1|1\.1\.0|1\.1\.1/.test(sdkVersion);
  },
  share() {
    if (this.notSupportShare()) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本较低，请点击右上角分享'
      })
    }
  },
  back() {
    if (this.data.isFromShare) {
      wx.navigateTo({
        url: '../index/index'
      })
    } else {
      wx.navigateBack()
    }
  }
})