<style>
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
  --secondary-gradient: linear-gradient(135deg, #ec4899, #f43f5e);
  --accent-gradient: linear-gradient(135deg, #10b981, #06b6d4);
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --background-light: #f9fafb;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.2);
}

/* 添加全局字体和重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

/* 添加自定义动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 添加自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 4px;
}
</style>
<template>
  <div class="home-page">
    <NavHeader />
     <!-- 轮播图美化 -->
<div class="carousel-wrapper">
  <!-- 添加装饰元素 -->
  <div class="decorative-circle top-left"></div>
  <div class="decorative-circle bottom-right"></div>
  
  <div class="carousel-container" @mouseenter="stopCarousel" @mouseleave="startCarousel">
    <!-- 轮播控制按钮 -->
    <button class="carousel-control prev" @click="goToSlide(currentIndex - 1 < 0 ? 5 : currentIndex - 1)">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button class="carousel-control next" @click="goToSlide(currentIndex + 1 > 5 ? 0 : currentIndex + 1)">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
    
    <div class="carousel" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <!-- 轮播项添加动态效果类 -->
      <div class="carousel-item snow-scene animate-slide-in"></div>
      <div class="carousel-item cherry-blossom animate-slide-in"></div>
      <div class="carousel-item sea animate-slide-in"></div>
      <div class="carousel-item decoration animate-slide-in"></div>
      <div class="carousel-item mountain animate-slide-in"></div>
      <div class="carousel-item forest animate-slide-in"></div>
    </div>
    
    <!-- 轮播指示器 -->
    <div class="carousel-indicators">
      <span 
        v-for="(item, index) in 6" 
        :key="index"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></span>
    </div>
    
    <!-- 轮播文字内容移到外部，使用绝对定位 -->
    <div class="carousel-content" :class="{ 'active': true }">
      <h2>{{ carouselTitles[currentIndex] }}</h2>
      <p>{{ carouselDescriptions[currentIndex] }}</p>
    </div>
  </div>
</div>

<!-- 添加轮播图下方的内容区域 -->
<div class="carousel-bottom-content">
  <div class="content-wrapper">
    <h2 class="section-title">AI同心，健康同行</h2>
    <p class="section-description">
      欢迎来到心灵疗愈的世界，在这里我们致力于为您提供专业的心理健康服务。
      通过科学的方法和个性化的指导，帮助您找回内心的平静与和谐，
      开启健康、积极的生活方式。
    </p>
    <!-- 已移除原来的四个功能图标项 -->
  </div>
</div>

<!-- 底部六个功能模块 -->
<div class="bottom-features">
  <div class="content-wrapper">
    
    <div class="features-grid bottom-features-grid pretty-grid">
      <div
        v-for="(f, idx) in features"
        :key="idx"
        class="feature-card clickable pretty-card"
        @click="goFeature(f.route)"
      >
        <div class="pretty-icon">
          <div class="icon-bg"></div>
          <img :src="f.icon" alt="icon" class="feature-img" />
        </div>
        <h3 class="feature-title">{{ f.title }}</h3>
        <div class="feature-file">{{ f.file }}</div>
        <p class="feature-desc">{{ f.desc }}</p>
      </div>
    </div>
  </div>
</div>

      <!-- 左侧机器人模型 -->
      <RobotViewer 
        @robot-click="handleRobotClick" 
        @show-tip="showTipMessage" 
        ref="robotRef"
      />
      
      <!-- 机器人说话提示框 -->
      <div 
        class="tip-box" 
        v-if="showTip"
        :class="{ 'fade-in': showTip }"
      >
        <!-- 机器人头像 -->
        <div class="tip-avatar">
          <div class="robot-icon">🤖</div>
        </div>
        <!-- 消息内容 -->
        <div class="tip-content">
          <div class="tip-header">
            <span class="tip-name">健康助手</span>
            <span class="tip-time">刚刚</span>
          </div>
          <p class="tip-message">{{ tipContent }}</p>
          <div class="tip-actions">
            <button @click="handleTipAction" class="tip-btn primary">立即咨询</button>
            <button @click="showTip = false" class="tip-btn secondary">稍后再说</button>
          </div>
        </div>
        <!-- 关闭按钮 -->
        <button @click="showTip = false" class="tip-close">×</button>
      </div>
      
      <!-- AI问答框 -->
      <div 
        class="chat-box" 
        v-if="showChatBox"
        :class="{ 'fade-in': showChatBox }"
      >
        <div class="chat-header">
          <h3>AI健康问答</h3>
          <button @click="closeChatBox" class="close-btn">×</button>
        </div>
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <span class="role">{{ msg.role === 'user' ? '您' : 'AI' }}：</span>
            <span class="content">{{ msg.content }}</span>
          </div>
          <div v-if="isLoading" class="message ai loading">
            <span class="role">AI：</span>
            <span class="content">思考中<span class="loading-dots">...</span></span>
          </div>
        </div>
        <div class="chat-input">
          <textarea 
            v-model="userInput" 
            placeholder="请输入您的健康问题..." 
            rows="2"
            @keydown.enter.prevent="sendMessage"
            :disabled="isLoading"
          ></textarea>
          <button @click="sendMessage" class="send-btn" :disabled="isLoading">
            {{ isLoading ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'  // 添加onUnmounted
import { useRouter } from 'vue-router'
import NavHeader from '../components/NavHeader.vue'
import RobotViewer from '../components/RobotViewer.vue'
// 按文件命名导入专题图标
import iconDepression from '../assets/抑郁评估.png'
import iconDermatology from '../assets/皮肤病科.png'
import iconDietary from '../assets/膳食.png'
import iconEmotion from '../assets/情绪检测.png'
import iconMedication from '../assets/用药管理.png'
import iconSmart from '../assets/智能咨询.png'
//导入api配置
import { API_URLS } from '../config/api'

const showChatBox = ref(false)
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const robotRef = ref(null)
const chatMessages = ref(null)

// 提示消息状态
const showTip = ref(false)
const tipContent = ref('')

// 会话ID
const sessionId = ref('')

// 轮播图相关变量 
const currentIndex = ref(0) // 当前轮播图索引
let carouselInterval = null // 轮播定时器

// 底部功能模块数据（6 个）
const router = useRouter()

const features = ref([
  { title: '抑郁评估', file: 'DepressionAssessment.vue', desc: '基于标准自评量表的在线评估，帮助识别抑郁风险并提供个性化的干预建议和后续参考资源。', route: '/mental-health/depression-assessment', icon: iconDepression },
  { title: '皮肤筛查', file: 'DermatologyScreening.vue', desc: '上传皮肤照片进行智能分析，快速识别常见皮肤问题并给出护理建议与就医参考。', route: '/medical-assistant/skin-check', icon: iconDermatology },
  { title: '膳食分析', file: 'DietaryAnalysis.vue', desc: '记录或上传食物信息，提供营养成分与热量估算，并给出科学的膳食与改善建议。', route: '/medical-assistant/diet-analysis', icon: iconDietary },
  { title: '情绪监测', file: 'EmotionDetection.vue', desc: '通过定期问卷与日志追踪情绪波动，生成情绪趋势并提供实用的情绪调节技巧。', route: '/mental-health/emotion-detection', icon: iconEmotion },
  { title: '用药管理', file: 'MedicationManagement.vue', desc: '记录处方信息与服药计划，设置用药提醒并管理用药历史，帮助规范用药行为。', route: '/medical-assistant/drug-management', icon: iconMedication },
  { title: '智能咨询', file: 'SmartConsultation.vue', desc: '基于 AI 的智能问答助手，解答健康相关问题并提供科普与就诊建议（仅供参考）。', route: '/mental-health/smart-consultation', icon: iconSmart }
])

const goFeature = (route) => {
  if (!route) return
  router.push(route)
}

// 生成随机会话ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 滚动到消息底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

// 显示提示消息
const showTipMessage = (content) => {
  //对话框打开，则提示框不打开
    if (showChatBox.value) {
    return
  }
  tipContent.value = content
  showTip.value = true
  setTimeout(() => {
    showTip.value = false
  }, 8000)
}

// 处理机器人点击事件
const handleRobotClick = () => {
  console.log('收到robot-click事件，打开聊天框')
  showChatBox.value = true
  // 如果首次打开，显示默认欢迎消息
  if (messages.value.length === 0) {
    messages.value.push({
      role: 'ai',
      content: '我是你的网站助手，你可以询问我任何关于健康、医疗、心理健康等方面的问题。'
    })
    scrollToBottom()
  }
  else {
    // 如果已经有消息历史，仍然滚动到底部
    scrollToBottom()
  }

  // 聚焦到输入框
  nextTick(() => {
    const textarea = document.querySelector('.chat-input textarea')
    if (textarea) {
      textarea.focus()
    }
  })
}


// 处理提示框操作
const handleTipAction = () => {
  showTip.value = false
  handleRobotClick()
}

// 关闭聊天框
const closeChatBox = () => {
  showChatBox.value = false
  userInput.value = ''
}

// 调用后端API进行问答
const callChatAPI = async (question) => {
  try {
    // 如果没有sessionId，生成一个新的
    if (!sessionId.value) {
      sessionId.value = generateSessionId()
    }

    const requestBody = {
      sessionId: sessionId.value,
      question: question
    }

    const response = await fetch(API_URLS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.code === 0) {
      return data.answer
    } else {
      throw new Error(data.message || 'API返回错误')
    }
  } catch (error) {
    console.error('调用API失败:', error)
    throw error
  }
}

// 发送消息逻辑优化 - 添加防抖处理
let sendTimeout = null
const sendMessage = async () => {
  const question = userInput.value.trim()
  if (!question || isLoading.value) return

  // 清除之前的定时器（防抖）
  if (sendTimeout) {
    clearTimeout(sendTimeout)
  }
  
  // 检查消息数量，如果超过10条就删除最早的一条
  const MAX_MESSAGES = 10
  if (messages.value.length >= MAX_MESSAGES) {
    // 删除最早的消息（跳过欢迎消息）
    const isWelcomeMessage = messages.value[0].content.includes('网站助手') || 
                            messages.value[0].content.includes('你可以询问我任何关于健康')
    const startIndex = isWelcomeMessage ? 1 : 0
    messages.value.splice(startIndex, 1)
  }

  // 添加用户消息
  messages.value.push({ 
    role: 'user', 
    content: question 
  })
  userInput.value = ''
  isLoading.value = true
  scrollToBottom()

  // 使用setTimeout避免频繁发送
  sendTimeout = setTimeout(async () => {
    try {
      // 调用后端API
      const answer = await callChatAPI(question)
      
      // 再次检查消息数量
      if (messages.value.length >= MAX_MESSAGES) {
        // 删除最早的消息（跳过欢迎消息）
        const isWelcomeMessage = messages.value[0].content.includes('网站助手') || 
                                messages.value[0].content.includes('你可以询问我任何关于健康')
        const startIndex = isWelcomeMessage ? 1 : 0
        messages.value.splice(startIndex, 1)
      }
      
      // 添加AI回复
      messages.value.push({ 
        role: 'ai', 
        content: answer 
      })
    } catch (error) {
      // 添加错误消息
      messages.value.push({ 
        role: 'ai', 
        content: '抱歉，我现在无法回答您的问题，请稍后再试。' 
      })
    } finally {
      isLoading.value = false
      scrollToBottom()
    }
  }, 300)
}



// 轮播图相关方法
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % 6
}

const goToSlide = (index) => {
  currentIndex.value = index
}

const startCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
  carouselInterval = setInterval(nextSlide, 5000) // 每5秒切换一次
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

// 页面加载时生成初始sessionId并启动轮播
onMounted(() => {
  sessionId.value = generateSessionId()
  startCarousel() // 启动轮播图
})


// 添加组件卸载时清理定时器
onUnmounted(() => {
  stopCarousel() // 清理定时器
})

const carouselTitles = ['心灵疗愈', '健康生活', '情绪管理', '生活美学', '自然之美', '心灵静谧'];
const carouselDescriptions = [
  '在宁静中找回内心的平衡与和谐',
  '品味生活中的每一个美好瞬间',
  '如同海洋宽广的胸怀包容一切',
  '创造充满艺术感的健康生活方式',
  '感受大自然的轻抚和治愈力量',
  '在静谧中听见自己，回归平和'
];
</script>

<style scoped>
/* 页面整体样式保持不变 */
.home-page {
  min-height: 100vh;
  background: var(--background-light);
  position: relative;
  overflow-x: hidden;
}

/* 装饰性元素 */
.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  z-index: 0;
}

