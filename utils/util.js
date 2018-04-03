const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封装 alert 弹出窗口
 */
const alert = (title = '提示', content = config.defaultAlertMsg) => {
  if('object' === typeof content) {
    content = this.isDev && JSON.stringify(content) || config.defaultAlertMsg
  }
  wx.showModal({
    title,
    content,
  })
}

module.exports = {
  formatTime,
  alert
}
