<template>
  <div class="emotion-detection-page">
    <!-- 使用统一的导航栏组件 -->
    <NavHeader />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 第一部分：标题区域 -->
      <section class="title-section">
        <h1>情绪监测与分析</h1>
      </section>
      
      <!-- 第二部分：功能介绍区域 -->
      <section class="intro-section">
        <div class="intro-content">
          <div class="intro-text">
            <h2>AI智能解析您的情绪波动</h2>
            <p>
              通过文本语义识别，精准判断当前情绪类型（如焦虑、愉悦、低落等），同时结合心理量表逻辑，生成适配的情绪调节建议、舒缓话术，以及长期心理状态追踪记录，为您的情绪健康提供轻量、专业的陪伴~
            </p>
          </div>
          <div class="intro-image">
            <img src="/images/情绪.png" alt="情绪分析" />
          </div>
        </div>
      </section>
      
      <!-- 第三部分：功能特性区域 -->
      <section class="features-section">
        <div class="section-header">
          <h2>核心功能</h2>
          <p>全面覆盖情绪管理的各个维度</p>
        </div>
        <div class="features-container">
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/智能分析.png" alt="智能分析" />
            </div>
            <h3>智能分析</h3>
            <p>基于AI技术深度分析您的情绪状态，识别多种情绪特征</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/专业建议.png" alt="专业建议" />
            </div>
            <h3>专业建议</h3>
            <p>提供个性化的心理健康建议和情感支持方案</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/可视化报告.png" alt="可视化报告" />
            </div>
            <h3>可视化报告</h3>
            <p>生成详细的可视化情绪报告，帮助您更好地了解自己</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/隐私保护.png" alt="隐私保护" />
            </div>
            <h3>隐私保护</h3>
            <p>您的数据将得到严格加密保护，确保隐私安全</p>
          </div>
        </div>
      </section>
      
      <!-- 第四部分：使用流程区域 -->
      <section class="workflow-section">
        <div class="section-header">
          <h2>使用流程</h2>
          <p>简单四步，开启情绪健康之旅</p>
        </div>
        <div class="workflow-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-icon">
              <img src="/images/个性化方案.png" alt="选择分析方式" />
            </div>
            <h4>选择分析方式</h4>
            <p>文本输入或文档上传</p>
          </div>
          
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-icon">
              <img src="/images/量化分析.png" alt="输入心情描述" />
            </div>
            <h4>输入心情描述</h4>
            <p>写下您的感受或上传日记</p>
          </div>
          
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-icon">
              <img src="/images/AI驱动.png" alt="AI分析" />
            </div>
            <h4>AI智能分析</h4>
            <p>获取精准情绪报告</p>
          </div>
          
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-icon">
              <img src="/images/咨询.png" alt="查看建议" />
            </div>
            <h4>查看专业建议</h4>
            <p>获取个性化调节方案</p>
          </div>
        </div>
      </section>
      
      <!-- 第五部分：实际分析区域 -->
      <section class="analysis-section">
        <div class="section-header">
          <h2>开始情绪分析</h2>
          <p>选择您偏好的分析方式</p>
        </div>
        
        <div class="analysis-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'text' }]"
            @click="activeTab = 'text'"
          >
            文本分析
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'document' }]"
            @click="activeTab = 'document'"
          >
            文档上传
          </button>
        </div>
        
        <!-- 文本分析内容 -->
        <div v-if="activeTab === 'text'" class="analysis-content">
          <div class="input-area">
            <textarea 
              v-model="inputText"
              placeholder="请输入您的心情描述或日记内容，我们将为您分析情绪状态..."
              rows="10"
              @input="clearError"
            ></textarea>
            <div class="input-hint">
              <span>{{ inputText.length }}/1000</span>
            </div>
          </div>
          <button 
            class="analyze-btn"
            :disabled="!isFormValid() || isLoading"
            @click="submitEmotionDetect"
          >
            {{ isLoading ? '分析中...' : '开始分析' }}
          </button>
        </div>
        
        <!-- 文档上传内容 -->
        <div v-if="activeTab === 'document'" class="analysis-content">
          <div class="document-upload-area">
            <div class="upload-box" :class="{ 'has-file': selectedFile }" @click="triggerFileUpload">
              <input 
                type="file" 
                ref="fileInput"
                accept=".txt,.doc,.docx,.pdf"
                style="display: none"
                @change="handleFileUpload"
              />
              <div class="upload-icon">
                <img src="/images/档案.png" alt="文档上传" />
              </div>
              <div v-if="!selectedFile" class="upload-text">
                <p>点击或拖拽文件到此处上传</p>
                <p class="upload-hint">支持 .txt, .doc, .docx, .pdf 格式 | 单个文件不超过20MB</p>
              </div>
              <div v-else class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                <button class="remove-file-btn" @click.stop="removeSelectedFile">× 移除</button>
              </div>
            </div>
            <button 
              class="analyze-btn"
              :disabled="!isFormValid() || isLoading"
              @click="submitEmotionDetect"
            >
              {{ isLoading ? '分析中...' : '分析文档' }}
            </button>
          </div>
        </div>
      </section>
      
      <!-- 分析结果展示 -->
      <section v-if="analysisResult" class="result-section">
        <div class="result-card">
          <h3>情绪分析结果</h3>
          <div class="result-header">
            <span class="result-time">{{ formatTime(analysisResult.detectTime) }}</span>
          </div>
          <div class="emotion-score-container">
            <div class="emotion-icon-large">
              {{ getEmotionIcon(analysisResult.emotionScore) }}
            </div>
            <div class="score-info">
              <div class="score-number">{{ analysisResult.emotionScore }}</div>
              <div class="score-label">情绪评分</div>
              <div class="score-desc">{{ getScoreDescription(analysisResult.emotionScore) }}</div>
            </div>
          </div>
          
          <div class="emotion-details">
            <div class="emotion-type">{{ analysisResult.emotionDesc || '中性' }}</div>
            <div class="emotion-description">{{ getEmotionDesc(analysisResult.emotionScore) }}</div>
          </div>
          
          <!-- 可视化引导区域 -->
          <div class="visual-guide" v-if="analysisResult.emotionScore < 40">
            <h4>呼吸放松训练</h4>
            <div class="breathing-circle" :class="{ 'breathing': isBreathing }">
              <span class="breathing-text">{{ breathingText }}</span>
            </div>
            <button class="guide-btn" @click="toggleBreathing">
              {{ isBreathing ? '停止训练' : '开始训练' }}
            </button>
          </div>
          
          <div class="suggestions">
            <h4>个性化建议</h4>
            <p>{{ filterSpecialChars(analysisResult.analysisSuggest) }}</p>
          </div>
          
          <div class="action-buttons">
            <button class="new-analysis-btn" @click="resetAnalysis">重新分析</button>
            <button class="save-report-btn" @click="saveReport">保存报告</button>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 消息提示组件 -->
    <MessagePopup 
      :message="popupMessage" 
      :type="popupType" 
      :duration="3000"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavHeader from '@/components/NavHeader.vue'