.decorative-circle.top-left {
  top: 10%;
  left: -5%;
  width: 300px;
  height: 300px;
  background: var(--primary-gradient);
}

.decorative-circle.bottom-right {
  bottom: -10%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: var(--secondary-gradient);
}

/* 轮播图美化样式 - 增加宽度 */
.carousel-wrapper {
  width: 100%;
  max-width: 1600px; /* 原1400px → 改为1600px，增加轮播框宽度 */
  margin: 20px auto;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  background: #000;
}

.carousel {
  display: flex;
  transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
}

.carousel-item {
  flex: 0 0 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  opacity: 0.8;
  transition: all 0.5s ease;
}

.carousel-item.animate-slide-in {
  animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(1.1);
  }
  to {
    opacity: 0.8;
    transform: scale(1);
  }
}

/* 更新主内容区域样式 */
.main-content {
  position: relative;
  min-height: calc(100vh - 400px); /* 调整最小高度计算 */
  background-color: #ffffff; /* 使用白色背景 */
  padding: 40px 20px;
  z-index: 20;
  margin-top: 20px; /* 添加顶部间距 */
  border-radius: 0; /* 移除所有圆角 */
}

/* 六张背景图 */
.snow-scene {
  background-image: url('../assets/主页图像1.png'); /* 本地雪景图片 */
}

