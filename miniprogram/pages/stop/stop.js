// pages/stop/stop.js
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.stopName
    })
    this.stopId = options.stopId
    this.loadData();
  },
  onPullDownRefresh: function () {
    this.loadData();
  },
  loadData: function () {
    var self = this;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/getNextBusByStopId?amapStopId=" + this.stopId,
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            image: "/resources/error-empty.png",
            title: res.data.message
          })
          return;
        }

        if (res.data.items.length == 0) {
          wx.showToast({
            image: "/resources/error-empty.png",
            title: '未找到该站点'
          })
          return;
        }

        var oneitem = res.data.items[0];
        wx.setNavigationBarTitle({
          title: oneitem.stopName
        })
        
        var routes = [];
        for (var h in oneitem.stops) {
          var onestop = oneitem.stops[h];
          for (var i in onestop.routes) {
            var oneroute = onestop.routes[i];
            var onebus = oneroute.buses[0];
            var item = {
              routeName: oneroute.route.routeName,
              stopId: onestop.stop.stopId,
              nextStation: oneroute.nextStation,
              targetDistance: util.formatDistance(onebus ? onebus.targetDistance : undefined),
              origin: oneroute.route.origin,
              terminal: oneroute.route.terminal,
              firstBus: util.formatBusTime(oneroute.route.firstBus),
              lastBus: util.formatBusTime(oneroute.route.lastBus),
              airPrice: oneroute.route.airPrice,
              routeId: oneroute.route.routeId
            }
            routes.push(item)
          }
        }
        self.setData({
          stopId: self.stopId,
          routes: routes
        })
      },
      fail: function (err) {
        wx.showToast({
          image: "/resources/error-network.png",
          title: '请求失败请重试',
        })
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  }
})