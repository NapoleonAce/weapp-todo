// pages/me/index.js
import wxCharts from '../../utils/wxcharts'
import todoStore from '../../store/todoStore'
import noteStore from '../../store/noteStore'

const app = getApp()

var ringChart = null
var lineChart = null
var startPos = null

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: app.globalData.userInfo,
    windowWidth: 320,
    
    todosCount: 0,
    todosUncompletedCount: 0,
    todosCompletedCount: 0,
    notesCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    this.data.userInfo = Object.assign({
      avatarUrl: '../../assets/img/logo.png',
      nickName: '未知用户'
    }, app.globalData.userInfo)

    // 获取系统消息
    try {
      var res = wx.getSystemInfoSync();
      this.data.windowWidth = res.windowWidth;
    } catch (e) {
      console.error('err: getSystemInfoSync failed!');
    }

    // update
    this.update()
  },

  /**
   * 分享
   */
  onShareAppMessage: function (options) {

  },

  syncData () {
    // 获取清单笔记信息
    this.data.todosCount = todoStore.getTodos().length
    this.data.todosCompletedCount = todoStore.getCompletedTodos().length
    this.data.todosUncompletedCount = todoStore.getUncompletedTodos().length
    this.data.notesCount = noteStore.getNotes().length

    // update
    this.update()
  },

  update(data) {
    data = data || this.data
    this.setData(data)
    this.updateChartsA()
    this.updateChartsB()
  },

  updateChartsA: function () {
    ringChart && ringChart.updateData({
      title: {
        name: [Math.round((this.data.todosCompletedCount / this.data.todosCount) * 100), '%'].join('')
      },
      series: [{
        name: '进行中',
        data: this.data.todosUncompletedCount,
        stroke: false
      }, {
        name: '已完成',
        data: this.data.todosCompletedCount,
        stroke: false
      }]
    })
  },

  updateChartsB: function () {
    var chartsData = this.getChartsBData()
    lineChart && lineChart.updateData({
      categories: chartsData.categories,
      series: [{
        name: '任务完成量',
        data: chartsData.data,
        format: function (val, name) {
          return [val, '个'].join('')
        }
      }]
    })
  },

  onReady() {
    this.renderChartsA()
    this.renderChartsB()
  },

  onShow () {
    this.syncData()
  },

  linkToTodos() {
    wx.switchTab({ url: '../todo/index' })
  },

  linkToNotes() {
    wx.switchTab({ url: '../note/index' })
  },

  renderChartsA() {
    ringChart = new wxCharts({
      animation: true,
      canvasId: 'chartsA',
      type: 'ring',
      extra: {
        ringWidth: 25,
        pie: {
          offsetAngle: -45
        }
      },
      title: {
        name: [Math.round((this.data.todosCompletedCount / this.data.todosCount) * 100), '%'].join(''),
        color: '#7cb5ec',
        fontSize: 25
      },
      subtitle: {
        name: '完成率',
        color: '#666666',
        fontSize: 15
      },
      series: [{
        name: '进行中',
        data: this.data.todosUncompletedCount,
        stroke: false
      }, {
        name: '已完成',
        data: this.data.todosCompletedCount,
        stroke: false
      }],
      disablePieStroke: true,
      width: this.data.windowWidth,
      height: 200,
      dataLabel: false,
      legend: true,
      background: '#f5f5f5',
      padding: 0
    })
  },
  getChartsBData() {
    var categories = [];
    var data = [];

    let statistics = todoStore.getStatisticsByDate()
    statistics.forEach((item) => {
      categories.push(item.completedAt)
      data.push(item.count)
    })
    return {
      categories: categories,
      data: data
    }
  },
  touchHandler: function (e) {
    lineChart.scrollStart(e);
  },
  moveHandler: function (e) {
    lineChart.scroll(e);
  },
  touchEndHandler: function (e) {
    lineChart.scrollEnd(e);
    lineChart.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  renderChartsB () {
    var chartsData = this.getChartsBData()
    lineChart = new wxCharts({
      canvasId: 'chartsB',
      type: 'line',
      categories: chartsData.categories,
      animation: true,
      series: [{
        name: '任务完成量',
        data: chartsData.data,
        format: function (val, name) {
          return [val, '个'].join('')
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        title: '完成数量 (个)',
        format: function (val) {
          return val;
        },
        min: 0
      },
      width: this.data.windowWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  }
})