<!-- 注册页面 -->
<!-- RegisterView.vue -->
<template>
  <div class="register-page">
    <NavHeader />
    <MessagePopup 
      ref="messageRef"
      :message="messageText" 
      :type="messageType"
    />
    <div class="register-container">
      <div class="register-card">
        <!-- 添加关闭按钮 -->
        <button class="close-btn" @click="closeToHome">×</button>
        <div class="register-header">
          <h1>注册账号</h1>
          <p>加入康心智联，开启健康管理之旅</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
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

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              required
              :class="{ error: errors.confirmPassword }"
            />
            <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
          </div>

          <div class="form-group">
            <label for="phone">手机号</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号"
              :class="{ error: errors.phone }"
            />
            <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label>性别</label>
            <div class="gender-options">
              <label class="gender-option">
                <input
                  v-model="form.gender"
                  type="radio"
                  name="gender"
                  value="1"
                />
                <span class="radio-custom"></span>
                男
              </label>
              <label class="gender-option">
                <input
                  v-model="form.gender"
                  type="radio"
                  name="gender"
                  value="2"
                />
                <span class="radio-custom"></span>
                女
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="birthDate">出生日期</label>
            <input
              id="birthDate"
              v-model="form.birthDate"
              type="date"
              :class="{ error: errors.birthDate }"
            />
            <span v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</span>
          </div>

          <button type="submit" class="register-btn" :disabled="isLoading">
            {{ isLoading ? '注册中...' : '立即注册' }}
          </button>

          <div class="login-link">
            已有账号？<router-link to="/login">立即登录</router-link>
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
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  gender: '1',
  birthDate: ''
})

const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  birthDate: ''
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
  
  // 重置错误信息
  Object.keys(errors).forEach(key => errors[key] = '')
  
  // 用户名验证
  if (!form.username.trim()) {
    errors.username = '用户名不能为空'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = '用户名至少3个字符'
    isValid = false
  }
  
  // 密码验证
  if (!form.password) {
    errors.password = '密码不能为空'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码至少6个字符'
    isValid = false
  }
  
  // 确认密码验证
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  // 手机号验证
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的手机号'
    isValid = false
  }
  
  // 邮箱验证
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入正确的邮箱格式'
    isValid = false
  }
  
  return isValid
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const response = await fetch(API_URLS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        phone: form.phone || null,
        email: form.email || null,
        gender: parseInt(form.gender),
        birthDate: form.birthDate || null
      })
    })

    const data = await response.json()
    
    if (data.code === 0) {
      // 注册成功
      showMessage('注册成功！', 'success')
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      // 注册失败
      showMessage(`注册失败：${data.message}`, 'error')
    }
  } catch (error) {
    console.error('注册失败:', error)
    showMessage('注册失败，请稍后重试', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #91d5ff;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
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

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  color: #1890ff;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.register-header p {
  color: #666;
  font-size: 16px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  padding: 14px 16px;
  color: #333;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #1890ff;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-group input.error {
  border-color: #ff4757;
}

.error-text {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
}

.gender-options {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  cursor: pointer;
}

.gender-option input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.gender-option input:checked + .radio-custom {
  border-color: #1890ff;
}

.gender-option input:checked + .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.register-btn {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border: none;
  color: #fff;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 20px;
}

.login-link a {
  color: #1890ff;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>