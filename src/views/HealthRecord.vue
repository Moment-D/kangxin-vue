<template>
  <div class="health-record-page">
    <!-- 导航头部 -->
    <NavHeader />
    <!-- 消息弹窗组件 -->
    <MessagePopup ref="messagePopup" />

    <!-- 页面标题栏 -->
    <div class="page-header">
      <h1>个人健康档案可视化分析</h1>
    </div>

    <main class="content">
      <!-- 顶部操作区 - 时间筛选 + 导出按钮 -->
      <div class="top-actions">
        <div class="time-filter-section">
          <label>时间范围：</label>
          <select v-model="timeRange" @change="handleTimeRangeChange">
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
            <option value="custom">自定义</option>
          </select>
          <div v-if="timeRange === 'custom'" class="custom-time">
            <input type="datetime-local" v-model="startTime" />
            <input type="datetime-local" v-model="endTime" />
            <button @click="fetchAllData">确认</button>
          </div>
        </div>
        <div class="export-section">
          <button class="export-btn" @click="showExportModal = true">
            <img src="/images/档案.png" alt="导出" class="export-icon" />
            导出健康数据
          </button>
        </div>
      </div>

      <!-- 可视化分析内容 -->
      <div class="charts-section">
        <!-- 加载中提示 -->
        <div v-if="chartLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载图表数据...</p>
        </div>

        <!-- 情绪/抑郁趋势图（白色框包裹） -->
        <div v-if="!chartLoading" class="chart-card">
          <h3 class="section-title">情绪&抑郁评估趋势</h3>
          <div class="chart-container">
            <canvas id="scoreTrendChart"></canvas>
          </div>
        </div>

        <!-- 情绪类型分布饼图（白色框包裹） -->
        <div v-if="!chartLoading" class="chart-card">
          <h3 class="section-title">情绪类型分布</h3>
          <div class="chart-container">
            <canvas id="emotionDistributionChart"></canvas>
          </div>
        </div>

        <!-- 舒缓使用统计（白色框包裹） -->
        <div v-if="!chartLoading" class="chart-card">
          <h3 class="section-title">舒缓类型使用分析</h3>
          <div class="chart-container">
            <canvas id="relaxationUsageChart"></canvas>
          </div>
        </div>

        <!-- 抑郁评估结果分布（白色框包裹） -->
        <div v-if="!chartLoading" class="chart-card">
          <h3 class="section-title">抑郁评估结果分布</h3>
          <div class="chart-container">
            <canvas id="depressionResultChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 导出模态框 -->
      <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>导出健康数据</h3>
            <button class="close-btn" @click="showExportModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>请选择导出格式：</p>
            <div class="export-options">
              <button class="format-btn" @click="exportData('pdf')">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 1H2C.9 1 0 1.9 0 3v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H2V3h16v14zM9 14H7V8h2v6zm4 0h-2V8h2v6zm3-8h-8v1h8V6z"/>
                </svg>
                PDF格式
                <small class="format-desc">包含完整报告和图表</small>
              </button>
              <button class="format-btn" @click="exportData('csv')">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 1H2C.9 1 0 1.9 0 3v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H2V3h16v14zM14 7h2v2h-2V7zm0 4h2v2h-2v-2zm0-8h2v2h-2V3zm-4 8h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-4h2v2H6v-2zm0 4h2v2H6v-2zm0-8h2v2H6V3z"/>
                </svg>
                CSV格式
                <small class="format-desc">适用于数据分析</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出进度模态框 -->
      <div v-if="showExportProgress" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>导出中...</h3>
          </div>
          <div class="modal-body">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: exportProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ exportProgress }}% 完成</p>
            <p class="progress-desc">{{ exportProgressMessage }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { Parser } from 'json2csv'
import html2pdf from 'html2pdf.js'
import NavHeader from '@/components/NavHeader.vue'
import MessagePopup from '@/components/MessagePopup.vue'
import { PERSONAL_API } from '@/config/api.js'

// Chart实例
let scoreTrendChart = null
let emotionDistributionChart = null
let relaxationUsageChart = null
let depressionResultChart = null

// 响应式数据
const showExportModal = ref(false)
const showExportProgress = ref(false)
const exportProgress = ref(0)
const exportProgressMessage = ref('正在准备数据...')
const chartLoading = ref(true)

// 获取用户ID
const getUserId = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.id || null
    } catch (e) {
      console.warn('userInfo 解析失败')
      return null
    }
  }
  return null
}
const userId = ref(getUserId())