.cherry-blossom {
  background-image: url('../assets/主页图像2.png'); /* 本地樱花图片 */
}

.sea {
  background-image: url('../assets/主页图像3.png'); /* 本地海景图片 */
}

.decoration {
  background-image: url('../assets/主页图像4.png'); /* 本地装饰图片 */
}

.mountain {
  background-image: url('../assets/主页图像5.png'); /* 本地山景图片 */
}

.forest {
  background-image: url('../assets/主页图像6.png'); /* 本地森林图片 */
}
/* 轮播图下方内容区域样式 */
.carousel-bottom-content {
  width: 100%;
  background: var(--background-light);
  padding: 40px 0 20px;
  margin-top: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-description {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto 48px;
  line-height: 1.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-item {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.feature-item h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-item p {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}


/* 更新轮播覆盖层样式 */
.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 30px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: white;
}

.carousel-overlay h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.carousel-overlay p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}
/* 轮播图控制按钮 */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.carousel-control:hover {
  background: white;
  color: var(--text-primary);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

/* 轮播指示器美化 */
.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 20;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--accent-gradient);
  transition: left 0.8s ease;
}

.indicator.active {
  background: white;
  width: 40px;
  border-radius: 6px;
}

.indicator.active::after {
  left: 0;
}

/* 轮播内容美化 */
.carousel-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3), transparent);
  color: white;
  z-index: 15;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.carousel-content.active {
  transform: translateY(0);
  opacity: 1;
}

