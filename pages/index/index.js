// pages/index/index.js
import util from '../../utils/index.js'
import config from '../../utils/config.js'

let app = getApp(); //获取应用实例
let isDEV = util.isDev;

let handler = {
  data: {
    page: 1,
    pageSize: 4,
    totalSize: 0,
    hasMore: true,
    articleList: [],
    defaultImg: config.defaultImg
  },
  onLoad: function (options) {
    this.setData({
      hiddenLoading: false
    })

    this.requestArticle()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      let nextPage = this.data.page + 1;
      this.setData({
        page: nextPage
      });

      this.requestArticle()
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let title = config.defaultShareText || '';

    return {
      title: title,
      path: `/pages/index/index`,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  requestArticle() {
    util.request({
      url: 'list',
      mock: true,
      data: {
        tag: '微信热门',
        start: this.data.page || 1,
        pageSize: this.data.pageSize || 4,
        langs: config.appLang || 'en'
      }
    }).then(res => {
      // 数据正常返回
      if (res && res.status === 0 && res.data && res.data.length) {
        let articleData = res.data;
        let formatData = this.formatArticleData(articleData)
        this.renderArticle(formatData)
      }
      /*
     * 如果加载第一页就没有数据，说明数据存在异常情况
     * 处理方式：弹出异常提示信息（默认提示信息）并设置下拉加载功能不可用
     */
      else if (this.data.page === 1 && res.data && res.data.length === 0) {
        util.alert();
        this.setData({
          hasMore: false
        });
      }
      /*
     * 如果非第一页没有数据，那说明没有数据了，停用下拉加载功能即可
     */
      else if (this.data.page !== 1 && res.data && res.data.length === 0) {
        this.setData({
          hasMore: false
        });
      }
      /*
      * 返回异常错误
      * 展示后端返回的错误信息，并设置下拉加载功能不可用
      */
      else {
        util.alert('提示', res);
        this.setData({
          hasMore: false
        });
        return null;
      }
    })
  },
  /**
   * 渲染文章了表
   */
  renderArticle(data) {
    if (data && data.length) {
      let newList = this.data.articleList.concat(data)
      util.log(newList)
      this.setData({
        articleList: newList,
        hiddenLoading: true
      })
    }
  },
  // 进入详情页
  showDetail(e) {
    let dataset = e.currentTarget.dataset;
    let item = dataset && dataset.item
    let contentId = item.contentId || 0

    // 调用实现阅读标识的函数
    this.markRead(contentId)

    wx.navigateTo({
      url: `../detail/index?contentId=${contentId}`
    });
  },
  /**
   * 标记已读文章，保存在全局的visitedArticles中
   */
  markRead(contentId) {
    util.getStorageData('visited', data => {
      let newStorage = data;

      if (data) {
        // 如果当前的文章 contentId 不存在，也就是还没有阅读，就把当前的文章 contentId 拼接进去
        if (data.indexOf(contentId) === -1) {
          newStorage = `${data},${contentId}`;
        }
      } else {
        // 如果本地缓存中不存在数据
        newStorage = `${contentId}`
      }

      /*
      * 处理过后，如果 data(老数据) 与 newStorage(新数据) 不一样，说明阅读记录发生了变化
      * 不一样的话，我们就需要把新的记录重新存入缓存和 globalData 中 
      */
      if (data !== newStorage) {
        app.globalData.visitedArticles = newStorage;

        util.setStorageData('visited', newStorage, () => {
          this.resetArticles()
        })
      }
    })
  },
  // 重置data中的articleList列表
  resetArticles() {
    let old = this.data.articleList;
    let newArticles = this.formatArticleData(old);
    this.setData({
      articleList: newArticles
    });
  },
  /*
 * 格式化文章列表数据
 */
  formatArticleData(data) {
    let formatData = ''
    if (data && data.length) {
      formatData = data.map(group => {
        group.formateDate = this.dateConvert(group.date)

        if (group && group.articles) {
          let formatArticleItems = group.articles.map(item => {
            item.hasVisited = this.isVisited(item.contentId)
            return item
          })
        }
        return group
      })
    }
    return formatData
  },
  /*
  * 将原始日期字符串格式化 '2017-06-12'
  * return '今日' / 08-21 / 2017-06-12
  */
  dateConvert(dateStr) {
    if (!dateStr) {
      return ''
    }

    let today = new Date(),
      todayYear = today.getFullYear(),
      todayMonth = ('0' + (today.getMonth() + 1)).slice(-2),
      todayDay = ('0' + today.getDate()).slice(-2);

    let converStr = '';
    let orginYear = +dateStr.slice(0, 4);
    let todayFormat = `${todayYear}-${todayMonth}-${todayDay}`;

    // 今日
    if (dateStr === todayFormat) {
      converStr = '今日'
    } else if (orginYear < todayYear) {
      // 往年
      let splitStr = dateStr.split('-')
      converStr = `${splitStr[0]}年${todayMonth}月${todayDay}日`;
    } else {
      // 今年
      converStr = dateStr.slice(5).replace('-', '月') + '日'
    }
    return converStr
  },
  /*
 * 判断文章是否访问过
 * @param contentId
 */
  isVisited(contentId) {
    let visitedArticles = app.globalData && app.globalData.visitedArticles || ''
    return visitedArticles.indexOf(contentId) > -1
  }
}

Page(handler)