import MessagePopup from '@/components/MessagePopup.vue'

// 🔧 修正：使用完整的健康服务基础 URL（匹配后端 context-path）
const HEALTH_BASE_URL = 'http://localhost:8082/api/mental-health'
const HEALTH_API = {
  emotionDetect: `${HEALTH_BASE_URL}/api/emotion/detect/add`,
  ocrUpload: `${HEALTH_BASE_URL}/api/emotion/ocr/upload`
}

// 响应式状态
const activeTab = ref('text')
const inputText = ref('')
const selectedFile = ref(null)
const isLoading = ref(false)
const analysisResult = ref(null)
const isBreathing = ref(false)
const breathingText = ref('吸气')
let breathingInterval = null

// 提示消息状态
const popupMessage = ref('')
const popupType = ref('error')

/**
 * 清除错误提示
 */
const clearError = () => {
  popupMessage.value = ''
}

/**
 * 表单验证
 */
const isFormValid = () => {
  if (activeTab.value === 'text') {
    const text = inputText.value.trim()
    return text !== '' && text.length <= 1000
  } else if (activeTab.value === 'document') {
    return !!selectedFile.value
  }
  return false
}

/**
 * 获取干净的 Token（去除首尾引号）
 */
const getToken = () => {
  let token = localStorage.getItem('token') || ''
  token = token.trim()
  if (!token) throw new Error('未登录，请先登录')
  if ((token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1)
  }
  return token
}

/**
 * 提交情绪检测
 */
const submitEmotionDetect = async () => {
  isLoading.value = true
  try {
    const token = getToken()

    if (activeTab.value === 'text') {
      const content = inputText.value.trim()
      const requestBody = {
        inputType: '日记',
        inputContent: content
      }

      const response = await fetch(HEALTH_API.emotionDetect, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok || result.code !== 200) {
        throw new Error(result.msg || `请求失败（${response.status}）`)
      }

      analysisResult.value = result.data

    } else if (activeTab.value === 'document') {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const response = await fetch(HEALTH_API.ocrUpload, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok || result.code !== 200) {
        throw new Error(result.msg || `文件分析失败（${response.status}）`)
      }

      analysisResult.value = result.data
    }

    popupType.value = 'success'
    popupMessage.value = '分析成功！'

  } catch (err) {
    console.error('分析失败:', err)
    popupType.value = 'error'
    popupMessage.value = err.message || '分析失败，请重试'
  } finally {
    isLoading.value = false
  }
}