const timeRange = ref('7d')
const startTime = ref('')
const endTime = ref('')

const userInfo = reactive({
  name: '',
  gender: '',
  phone: '',
  email: '',
  medicalConditions: '',
  allergies: ''
})

// 扩展测试数据：包含更多情绪类型
const chartData = reactive({
  scoreTrend: { 
    timeLabels: ['2025-12-13', '2025-12-14', '2025-12-15', '2025-12-16'], 
    depressionScores: [8, 10, 7, 2], 
    resultInterpretations: ['轻度', '轻度', '正常', '正常'] 
  },
  emotionDistribution: { 
    emotionTypes: ['开心', '中性', '悲伤', '愤怒', '兴奋', '焦虑', '放松'], 
    counts: [8, 5, 4, 3, 6, 2, 7], 
    emotionScores: [85, 50, 30, 25, 90, 20, 75] 
  },
  relaxationUsage: { 
    timeLabels: ['2025-12-13', '2025-12-14'], 
    relaxTypes: ['故事', '音乐'], 
    durationMap: {
      '2025-12-13': { '故事': 30, '音乐': 20 },
      '2025-12-14': { '故事': 40, '音乐': 25 }
    }, 
    totalDurationByType: { '故事':70, '音乐':45 } 
  },
  depressionResult: { 
    resultTypes: ['正常', '轻度'], 
    counts: [3, 2] 
  }
})

// 获取组件实例
const { proxy } = getCurrentInstance()

/**
 * 显示消息提示
 */
const showMessage = (content, type = 'info') => {
  proxy.$refs.messagePopup.show(content, type)
}

/**
 * 格式化时间
 */
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 构建导出数据
 */
const buildExportData = () => {
  const basicInfo = {
    姓名: userInfo.name || '未设置',
    性别: userInfo.gender || '未设置',
    电话: userInfo.phone || '未设置',
    邮箱: userInfo.email || '未设置',
    所患病症: userInfo.medicalConditions || '无',
    过敏史: userInfo.allergies || '无',
    导出时间: new Date().toLocaleString(),
    筛选时间范围: timeRange.value === '7d' ? '近7天' : timeRange.value === '30d' ? '近30天' : `自定义(${formatDateTime(startTime.value)} 至 ${formatDateTime(endTime.value)})`
  }

  const emotionData = []
  const depressionData = []
  const relaxationData = []

  return {
    basicInfo,
    emotionData,
    depressionData,
    relaxationData
  }
}

/**
 * 导出为CSV格式
 */