.carousel-content h2 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  background: linear-gradient(45deg, white, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.carousel-content p {
  font-size: 20px;
  margin-bottom: 24px;
  max-width: 600px;
  opacity: 0.95;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.explore-btn {
  background: var(--accent-gradient);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  position: relative;
  overflow: hidden;
}

.explore-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.explore-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.5);
}

.explore-btn:hover::before {
  left: 100%;
}

/* 主内容区域美化 */
.main-content {
  position: relative;
  min-height: calc(100vh - 600px);
  background: white;
  margin: 30px auto;
  max-width: 1400px;
  padding: 60px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
  z-index: 20;
  overflow: hidden;
}

.main-content::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.05;
  filter: blur(60px);
}

/* 介绍文本美化 */
.intro-text {
  max-width: 800px;
  margin: 0 auto 80px;
  text-align: center;
  position: relative;
}

.intro-text h1 {
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 32px;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  position: relative;
  display: inline-block;
}

.intro-text h1::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 6px;
  background: var(--primary-gradient);
  border-radius: 3px;
}

.intro-text p {
  font-size: 20px;
  line-height: 1.8;
  color: var(--text-secondary);
  opacity: 1;
  position: relative;
  z-index: 1;
}

/* 功能卡片美化 */
.features-section {
  max-width: 1400px;
  margin: 60px auto 100px;
  padding: 0 20px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-15px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.card-icon {
  font-size: 64px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  transition: all 0.3s ease;
}

.feature-card:hover .card-icon {
  background: var(--primary-gradient);
  color: white;
  transform: scale(1.1) rotate(15deg);
}

.feature-card h3 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 20px 0;
  background: var(--text-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 28px 0;
  min-height: 90px;
}

.card-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.card-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.card-btn:hover::before {
  left: 100%;
}

/* 底部六个功能模块样式 */
.bottom-features {
  width: 100%;
  background: #ffffff;
  padding: 60px 20px 100px;
}
.bottom-features .content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.bottom-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
}
.bottom-features-grid > .feature-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 36px 16px;
}
.feature-card.clickable {
  cursor: pointer;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.feature-card.clickable:hover {
  transform: translateY(-8px);
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
}
.bottom-features .card-icon {
  font-size: 40px;
  width: 96px;
  height: 96px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.06));
}

