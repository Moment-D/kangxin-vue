<template>
  <div class="personal-center-page">
    <!-- 保留原导航栏 -->
    <NavHeader />
    
    <!-- 主体布局：左侧菜单 + 右侧内容 -->
    <div class="main-layout">
      <!-- 左侧菜单栏（增大垂直间距） -->
      <aside class="side-menu">
        <!-- 1. 个人基本信息 -->
        <div 
          class="menu-item" 
          :class="{ 'active': activeMenu === 'personalInfo', 'hover': isHovering === 'personalInfo' }"
          @click="activeMenu = 'personalInfo'"
          @mouseenter="isHovering = 'personalInfo'"
          @mouseleave="isHovering = ''"
        >
          <img src="/images/用户信息.png" alt="个人基本信息" class="menu-icon" />
          <span class="menu-text">个人基本信息</span>
        </div>

        <!-- 2. 修改密码 -->
        <div 
          class="menu-item" 
          :class="{ 'active': activeMenu === 'modifyPwd', 'hover': isHovering === 'modifyPwd' }"
          @click="activeMenu = 'modifyPwd'"
          @mouseenter="isHovering = 'modifyPwd'"
          @mouseleave="isHovering = ''"
        >
          <img src="/images/修改密码.png" alt="修改密码" class="menu-icon" />
          <span class="menu-text">修改密码</span>
        </div>

        <!-- 3. 修改信息 -->
        <div 
          class="menu-item" 
          :class="{ 'active': activeMenu === 'editInfo', 'hover': isHovering === 'editInfo' }"
          @click="activeMenu = 'editInfo'"
          @mouseenter="isHovering = 'editInfo'"
          @mouseleave="isHovering = ''"
        >
          <img src="/images/修改信息.png" alt="修改信息" class="menu-icon" />
          <span class="menu-text">修改信息</span>
        </div>

        <!-- 4. 退出登录 -->
        <div 
          class="menu-item" 
          :class="{ 'hover': isHovering === 'logout' }"
          @click="showLogoutModal = true"
          @mouseenter="isHovering = 'logout'"
          @mouseleave="isHovering = ''"
        >
          <img src="/images/退出登录.png" alt="退出登录" class="menu-icon" />
          <span class="menu-text">退出登录</span>
        </div>
      </aside>

      <!-- 右侧内容区（移除输入框上方重复文字） -->
      <main class="content-area">
        <!-- 个人基本信息 -->
        <div v-if="activeMenu === 'personalInfo'" class="content-card">
          <h2 class="content-title">个人基本信息</h2>
          <div class="info-form">
            <div class="form-item">
              <label class="form-label">用户ID</label>
              <input type="text" :value="currentUser.id || '14'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">用户名</label>
              <input type="text" :value="currentUser.username || 'wzh'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">密码</label>
              <input type="password" value="********" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">电话</label>
              <input type="text" :value="currentUser.phone || '18287099556'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">邮箱</label>
              <input type="text" :value="currentUser.email || '5201314@qq.com'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">性别</label>
              <input type="text" :value="getGenderText() || '女'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">出生日期</label>
              <input type="text" :value="formatDate(currentUser.birthDate) || '2025-12-10'" disabled class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">注册时间</label>
              <input type="text" :value="formatDateTime(currentUser.createdTime) || '2025-12-09 14:16:47'" disabled class="form-input" />
            </div>
          </div>
        </div>

        <!-- 修改密码（移除输入框上方重复文字） -->
        <div v-if="activeMenu === 'modifyPwd'" class="content-card">
          <h2 class="content-title">修改密码</h2>
          <div class="form-group">
            <!-- 移除输入框上方的重复文字，仅保留placeholder -->
            <input
              v-model="passwordIdentityValue"
              type="text"
              placeholder="请输入电话或者邮箱"
              :class="{ error: passwordIdentityError }"
              class="form-control"
            />
            <span v-if="passwordIdentityError" class="error-text">{{ passwordIdentityError }}</span>
          </div>
          <button class="submit-btn" @click="verifyIdentityForPassword">下一步</button>
        </div>

        <!-- 修改信息 -->
        <div v-if="activeMenu === 'editInfo'" class="content-card">
          <h2 class="content-title">修改个人信息</h2>
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="editForm.username"
              type="text"
              placeholder="请输入用户名"
              :class="{ error: editErrors.username }"
              class="form-control"
            />
            <span v-if="editErrors.username" class="error-text">{{ editErrors.username }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">电话</label>
            <input
              v-model="editForm.phone"
              type="tel"
              placeholder="请输入电话"
              :class="{ error: editErrors.phone }"
              class="form-control"
            />
            <span v-if="editErrors.phone" class="error-text">{{ editErrors.phone }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              v-model="editForm.email"
              type="email"
              placeholder="请输入邮箱"
              :class="{ error: editErrors.email }"
              class="form-control"
            />
            <span v-if="editErrors.email" class="error-text">{{ editErrors.email }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">性别</label>
            <div class="gender-options">
              <label class="gender-option">
                <input
                  v-model="editForm.gender"
                  type="radio"
                  name="gender"
                  value="1"
                />
                <span class="radio-custom"></span>
                男
              </label>
              <label class="gender-option">
                <input
                  v-model="editForm.gender"
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
            <label class="form-label">出生日期</label>
            <input
              v-model="editForm.birthDate"
              type="date"
              placeholder="请选择出生日期"
              :class="{ error: editErrors.birthDate }"
              class="form-control"
            />
            <span v-if="editErrors.birthDate" class="error-text">{{ editErrors.birthDate }}</span>
          </div>
          <button class="submit-btn" @click="submitEditInfo">确认修改</button>
        </div>
      </main>
    </div>

    <!-- 原有模态框 -->
    <MessagePopup 
      ref="messageRef"
      :message="messageText" 
      :type="messageType"
    />
    <div v-if="showResetPasswordModal" class="modal-overlay" @click.self="closeResetPasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>重置密码</h3>
          <button class="close-btn" @click="closeResetPasswordModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="请输入新密码"
              :class="{ error: newPasswordError }"
              class="form-control"
            />
            <span v-if="newPasswordError" class="error-text">{{ newPasswordError }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input
              v-model="confirmNewPassword"
              type="password"
              placeholder="请再次输入新密码"
              :class="{ error: confirmNewPasswordError }"
              class="form-control"
            />
            <span v-if="confirmNewPasswordError" class="error-text">{{ confirmNewPasswordError }}</span>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeResetPasswordModal">取消</button>
            <button class="btn btn-primary" @click="resetPassword">确认修改</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>确认退出</h3>
          <button class="close-btn" @click="showLogoutModal = false">×</button>
        </div>
        <div class="modal-body">
          <p class="confirm-message">确定要退出登录吗？</p>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="showLogoutModal = false">取消</button>
            <button class="btn btn-danger" @click="handleLogout">确认退出</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 保留原导入和逻辑
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavHeader from '../components/NavHeader.vue'
import MessagePopup from '../components/MessagePopup.vue'
import { PERSONAL_API } from '../config/api.js'

const router = useRouter()
const messageRef = ref(null)
const messageText = ref('')
const messageType = ref('success')
const currentUser = ref({})
const userId = ref('')
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return false
  try {
    const userInfo = JSON.parse(userInfoStr)
    return !!userInfo.id
  } catch (e) {
    return false
  }
})

// 菜单状态
const activeMenu = ref('personalInfo')
const isHovering = ref('')
const showResetPasswordModal = ref(false)
const showLogoutModal = ref(false)

// 表单相关状态
const passwordIdentityValue = ref('')
const passwordIdentityError = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const newPasswordError = ref('')
const confirmNewPasswordError = ref('')
const editForm = reactive({
  username: '',
  phone: '',
  email: '',
  gender: '1',
  birthDate: ''
})
const editErrors = reactive({
  username: '',
  phone: '',
  email: '',
  birthDate: ''
})

// 原有工具函数
const getToken = () => localStorage.getItem('token')
const getUserId = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.id || null
    } catch (e) {
      console.warn('userInfo 解析失败:', e)
      return null
    }
  }
  return null
}
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }
    return dateString
  } catch (e) {
    console.warn('日期格式化失败:', dateString, e)
    return dateString
  }
}
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  try {
    const date = new Date(dateTimeString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    console.warn('日期时间格式化失败:', dateTimeString, e)
    return dateTimeString
  }
}
const request = async (url, options = {}) => {
  const token = getToken()
  if (!token) {
    console.error('请求失败：Token不存在')
    throw new Error('未登录，请先登录')
  }
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    ...options
  }
  try {
    const response = await fetch(url, defaultOptions)
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear()
        throw new Error('登录已过期，请重新登录')
      }
      throw new Error(`请求失败，状态码：${response.status}`)
    }
    const data = await response.json()
    if (data.code !== 200) {
      throw new Error(data.msg || '操作失败')
    }
    return data
  } catch (error) {
    if (error.message.includes('登录已过期') || error.message.includes('未登录')) {
      localStorage.clear()
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
    throw error
  }
}
const showMessage = (text, type = 'success') => {
  messageText.value = text
  messageType.value = type
  if (messageRef.value) {
    messageRef.value.show()
  }
}
const getGenderText = () => {
  if (!currentUser.value.gender) return ''
  return currentUser.value.gender === 1 ? '男' : '女'
}
const loadUserInfo = async () => {
  if (!isLoggedIn.value) {
    showMessage('请先登录', 'warning')
    setTimeout(() => {
      router.push('/login')
    }, 1000)
    return
  }
  try {
    userId.value = getUserId()
    if (!userId.value) {
      throw new Error('用户信息解析失败')
    }
    const url = `${PERSONAL_API.getUserInfo}${userId.value}`
    const res = await request(url, { method: 'GET' })
    currentUser.value = res.data
    editForm.username = currentUser.value.username || ''
    editForm.phone = currentUser.value.phone || ''
    editForm.email = currentUser.value.email || ''
    editForm.gender = currentUser.value.gender ? String(currentUser.value.gender) : '1'
    editForm.birthDate = formatDate(currentUser.value.birthDate) || ''
    localStorage.setItem('userInfo', JSON.stringify(currentUser.value))
    showMessage('用户信息加载成功', 'success')
  } catch (error) {
    showMessage(`加载用户信息失败：${error.message}`, 'error')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
}
const verifyIdentityForPassword = () => {
  passwordIdentityError.value = ''
  if (!passwordIdentityValue.value) {
    passwordIdentityError.value = '请输入电话或邮箱'
    return
  }
  const isPhone = /^1[3-9]\d{9}$/.test(passwordIdentityValue.value)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passwordIdentityValue.value)
  if (!isPhone && !isEmail) {
    passwordIdentityError.value = '请输入正确的电话或邮箱格式'
    return
  }
  showResetPasswordModal.value = true
}
const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  newPassword.value = ''
  confirmNewPassword.value = ''
  newPasswordError.value = ''
  confirmNewPasswordError.value = ''
}
const resetPassword = async () => {
  let isValid = true
  newPasswordError.value = ''
  confirmNewPasswordError.value = ''
  if (!newPassword.value) {
    newPasswordError.value = '请输入新密码'
    isValid = false
  } else if (newPassword.value.length < 6) {
    newPasswordError.value = '密码至少6个字符'
    isValid = false
  }
  if (newPassword.value !== confirmNewPassword.value) {
    confirmNewPasswordError.value = '两次输入的密码不一致'
    isValid = false
  }
  if (!isValid) return
  try {
    await request(PERSONAL_API.updatePassword, {
      method: 'POST',
      body: JSON.stringify({
        id: userId.value,
        verifyValue: passwordIdentityValue.value,
        newPassword: newPassword.value
      })
    })
    showMessage('密码修改成功！请重新登录', 'success')
    closeResetPasswordModal()
    setTimeout(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    }, 1500)
  } catch (error) {
    showMessage(`密码修改失败：${error.message}`, 'error')
  }
}
const validateEditForm = () => {
  let isValid = true
  Object.keys(editErrors).forEach(key => editErrors[key] = '')
  if (!editForm.username.trim()) {
    editErrors.username = '用户名不能为空'
    isValid = false
  }
  if (editForm.phone && !/^1[3-9]\d{9}$/.test(editForm.phone)) {
    editErrors.phone = '请输入正确的手机号'
    isValid = false
  }
  if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
    editErrors.email = '请输入正确的邮箱格式'
    isValid = false
  }
  if (editForm.birthDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(editForm.birthDate)) {
      editErrors.birthDate = '请输入正确的日期格式（YYYY-MM-DD）'
      isValid = false
    }
  }
  return isValid
}
const submitEditInfo = async () => {
  if (!validateEditForm()) return
  try {
    const userData = {
      id: userId.value,
      username: editForm.username,
      phone: editForm.phone || null,
      email: editForm.email || null,
      gender: parseInt(editForm.gender),
      birthDate: editForm.birthDate || null
    }
    await request(PERSONAL_API.updateUserInfo, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
    showMessage('信息修改成功！请重新登录', 'success')
    setTimeout(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    }, 1500)
  } catch (error) {
    showMessage(`修改失败：${error.message}`, 'error')
  }
}
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('userId')
  router.push('/login')
}
onMounted(() => {
  if (isLoggedIn.value) {
    loadUserInfo()
  }
})
</script>