/**
 * 重置分析
 */
const resetAnalysis = () => {
  inputText.value = ''
  selectedFile.value = null
  analysisResult.value = null
  activeTab.value = 'text'
  isBreathing.value = false
  clearInterval(breathingInterval)
  breathingText.value = '吸气'
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

/**
 * 移除已选文件
 */
const removeSelectedFile = () => {
  selectedFile.value = null
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
  popupMessage.value = '已移除文件'
  popupType.value = 'info'
}

/**
 * 呼吸训练控制
 */
const toggleBreathing = () => {
  isBreathing.value = !isBreathing.value
  if (isBreathing.value) {
    let phase = 0
    breathingInterval = setInterval(() => {
      phase = (phase + 1) % 16
      if (phase < 4) breathingText.value = '吸气'
      else if (phase < 8) breathingText.value = '屏住'
      else if (phase < 14) breathingText.value = '呼气'
      else breathingText.value = '屏住'
    }, 1000)
  } else {
    clearInterval(breathingInterval)
    breathingText.value = '吸气'
  }
}

/**
 * 保存报告
 */
const saveReport = () => {
  if (!analysisResult.value) return
  
  const report = {
    分析时间: formatTime(analysisResult.value.detectTime),
    情绪评分: analysisResult.value.emotionScore,
    情绪状态: analysisResult.value.emotionDesc || '中性',
    详细描述: getEmotionDesc(analysisResult.value.emotionScore),
    专业建议: filterSpecialChars(analysisResult.value.analysisSuggest)
  }
  
  const reportText = Object.entries(report)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n\n')
  
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `情绪分析报告_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  popupType.value = 'success'
  popupMessage.value = '报告已保存！'
}

// --- 工具函数 ---
const formatTime = (timeStr) => {
  if (!timeStr) return new Date().toLocaleString()
  return new Date(timeStr).toLocaleString()
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const filterSpecialChars = (text) => {
  if (!text) return '保持当前状态，一切都会更好～'
  return text.replaceAll(/\[|\]|\(|\)|\{|\}/g, '').trim()
}

const triggerFileUpload = () => {
  if (!isLoading.value) {
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.click()
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    popupMessage.value = '文件大小超过20MB，请选择更小的文件'
    popupType.value = 'error'
    return
  }

  const allowedTypes = ['.doc', '.docx', '.pdf', '.txt']
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.includes(ext)) {
    popupMessage.value = '不支持的文件类型，仅支持.doc/.docx/.pdf/.txt'
    popupType.value = 'error'
    return
  }

  selectedFile.value = file
  e.target.value = ''
  popupMessage.value = `已选择文件：${file.name}`
  popupType.value = 'success'
}

const getEmotionIcon = (score) => {
  if (score >= 80) return '😊'
  if (score >= 60) return '🙂'
  if (score >= 40) return '😐'
  if (score >= 20) return '😔'
  return '😢'
}

const getScoreDescription = (score) => {
  if (score >= 80) return '非常积极'
  if (score >= 60) return '比较积极'
  if (score >= 40) return '一般'
  if (score >= 20) return '比较低落'
  return '较为沮丧'
}

const getEmotionDesc = (score) => {
  if (score >= 80) return '您当前的情绪状态非常积极，充满正能量'
  if (score >= 60) return '您的心情不错，处于积极的状态'
  if (score >= 40) return '您的情绪状态比较稳定，既不过分兴奋也不过分低落'
  if (score >= 20) return '您可能感到有些情绪低落，这是暂时的'
  return '您当前的情绪状态比较低落，建议寻求支持'
}

// 生命周期
onMounted(() => {
  // 可以在这里添加初始化代码
})

onUnmounted(() => {
  if (breathingInterval) clearInterval(breathingInterval)
})
</script>

<style scoped>
:root {
  --primary-color: #4f46e5;
  --primary-light: #e0e7ff;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-light: #f9fafb;
  --card-bg: #ffffff;
  --button-text: #ffffff; /* 新增：按钮文字颜色 */
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 页面 */
.emotion-detection-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 2rem; /* 减少顶部内边距 */
}

/* 第一部分：标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 3rem; /* 减少间距 */
  padding-top: 1rem; /* 减少顶部内边距 */
}

.title-section h1 {
  font-size: 3.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;
}

/* 第二部分：功能介绍区域 */
.intro-section {
  margin-bottom: 5rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.intro-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.intro-text h2 {
  font-size: 2.2rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.intro-text p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.intro-image {
  text-align: center;
}

.intro-image img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: float 6s ease-in-out infinite;
}

/* 第三部分：功能特性区域 */
.features-section {
  margin-bottom: 5rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.features-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-light);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 50%;
  padding: 1rem;
}

.feature-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.feature-card h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 第四部分：使用流程区域 */
.workflow-section {
  margin-bottom: 5rem;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;
}

.workflow-steps::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 15%; /* 调整箭头距离 */
  right: 15%; /* 调整箭头距离 */
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  z-index: 0;
}

.step-item {
  position: relative;
  z-index: 1;
  text-align: center;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  transition: all 0.3s ease;
}

.step-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 2;
}

.step-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 20px;
  padding: 1rem;
}

.step-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.step-item h4 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.step-item p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 第五部分：实际分析区域 - 修复按钮颜色问题 */
.analysis-section {
  background: #ffffff;
  border-radius: 24px;
  border-color: #10b981;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.analysis-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  justify-content: center;
}

/* 修复选项卡按钮颜色 */
.tab-btn {
  padding: 1rem 2.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  color: var(--text-primary); /* 确保文字颜色可见 */
}

.tab-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  color: var(--primary-color); /* 悬停时改变文字颜色 */
}

.tab-btn.active {
  background: var(--primary-color);
  color: var(--button-text); /* 使用定义的按钮文字颜色 */
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.input-area {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-area textarea {
  width: 100%;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  resize: vertical;
  min-height: 180px;
  transition: all 0.3s;
  background: white;
  font-family: inherit;
  line-height: 1.6;
  color: var(--text-primary); /* 确保文本颜色可见 */
}

.input-area textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-hint {
  text-align: right;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.document-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.upload-box {
  width: 100%;
  height: 250px;
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: white;
}

.upload-box:hover {
  border-color: var(--primary-color);
  background-color: rgba(79, 70, 229, 0.02);
  transform: translateY(-2px);
}

.upload-box.has-file {
  border-style: solid;
  border-color: var(--secondary-color);
  background: rgba(16, 185, 129, 0.02);
}

.upload-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  opacity: 0.8;
}

.upload-text p {
  margin: 0.5rem 0;
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-primary); /* 确保文字颜色可见 */
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.file-info {
  text-align: center;
  animation: fadeInUp 0.3s ease-out;
}

.file-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.file-size {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.remove-file-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* 修复分析按钮颜色 */
.analyze-btn {
  width: 100%;
  padding: 1.2rem;
  background: #9af9a4;
  color: var(--button-text); /* 使用定义的按钮文字颜色 */
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.analyze-btn:hover:not(:disabled) {
  background: #9af9a4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 结果区域 */
.result-section {
  animation: fadeInUp 0.8s ease-out;
}

.result-card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.result-card h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.result-header {
  text-align: right;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.emotion-score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

.emotion-icon-large {
  font-size: 5rem;
  animation: pulse 2s ease-in-out infinite;
}

.score-info {
  text-align: center;
}

.score-number {
  font-size: 4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.score-label {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.score-desc {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.emotion-details {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--bg-light);
  border-radius: 16px;
}

.emotion-type {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.emotion-description {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 1.1rem;
}

.visual-guide {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border: 1px solid #fbbf24;
}

.visual-guide h4 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
}

.breathing-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.breathing-circle.breathing {
  animation: breathe 8s infinite;
}

.guide-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.guide-btn:hover {
  background: #d97706;
  transform: translateY(-2px);
}

.suggestions {
  margin-bottom: 2.5rem;
  padding: 2rem;
  border-radius: 20px;
  background: var(--bg-light);
}

.suggestions h4 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
}

.suggestions p {
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.new-analysis-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-report-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-analysis-btn:hover,
.save-report-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .features-container,
  .workflow-steps {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .workflow-steps::before {
    display: none;
  }
  
  .intro-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem 1rem 2rem;
  }
  
  .title-section h1 {
    font-size: 2.5rem;
  }
  
  .intro-content {
    padding: 2rem;
  }
  
  .intro-text h2 {
    font-size: 1.8rem;
  }
  
  .features-container,
  .workflow-steps {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .analysis-section {
    padding: 2rem 1.5rem;
  }
  
  .tab-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .result-card {
    padding: 2rem 1.5rem;
  }
  
  .emotion-score-container {
    flex-direction: column;
    gap: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .new-analysis-btn,
  .save-report-btn {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .title-section h1 {
    font-size: 2rem;
  }
  
  .intro-content {
    padding: 1.5rem;
  }
  
  .analysis-section {
    padding: 1.5rem;
  }
  
  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>