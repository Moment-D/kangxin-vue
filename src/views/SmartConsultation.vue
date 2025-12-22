<template>
  <div class="smart-consultation-page">
    <!-- 使用统一的导航栏组件 -->
    <NavHeader />

    <!-- 页面标题区域 -->
    <section class="page-header">
      <div class="header-content">
        <h1>智能咨询</h1>
        <p>通过多轮交互获取个性化的心理健康建议</p>
      </div>
    </section>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 聊天容器 -->
      <div class="chat-container">
        <!-- 聊天记录区域 -->
        <div class="chat-messages" ref="chatMessages">
          <!-- 欢迎消息 -->
          <div class="message-bubble ai-message" v-if="messages.length === 0">
            <div class="message-avatar">
              <img src="/images/机器人_聊天.png" alt="智能助手" class="avatar-img" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">智能助手</span>
                <span class="message-time">{{ formatTime(new Date()) }}</span>
              </div>
              <div class="message-text">
                <p>您好！我是您的心理健康智能助手。请问有什么可以帮助您的吗？</p>
                <p>您可以和我分享您的情绪状态、心理困扰，或者咨询心理健康相关的问题。</p>
              </div>
            </div>
          </div>

          <!-- 聊天消息列表 -->
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message-bubble', message.sender === 'user' ? 'user-message' : 'ai-message']">
            <div class="message-avatar">
              <img 
                :src="message.sender === 'user' ? '/images/用户_聊天.png' : '/images/机器人_聊天.png'" 
                :alt="message.sender === 'user' ? '用户' : '智能助手'" 
                class="avatar-img"
              />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.sender === 'user' ? '我' : '智能助手' }}</span>
                <span class="message-time">{{ formatTime(new Date(message.timestamp)) }}</span>
              </div>
              <div class="message-text">{{ message.text }}</div>
            </div>
          </div>

          <!-- 打字动画 -->
          <div v-if="isTyping" class="message-bubble ai-message">
            <div class="message-avatar">
              <img src="/images/机器人_聊天.png" alt="智能助手" class="avatar-img" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">智能助手</span>
              </div>
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <!-- 情绪快捷标签 -->
          <div class="quick-emotions" v-if="showQuickEmotions">
            <button v-for="emotion in quickEmotions" :key="emotion" 
                    @click="selectQuickEmotion(emotion)" class="emotion-button">
              {{ emotion }}
            </button>
          </div>

          <!-- 输入框和发送按钮 -->
          <div class="input-container">
            <button @click="toggleQuickEmotions" class="emotion-toggle-btn">
              😊
            </button>
            <textarea
              v-model="userInput"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="请输入您的问题或分享..."
              class="chat-input"
              ref="inputRef"
              :disabled="isTyping"
              rows="2"
            ></textarea>
            <button @click="sendMessage" :disabled="!userInput.trim() || isTyping" class="send-button">
              {{ isTyping ? '发送中...' : '发送' }}
            </button>
          </div>

          <!-- 快捷问题 -->
          <div class="quick-questions">
            <span class="quick-title">快速提问：</span>
            <button v-for="question in quickQuestions" :key="question" 
                    @click="useQuickQuestion(question)" class="quick-question-btn">
              {{ question }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import NavHeader from '@/components/NavHeader.vue'
import { HEALTH_API } from '@/config/api'

// 响应式数据
const messages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const showQuickEmotions = ref(false)
const chatMessages = ref(null)
const inputRef = ref(null)
const currentSessionId = ref(null)
const lastConsultId = ref(null)

// 快捷情绪标签
const quickEmotions = [
  '我感到焦虑',
  '我很开心',
  '我有点抑郁',
  '我很愤怒',
  '我很孤独',
  '我感到压力大'
]

// 快捷问题
const quickQuestions = [
  '如何缓解焦虑？',
  '怎样改善睡眠质量？',
  '如何应对压力？',
  '怎样保持积极心态？'
]

/**
 * 获取用户ID（从localStorage）
 */
const getUserId = () => {
  try {
    // 1. 从userInfo获取
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        
        // 尝试不同的字段名
        if (userInfo.userId) {
          return Number(userInfo.userId)
        }
        if (userInfo.id) {
          return Number(userInfo.id)
        }
        if (userInfo.user && userInfo.user.id) {
          return Number(userInfo.user.id)
        }
      } catch (e) {
        console.error('解析userInfo失败:', e)
      }
    }
    
    // 2. 从token解析
    const token = localStorage.getItem('token')
    if (token) {
      try {
        let cleanToken = token.trim()
        // 去除引号
        if ((cleanToken.startsWith('"') && cleanToken.endsWith('"')) ||
            (cleanToken.startsWith("'") && cleanToken.endsWith("'"))) {
          cleanToken = cleanToken.slice(1, -1)
        }
        
        // JWT格式：header.payload.signature
        const parts = cleanToken.split('.')
        if (parts.length >= 2) {
          // Base64解码payload
          const payload = parts[1]
          // 补全Base64长度
          let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
          const pad = base64.length % 4
          if (pad) {
            base64 += new Array(5-pad).join('=')
          }
          
          const decodedStr = atob(base64)
          const decoded = JSON.parse(decodedStr)
          
          // 尝试不同的字段名
          if (decoded.userId) return Number(decoded.userId)
          if (decoded.id) return Number(decoded.id)
          if (decoded.sub) return Number(decoded.sub)
          if (decoded.user && decoded.user.id) return Number(decoded.user.id)
        }
      } catch (e) {
        console.warn('从token解析用户ID失败:', e)
      }
    }
    
    // 3. 如果都获取不到，返回null
    console.log('无法获取用户ID')
    return null
    
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

/**
 * 获取干净的Token
 */
const getCleanToken = () => {
  let token = localStorage.getItem('token') || ''
  token = token.trim()
  
  // 去除引号
  if ((token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1)
  }
  
  return token
}

/**
 * 调用后端咨询API（传递userId）
 */
const callConsultAPI = async (content) => {
  try {
    const token = getCleanToken()
    const userId = getUserId()
    
    if (!userId) {
      throw new Error('请先登录')
    }
    
    // 构建请求体，包含用户ID
    const requestBody = {
      userId: userId,           // 传递用户ID
      content: content,
      sessionId: currentSessionId.value,
      consultId: lastConsultId.value
    }
    
    // 移除空值字段
    if (!requestBody.sessionId) delete requestBody.sessionId
    if (!requestBody.consultId) delete requestBody.consultId
    
    const response = await fetch(HEALTH_API.consultChat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(requestBody)
    })
    
    const result = await response.json()
    
    if (!response.ok || result.code !== 200) {
      throw new Error(result.msg || `请求失败（${response.status}）`)
    }
    
    return result.data
    
  } catch (error) {
    console.error('咨询API调用失败:', error)
    throw error
  }
}