<style scoped>
.personal-center-page {
  min-height: 100vh;
  background:rgb(255, 255, 255);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 主体布局 */
.main-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

/* 左侧菜单栏：增大垂直间距 */
.side-menu {
  width: 180px;
  background:rgb(255, 255, 255);
  border-right: 1px solid rgb(253, 246, 236);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

/* 菜单项：增大垂直间距（调整为24px上下内边距） */
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 20px; /* 增大垂直间距 */
  font-size: 14px;
  color:rgb(89, 114, 155);
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

/* 菜单图标 */
.menu-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 悬浮状态 */
.menu-item.hover {
  background: #dceaf8;
  color:rgb(196, 86, 86);
}

/* 选中状态 */
.menu-item.active {
  background:  #cfe4f8;
  color:rgb(196, 86, 86)f;
  font-weight: 500;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  padding: 20px;
  background:rgb(252, 246, 246);
}

.content-card {
  background: #fff;
  padding: 20px;
  border: 1px solid rgb(236, 245, 255);
  border-radius: 4px;
}

.content-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 10px;
}

/* 信息表单样式 */
.info-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #666;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fafafa;
}

.form-input:disabled {
  cursor: not-allowed;
  color: #999;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 16px;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
}

.form-control.error {
  border-color: #ff4d4f;
}

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

/* 性别选择 */
.gender-options {
  display: flex;
  gap: 20px;
  padding: 8px 0;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.radio-custom {
  width: 14px;
  height: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 50%;
  display: inline-block;
  position: relative;
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

.gender-option input {
  display: none;
}

/* 提交按钮 */
.submit-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #40a9ff;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 4px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: #1890ff;
  color: #fff;
}

.btn-danger {
  background: #ff4d4f;
  color: #fff;
}

.confirm-modal {
  max-width: 350px;
}

.confirm-message {
  text-align: center;
  color: #333;
  margin-bottom: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .side-menu {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 10px;
  }
  .menu-item {
    width: auto;
    padding: 12px 16px;
  }
  .content-area {
    padding: 16px;
  }
}
</style>