const exportToCSV = () => {
  try {
    const exportData = buildExportData()
    const csvData = [
      { 数据类型: '基础健康信息', ...exportData.basicInfo },
      { 数据类型: '' },
      { 数据类型: '情绪检测记录', 检测ID: '检测ID', 检测时间: '检测时间', 情绪类型: '情绪类型', 情绪评分: '情绪评分', 分析建议: '分析建议' },
      ...exportData.emotionData.map(item => ({ 数据类型: '情绪检测记录', ...item })),
      { 数据类型: '' },
      { 数据类型: '抑郁评估记录', 评估ID: '评估ID', 评估时间: '评估时间', 评估结果: '评估结果', 评估分数: '评估分数', 干预方案: '干预方案' },
      ...exportData.depressionData.map(item => ({ 数据类型: '抑郁评估记录', ...item })),
      { 数据类型: '' },
      { 数据类型: '舒缓使用记录', 记录ID: '记录ID', 使用时间: '使用时间', 舒缓类型: '舒缓类型', '使用时长(分钟)': '使用时长(分钟)', 使用效果: '使用效果' },
      ...exportData.relaxationData.map(item => ({ 数据类型: '舒缓使用记录', ...item }))
    ]

    const parser = new Parser()
    const csv = parser.parse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `健康档案_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showExportProgress.value = false
    showMessage('CSV文件导出成功！', 'success')
  } catch (error) {
    console.error('CSV导出失败：', error)
    showExportProgress.value = false
    showMessage('CSV文件导出失败，请重试！', 'error')
  }
}

/**
 * 导出为PDF格式
 */
const exportToPDF = () => {
  try {
    exportProgress.value = 0
    exportProgressMessage.value = '正在生成PDF内容...'
    const progressInterval = setInterval(() => {
      exportProgress.value += 10
      if (exportProgress.value >= 80) {
        exportProgressMessage.value = '正在下载PDF文件...'
      }
      if (exportProgress.value >= 100) {
        clearInterval(progressInterval)
      }
    }, 200)

    const exportContent = document.querySelector('.content')
    const opt = {
      margin: 10,
      filename: `健康档案_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(exportContent).save().then(() => {
      clearInterval(progressInterval)
      exportProgress.value = 100
      showExportProgress.value = false
      showMessage('PDF文件导出成功！', 'success')
    }).catch((error) => {
      clearInterval(progressInterval)
      showExportProgress.value = false
      console.error('PDF导出失败：', error)
      showMessage('PDF文件导出失败，请重试！', 'error')
    })
  } catch (error) {
    console.error('PDF导出失败：', error)
    showExportProgress.value = false
    showMessage('PDF文件导出失败，请重试！', 'error')
  }
}

/**
 * 统一导出入口
 */
const exportData = (format) => {
  showExportModal.value = false
  showExportProgress.value = true
  
  if (format === 'csv') {
    exportProgress.value = 0
    exportProgressMessage.value = '正在生成CSV数据...'
    const progressInterval = setInterval(() => {
      exportProgress.value += 20
      if (exportProgress.value >= 100) {
        clearInterval(progressInterval)
        exportToCSV()
      }
    }, 100)
  } else if (format === 'pdf') {
    setTimeout(() => {
      exportToPDF()
    }, 300)
  }
}

/**
 * 时间范围变更处理
 */
const handleTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    fetchAllData()
  }
}

/**
 * 构建请求参数
 */
const buildRequestParams = () => {
  if (!userId.value) {
    showMessage('用户未登录，请先登录', 'error')
    return null
  }
  
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-CN', { hour12: false })
  }
  
  const params = {
    userId: userId.value,
    timeRange: timeRange.value
  }
  
  if (timeRange.value === 'custom' && startTime.value && endTime.value) {
    params.startTime = formatDate(startTime.value)
    params.endTime = formatDate(endTime.value)
  }
  
  return params
}