/**
 * 发送消息
 */
const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return

  // 添加用户消息
  const userMessage = {
    sender: 'user',
    text: userInput.value.trim(),
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  // 清空输入框
  const userContent = userInput.value.trim()
  userInput.value = ''
  showQuickEmotions.value = false

  // 滚动到底部
  scrollToBottom()

  // 显示AI正在输入
  isTyping.value = true
  
  try {
    // 调用后端API
    const aiResponse = await callConsultAPI(userContent)
    
    // 更新会话信息（内部使用，不显示给用户）
    if (aiResponse.sessionId) {
      currentSessionId.value = aiResponse.sessionId
    }
    if (aiResponse.consultId) {
      lastConsultId.value = aiResponse.consultId
    }
    
    // 添加AI消息
    const aiMessage = {
      sender: 'ai',
      text: aiResponse.aiReply,
      timestamp: new Date()
    }
    messages.value.push(aiMessage)
    
  } catch (error) {
    console.error('发送消息失败:', error)
    
    // 添加错误消息
    const errorMessage = {
      sender: 'ai',
      text: `抱歉，服务暂时不可用。${error.message.includes('登录') ? '请先登录' : '请稍后重试'}`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

/**
 * 选择快捷情绪
 */
const selectQuickEmotion = (emotion) => {
  userInput.value = emotion
  showQuickEmotions.value = false
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/**
 * 使用快捷问题
 */
const useQuickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

/**
 * 切换快捷情绪面板
 */
const toggleQuickEmotions = () => {
  showQuickEmotions.value = !showQuickEmotions.value
}

/**
 * 格式化时间
 */
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

/**
 * 组件挂载时的处理
 */
onMounted(() => {
  // 初始化时聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.smart-consultation-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 页面标题区域 */
.page-header {
  background: linear-gradient(135deg, #1890ff, #52c41a);
  padding: 20px 0;
  margin-bottom: 30px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  color: white;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  opacity: 0.9;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 聊天容器 */
.chat-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

/* 聊天记录区域 */
.chat-messages {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 消息气泡 */
.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息 */
.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: #1890ff;
  color: white;
  border-radius: 18px 18px 4px 18px;
}

/* AI消息 */
.ai-message {
  align-self: flex-start;
}

.ai-message .message-content {
  background: #f0f2f5;
  color: #333;
  border-radius: 18px 18px 18px 4px;
}

/* 消息头像 */
.message-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #f0f2f5;
}

.user-message .message-avatar {
  border-color: #e6f7ff;
}

.ai-message .message-avatar {
  border-color: #f6ffed;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 消息内容 */
.message-content {
  padding: 12px 16px;
  flex: 1;
  word-wrap: break-word;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  opacity: 0.8;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 打字动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 5px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入区域 */
.chat-input-area {
  border-top: 1px solid #e8e8e8;
  padding: 20px;
  background: #fafafa;
}

/* 快捷情绪 */
.quick-emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.emotion-button {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.emotion-button:hover {
  background: #bae7ff;
  transform: translateY(-1px);
}

/* 输入容器 */
.input-container {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.emotion-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  background: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.emotion-toggle-btn:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.3s ease;
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
  font-family: inherit;
}

.chat-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.chat-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 10px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 60px;
  align-self: stretch;
}

.send-button:hover:not(:disabled) {
  background: #40a9ff;
  transform: translateY(-1px);
}

.send-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
}

/* 快捷问题 */
.quick-questions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.quick-title {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.quick-question-btn {
  background: transparent;
  border: 1px solid #d9d9d9;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-question-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #f0f9ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content h1 {
    font-size: 24px;
  }
  
  .header-content p {
    font-size: 14px;
  }
  
  .main-content {
    padding: 0 16px 30px;
  }
  
  .chat-container {
    min-height: 500px;
    border-radius: 12px;
  }
  
  .chat-messages {
    padding: 20px;
    gap: 15px;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .message-avatar {
    width: 48px;
    height: 48px;
  }
  
  .message-text {
    font-size: 14px;
  }
  
  .chat-input-area {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .chat-messages {
    padding: 16px;
  }
  
  .message-content {
    padding: 10px 14px;
  }
  
  .input-container {
    flex-wrap: wrap;
  }
  
  .emotion-toggle-btn {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .send-button {
    padding: 8px 20px;
    font-size: 14px;
    height: auto;
  }
  
  .quick-emotions {
    gap: 6px;
  }
  
  .emotion-button {
    padding: 4px 10px;
    font-size: 13px;
  }
  
  .quick-questions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>