/* 美化卡片 */
.pretty-card {
  padding: 28px 20px;
  border-radius: 18px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  border: 0.5px solid rgba(16,24,40,0.02);
  box-shadow: 0 6px 18px rgba(16,24,40,0.03);
}
.pretty-icon {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 18px;
}
.pretty-icon .icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.12));
  filter: drop-shadow(0 6px 18px rgba(16,24,40,0.06));
  transform: rotate(-8deg);
}
.pretty-icon .icon-emoji {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}
.feature-img {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 56px;
  height: 56px;
  object-fit: contain;
  z-index: 2;
}
.feature-title {
  font-size: 18px;
  margin: 8px 0 4px;
  font-weight: 700;
}
.feature-file {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.feature-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* 响应式：小于900px时改为 2 列，小于600px时改为 1 列 */
@media (max-width: 900px) {
  .bottom-features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .bottom-features-grid { grid-template-columns: repeat(1, 1fr); }
}

                    /* 聊天框美化 */
.chat-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 200;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-box.fade-in {
  animation: chatSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes chatSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 聊天框头部美化 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: var(--primary-gradient);
  color: white;
  position: relative;
}

.chat-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header h3::before {
  content: '🤖';
  font-size: 20px;
  animation: float 3s ease-in-out infinite;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* 消息区域美化 */
.chat-messages {
  height: 360px;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

.message {
  margin-bottom: 24px;
  line-height: 1.6;
  animation: messageSlideIn 0.3s ease-out;
}

.message.user {
  text-align: right;
}

.message.user .content {
  background: var(--primary-gradient);
  color: white;
  padding: 16px 20px;
  border-radius: 24px 24px 6px 24px;
  display: inline-block;
  max-width: 80%;
  text-align: left;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  font-weight: 500;
}

.message.ai .content {
  background: white;
  color: var(--text-primary);
  padding: 16px 20px;
  border-radius: 24px 24px 24px 6px;
  display: inline-block;
  max-width: 80%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.message .role {
  font-weight: 600;
  margin-right: 8px;
  font-size: 13px;
  opacity: 0.7;
  margin-bottom: 4px;
  display: block;
}

.message.user .role {
  color: var(--text-secondary);
  text-align: right;
}

.message.ai .role {
  color: var(--text-secondary);
}

/* 输入区域美化 */
.chat-input {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-input textarea {
  flex: 1;
  background: #f8fafc;
  border: 2px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 16px 20px;
  color: var(--text-primary);
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  transition: all 0.3s ease;
  font-family: inherit;
}

.chat-input textarea:focus {
  outline: none;
  border-color: var(--primary-gradient);
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.send-btn {
  padding: 0 32px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

/* 提示框美化 */
.tip-box {
  position: fixed;
  left: 380px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  z-index: 150;
  width: 350px;
  display: flex;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tip-avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

.robot-icon {
  font-size: 24px;
  color: white;
}

.tip-content {
  flex: 1;
  min-width: 0;
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tip-name {
  color: var(--primary-gradient);
  font-weight: 600;
  font-size: 16px;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tip-message {
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  word-wrap: break-word;
}

.tip-actions {
  display: flex;
  gap: 12px;
}

.tip-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.tip-btn.primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.tip-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.tip-btn.secondary {
  background: #f8fafc;
  color: var(--text-secondary);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tip-btn.secondary:hover {
  background: #f1f5f9;
}

.tip-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f8fafc;
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tip-close:hover {
  background: #f1f5f9;
  color: var(--text-primary);
  transform: rotate(90deg);
}
</style>