// axios拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  config.headers['Content-Type'] = 'application/json;charset=UTF-8'
  return config
}, error => {
  showMessage('请求异常，请重试', 'error')
  return Promise.reject(error)
})

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  if (!userId.value) return
  try {
    const res = await axios.get(`${PERSONAL_API.base}/api/personal/user/${userId.value}`)
    if (res.data && res.data.data) {
      Object.assign(userInfo, res.data.data)
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

/**
 * 请求可视化数据
 */
const fetchChartData = async () => {
  if (!userId.value) {
    chartLoading.value = false
    return
  }
  chartLoading.value = true
  try {
    const params = buildRequestParams()
    if (!params) return
    
    // 并行请求4个可视化接口
    try {
      const [scoreTrendRes, emotionDistRes, relaxationUsageRes, depressionResultRes] = await Promise.all([
        axios.post(PERSONAL_API.visualization.scoreTrend, params),
        axios.post(PERSONAL_API.visualization.emotionDistribution, params),
        axios.post(PERSONAL_API.visualization.relaxationUsage, params),
        axios.post(PERSONAL_API.visualization.depressionResult, params)
      ])
      
      // 覆盖测试数据
      if (scoreTrendRes.data?.timeLabels?.length) {
        chartData.scoreTrend = scoreTrendRes.data
      }
      if (emotionDistRes.data?.emotionTypes?.length) {
        chartData.emotionDistribution = emotionDistRes.data
      }
      if (relaxationUsageRes.data?.timeLabels?.length) {
        chartData.relaxationUsage = relaxationUsageRes.data
      }
      if (depressionResultRes.data?.resultTypes?.length) {
        chartData.depressionResult = depressionResultRes.data
      }
    } catch (apiError) {
      console.warn('接口请求失败，使用测试数据：', apiError)
    }
    
    await nextTick()
    setTimeout(() => {
      initCharts()
    }, 100)
  } catch (error) {
    console.error('获取可视化数据失败：', error)
    showMessage('获取可视化数据失败，展示测试数据', 'warning')
    await nextTick()
    setTimeout(() => {
      initCharts()
    }, 100)
  } finally {
    chartLoading.value = false
  }
}

/**
 * 初始化图表
 */
const initCharts = () => {
  // 销毁原有图表
  if (scoreTrendChart) scoreTrendChart.destroy()
  if (emotionDistributionChart) emotionDistributionChart.destroy()
  if (relaxationUsageChart) relaxationUsageChart.destroy()
  if (depressionResultChart) depressionResultChart.destroy()

  // 定义情绪-颜色映射表（覆盖数据库常见情绪类型）
  const emotionColorMap = {
    "开心": "#e74c3c",    // 红色
    "中性": "#2ecc71",    // 绿色
    "悲伤": "#3498db",    // 蓝色
    "愤怒": "#c0392b",    // 深红色
    "兴奋": "#f39c12",    // 橙色
    "满足": "#9b59b6",    // 紫色
    "平静": "#1abc9c",    // 青色
    "好奇": "#16a085",    // 深青色
    "难过": "#2980b9",    // 深蓝色
    "自豪": "#8e44ad",    // 深紫色
    "沉闷": "#2c3e50",    // 深灰色
    "困惑": "#7f8c8d",    // 浅灰色
    "放松": "#f1c40f",    // 黄色
    "释然": "#d35400",    // 深橙色
    "羡慕": "#18bc9c",    // 亮青色
    "惊喜": "#9b59b6",    // 紫色
    "焦虑": "#e67e22",    // 橙色
    "无聊": "#bdc3c7",    // 淡灰色
    "不适": "#e74c3c",    // 红色
    "烦躁": "#c0392b",    // 深红色
    "积极": "#27ae60",    // 深绿色
    "思念": "#3498db",    // 蓝色
    "沮丧": "#2980b9",    // 深蓝色
    "满意": "#9b59b6",    // 紫色
    "感动": "#1abc9c"     // 青色
  }
  
  // 1. 抑郁分数趋势图
  const scoreTrendCtx = document.getElementById('scoreTrendChart')
  const scoreLabels = chartData.scoreTrend?.timeLabels || ['2025-12-13', '2025-12-14', '2025-12-15']
  const scoreData = chartData.scoreTrend?.depressionScores || [8, 10, 7]
  const scoreInterpret = chartData.scoreTrend?.resultInterpretations || ['轻度', '轻度', '正常']
  
  if (scoreTrendCtx) {
    scoreTrendCtx.width = scoreTrendCtx.parentElement.clientWidth
    scoreTrendCtx.height = 400
    scoreTrendChart = new Chart(scoreTrendCtx, {
      type: 'line',
      data: {
        labels: scoreLabels,
        datasets: [
          {
            label: '抑郁评估分数',
            data: scoreData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { text: '抑郁分数', display: true, color: '#333', font: { size: 16 } },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 14 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 14 } }
          }
        },
        plugins: {
          legend: {
            labels: { font: { size: 14 } }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const index = context.dataIndex
                return `解读：${scoreInterpret[index] || '无'}`
              }
            },
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        }
      }
    })
  }
  
  // 2. 情绪类型分布饼图
  const emotionDistCtx = document.getElementById('emotionDistributionChart')
  const emotionLabels = chartData.emotionDistribution?.emotionTypes || ['开心', '中性', '悲伤']
  const emotionCounts = chartData.emotionDistribution?.counts || [5, 3, 2]
  
  if (emotionDistCtx) {
    emotionDistCtx.width = emotionDistCtx.parentElement.clientWidth
    emotionDistCtx.height = 450 // 增加高度，适配更多图例
    emotionDistributionChart = new Chart(emotionDistCtx, {
      type: 'pie',
      data: {
        labels: emotionLabels,
        datasets: [{
          data: emotionCounts,
          // 根据情绪类型匹配对应颜色，兜底为灰色
          backgroundColor: emotionLabels.map(emotion => emotionColorMap[emotion] || '#cccccc'),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { 
              font: { size: 14 },
              padding: 15, // 增加图例间距，避免拥挤
              boxWidth: 15 // 调小图例方块宽度
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.raw || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: ${value}次 (${percentage}%)`
              }
            },
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        }
      }
    })
  }
  
  // 3. 舒缓使用堆叠柱状图
  const relaxationUsageCtx = document.getElementById('relaxationUsageChart')
  const relaxTimeLabels = chartData.relaxationUsage?.timeLabels || ['2025-12-13', '2025-12-14']
  const relaxTypes = chartData.relaxationUsage?.relaxTypes || ['故事', '音乐']
  const relaxDurationMap = chartData.relaxationUsage?.durationMap || {
    '2025-12-13': { '故事': 30, '音乐': 20 },
    '2025-12-14': { '故事': 40, '音乐': 25 }
  }
  
  if (relaxationUsageCtx) {
    relaxationUsageCtx.width = relaxationUsageCtx.parentElement.clientWidth
    relaxationUsageCtx.height = 400
    const datasets = relaxTypes.map((type, index) => ({
      label: type,
      data: relaxTimeLabels.map(time => {
        return relaxDurationMap[time]?.[type] || 0
      }),
      backgroundColor: ['#3498db', '#9b59b6', '#1abc9c', '#f1c40f'][index] || '#ccc'
    }))
    
    relaxationUsageChart = new Chart(relaxationUsageCtx, {
      type: 'bar',
      data: {
        labels: relaxTimeLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 14 } }
          }, 
          y: { 
            stacked: true, 
            title: { text: '使用时长(分钟)', display: true, color: '#333', font: { size: 16 } },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 14 } }
          }
        },
        plugins: {
          legend: {
            labels: { font: { size: 14 } }
          },
          tooltip: {
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        },
        barThickness: 60
      }
    })
  }
  
  // 4. 抑郁评估结果柱状图
  const depressionResultCtx = document.getElementById('depressionResultChart')
  const depResultTypes = chartData.depressionResult?.resultTypes || ['正常', '轻度']
  const depCounts = chartData.depressionResult?.counts || [3, 2]
  
  if (depressionResultCtx) {
    depressionResultCtx.width = depressionResultCtx.parentElement.clientWidth
    depressionResultCtx.height = 400
    depressionResultChart = new Chart(depressionResultCtx, {
      type: 'bar',
      data: {
        labels: depResultTypes,
        datasets: [{
          label: '评估次数',
          data: depCounts,
          backgroundColor: depResultTypes.map(type => {
            if (type.includes('轻度')) return '#f39c12'
            if (type.includes('中度')) return '#e67e22'
            if (type.includes('重度')) return '#e74c3c'
            return '#2ecc71'
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 14 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 14 } }
          }
        },
        plugins: {
          legend: {
            labels: { font: { size: 14 } }
          },
          tooltip: {
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        },
        barThickness: 80
      }
    })
  }
}

/**
 * 统一获取数据入口
 */
const fetchAllData = async () => {
  if (!userId.value) {
    showMessage('用户未登录，请先登录', 'error')
    return
  }
  await Promise.all([fetchUserInfo(), fetchChartData()])
}

// 页面挂载时加载数据
onMounted(() => {
  if (!userId.value) {
    showMessage('请先登录，展示测试数据', 'warning')
    chartLoading.value = false
    nextTick().then(() => {
      setTimeout(() => {
        initCharts()
      }, 100)
    })
    return
  }
  fetchAllData()
})

// 页面卸载时销毁图表
onUnmounted(() => {
  if (scoreTrendChart) scoreTrendChart.destroy()
  if (emotionDistributionChart) emotionDistributionChart.destroy()
  if (relaxationUsageChart) relaxationUsageChart.destroy()
  if (depressionResultChart) depressionResultChart.destroy()
})
</script>

<style scoped>
/* 全局样式变量 - 统一圆角配置 */
:root {
  --primary-color: #2c7be5;
  --primary-dark: #1d5fbe;
  --primary-light: #e9f0fd;
  --success-color: #00d27a;
  --warning-color: #f5a623;
  --danger-color: #e53935;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #999999;
  --border-color: #e0e0e0;
  --background-color: #f8f9fa;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12);
  --border-radius: 12px; /* 统一大圆角 */
  --border-radius-sm: 6px; /* 小圆角 */
  --border-radius-xs: 4px; /* 超小圆角 */
  --hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); /* 悬浮阴影 */
  --hover-scale: 1.02; /* 悬浮缩放 */
  --transition-default: all 0.3s ease; /* 默认过渡动画 */
}

/* 页面整体样式 */
.health-record-page {
  min-height: 100vh;
  background-color: rgb(244, 244, 245);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.page-header {
  background-color: var(--primary-color);
  color: rgb(179, 225, 157);
  padding: 24px 0;
  text-align: center;
  margin-bottom: 0;
  position: relative;
  border-radius: 0 0 var(--border-radius) var(--border-radius); /* 底部圆角 */
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 顶部操作区（统一圆角+悬浮效果） */
.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  background: #fff;
  padding: 16px 24px;
  border-radius:20px;
  box-shadow: var(--shadow-light);
  border: 1px solid #e5e7eb;
  transition: var(--transition-default);
}

/* 顶部操作区悬浮效果 */
.top-actions:hover {
  box-shadow: var(--hover-shadow);
  transform: translateY(-2px);
}

.time-filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 表单元素统一圆角 */
.time-filter-section select,
.time-filter-section input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius:20px;
  font-size: 14px;
  transition: var(--transition-default);
}

/* 表单元素聚焦效果 */
.time-filter-section select:focus,
.time-filter-section input:focus {
  outline:auto;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 123, 229, 0.1);
}

.time-filter-section button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition-default);
}

/* 按钮悬浮/聚焦效果 */
.time-filter-section button:hover,
.time-filter-section button:focus {
  background-color: var(--primary-dark);
  box-shadow: 0 2px 8px rgba(44, 123, 229, 0.3);
  outline: none;
  transform: translateY(-1px);
}

.custom-time {
  display: flex;
  gap: 8px;
  align-items: center;
}

.export-section {
  display: flex;
  justify-content: flex-end;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-default);
  font-size: 14px;
  font-weight: 500;
}

/* 导出按钮悬浮/聚焦效果 */
.export-btn:hover,
.export-btn:focus {
  background-color: var(--primary-dark);
  box-shadow: var(--hover-shadow);
  transform: translateY(-2px);
  outline: none;
}

.export-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* 加载中样式（统一圆角+悬浮效果） */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  background: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  border: 1px solid #e5e7eb;
  transition: var(--transition-default);
}

.loading-container:hover {
  box-shadow: var(--hover-shadow);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--primary-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 图表区域布局 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* 核心：图表卡片样式（统一大圆角+悬浮动效） */
.chart-card {
  background: #ffffff;
  border-radius: 18px; /* 统一大圆角 */
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: var(--transition-default); /* 统一过渡动画 */
}

/* 图表卡片悬浮效果（缩放+加深阴影） */
.chart-card:hover,
.chart-card:focus-within {
  box-shadow: var(--hover-shadow);
  transform: translateY(-4px) scale(var(--hover-scale));
  border-color:white;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  border-radius: var(--border-radius-xs); /* 标题底部边框圆角 */
}

/* 图表容器（圆角+取消溢出隐藏，适配多图例） */
.chart-container {
  height: 400px;
  position: relative;
  width: 100%;
  border-radius: 12px;
}

/* 模态框样式（全圆角+悬浮效果） */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius); /* 模态框大圆角 */
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-medium);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  border: 1px solid #e5e7eb;
  transition: var(--transition-default);
}

/* 模态框悬浮效果 */
.modal-content:hover {
  box-shadow: var(--hover-shadow);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--primary-light);
  border-radius: var(--border-radius) var(--border-radius) 0 0; /* 头部圆角 */
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-light);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* 圆形按钮 */
  transition: var(--transition-default);
}

/* 关闭按钮悬浮/聚焦效果 */
.close-btn:hover,
.close-btn:focus {
  background-color: white;
  color: var(--text-primary);
  transform: rotate(90deg) scale(1.1);
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 123, 229, 0.1);
}

.modal-body {
  padding: 24px;
  border-radius: 0 0 var(--border-radius) var(--border-radius); /* 底部圆角 */
}

.modal-body p {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 16px;
}

/* 导出选项样式（全圆角+悬浮效果） */
.export-options {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  background: var(--primary-light);
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius); /* 按钮大圆角 */
  cursor: pointer;
  transition: var(--transition-default);
  min-width: 140px;
  color: var(--primary-color);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

/* 导出格式按钮悬浮/聚焦效果 */
.format-btn:hover,
.format-btn:focus {
  background: var(--primary-color);
  color: white;
  transform: translateY(-5px) scale(1.05);
  box-shadow: var(--hover-shadow);
  outline: none;
}

.format-btn svg {
  width: 32px;
  height: 32px;
  transition: var(--transition-default);
}

.format-btn:hover svg {
  transform: scale(1.1);
}

.format-desc {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 4px;
}

.format-btn:hover .format-desc {
  color: rgba(255, 255, 255, 0.9);
}

/* 进度条样式（全圆角） */
.progress-bar {
  width: 100%;
  height: 12px;
  background-color: var(--border-color);
  border-radius: var(--border-radius-sm); /* 进度条圆角 */
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
  transition: width 0.3s ease;
  border-radius: var(--border-radius-sm); /* 进度条填充圆角 */
  box-shadow: 0 0 10px rgba(44, 123, 229, 0.5);
}

.progress-text {
  text-align: center;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0;
}

.progress-desc {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 0;
}

/* 响应式设计 - 适配小屏幕圆角 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .top-actions {
    flex-direction: column;
    align-items: flex-start;
    border-radius: var(--border-radius-sm);
  }
  
  .time-filter-section {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .custom-time {
    width: 100%;
    margin-top: 8px;
  }
  
  .chart-container {
    height: 300px;
    border-radius: var(--border-radius-xs);
  }
  
  .chart-card {
    padding: 16px;
    border-radius: var(--border-radius-sm);
  }
  
  .format-btn {
    padding: 16px 12px;
    border-radius: var(--border-radius-sm);
  }
}

@media (max-width: 480px) {
  .content {
    padding: 12px;
  }
  
  .chart-card {
    padding: 12px;
    border-radius: var(--border-radius-xs);
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .modal-content {
    border-radius: var(--border-radius-sm);
  }
}
</style>