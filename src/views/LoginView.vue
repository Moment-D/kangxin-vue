<!-- 登录页面 -->
<!-- LoginView.vue -->
<template>
  <div class="login-page">
    <NavHeader />
    <MessagePopup 
      ref="messageRef"
      :message="messageText" 
      :type="messageType"
      :duration="3000"
    />
    <div class="login-container">
      <div class="login-card">
        <!-- 添加关闭按钮 -->
        <button class="close-btn" @click="closeToHome">×</button>
        <div class="login-header">
          <h1>登录账号</h1>
          <p>欢迎回到康心智联</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              required
              :class="{ error: errors.username }"
            />
            <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              required
              :class="{ error: errors.password }"
            />
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '立即登录' }}
          </button>

          <div class="register-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import NavHeader from '../components/NavHeader.vue'
import MessagePopup from '../components/MessagePopup.vue'
import { API_URLS } from '../config/api'

const router = useRouter()
const isLoading = ref(false)
const messageRef = ref(null)
const messageText = ref('')
const messageType = ref('success')

const closeToHome = () => {
  router.push('/')
}

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

// 显示消息
const showMessage = (text, type = 'success') => {
  messageText.value = text
  messageType.value = type
  // 手动触发显示
  if (messageRef.value) {
    messageRef.value.show()
  }
}

// 表单验证
const validateForm = () => {
  let isValid = true
  
  Object.keys(errors).forEach(key => errors[key] = '')
  
  if (!form.username.trim()) {
    errors.username = '用户名不能为空'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = '密码不能为空'
    isValid = false
  }
  
  return isValid
}

// 处理登录（已添加 Token 存储逻辑）
const handleLogin = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    console.log('🚀 发送登录请求...', {
      username: form.username,
      password: '***'
    })

    const response = await fetch(API_URLS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password
      })
    })

    console.log('📨 响应状态:', response.status)
    
    const data = await response.json()
    console.log('🔍 登录接口完整响应:', JSON.stringify(data, null, 2)) 
    console.log('📊 完整响应数据:', data)

    // 根据实际数据结构判断
    if (data.success === true) {
      // 登录成功
      showMessage('登录成功！', 'success')
      console.log('✅ 登录成功，用户信息:', data.userInfo)
      
      // 保存用户信息
      if (data.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        localStorage.setItem('isLoggedIn', 'true')
      }
      
      // 核心：存储 Token（纯字符串格式，无JSON.stringify）
      if (data.token) {
        localStorage.setItem('token', data.token) // 直接存储Token字符串
        console.log('🔑 Token 已成功存储:', data.token)
      } else {
        console.warn('⚠️ 登录响应中未找到 Token 字段')
        showMessage('登录成功但未获取到 Token，部分功能可能异常', 'warning')
      }
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      // 登录失败
      const errorMessage = data.message || '登录失败'
      console.log('❌ 登录失败:', errorMessage)
      showMessage(errorMessage, 'error')
    }
  } catch (error) {
    console.error('💥 请求失败:', error)
    showMessage('网络错误，请稍后重试', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  position: relative;
  overflow: hidden;
}

/* 添加装饰性元素 */
.login-page::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 90px);
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 24px;
  padding: 50px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(24, 144, 255, 0.15),
              0 0 40px rgba(24, 144, 255, 0.08);
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 25px 70px rgba(24, 144, 255, 0.2),
              0 0 50px rgba(24, 144, 255, 0.12);
  transform: translateY(-2px);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  font-size: 24px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(24, 144, 255, 0.2);
  transform: scale(1.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

/* 添加登录图标 */
.login-header::before {
  content: '👤';
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
}

.login-header h1 {
  color: #1890ff;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.form-group label {
  color: #333;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.form-group input {
  background: #fafafa;
  border: 2px solid rgba(24, 144, 255, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  color: #333;
  font-size: 15px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

/* 添加输入框装饰效果 */
.form-group::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 8px;
  right: 8px;
  height: 50%;
  background: rgba(24, 144, 255, 0.05);
  border-radius: 16px;
  z-index: 0;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #1890ff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.1);
  transform: translateY(-2px);
}

.form-group input:focus + ::after {
  height: 60%;
}

.form-group input.error {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

.error-text {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}

.login-btn {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border: none;
  color: #fff;
  padding: 18px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 15px;
  margin-top: 24px;
  font-weight: 500;
}

.register-link a {
  color: #1890ff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  padding: 0 4px;
}

.register-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1890ff;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.register-link a:hover {
  color: #40a9ff;
}

.register-link a:hover::after {
  transform: scaleX(1);
}

/* 消息提示组件样式（局部作用域兼容） */
:deep(.message-popup) {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 600px;
  animation: slideDown 0.3s ease-out;
}

:deep(.message-content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-radius: 4px;
  font-family: "Source Han Sans SC", "Roboto", sans-serif;
  font-size: 14px;
  width: 100%;
}

/* 类型对应的背景色 */
:deep(.message-popup.primary .message-content) {
  background-color: #e8f4ff;
  color: #1890ff;
}
:deep(.message-popup.success .message-content) {
  background-color: #f0f9eb;
  color: #52c41a;
}
:deep(.message-popup.info .message-content) {
  background-color: #f4f4f5;
  color: #909399;
}
:deep(.message-popup.warning .message-content) {
  background-color: #fffbe6;
  color: #faad14;
}
:deep(.message-popup.error .message-content) {
  background-color: #fff2f0;
  color: #f5222d;
}

/* 关闭按钮 */
:deep(.close-btn) {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-left: 16px;
  padding: 0;
  line-height: 1;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .login-card {
    padding: 40px 30px;
    margin: 20px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
  
  .login-form {
    gap: 24px;
  }

  :deep(.message-popup) {
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-header::before {
    font-size: 40px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .login-btn {
    padding: 16px;
  }
}
</style>