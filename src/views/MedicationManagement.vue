<template>
  <div class="medicine-analysis-page">
    <!-- 导航栏 -->
    <NavHeader />
    
    <!-- 标题区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>智能药品识别与分析</h1>
        <p>上传药品图片或输入药品名称，获取专业的药品信息解析</p>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 输入方式选择 -->
      <section class="input-mode-section">
        <div class="mode-tabs">
          <button 
            class="mode-tab" 
            :class="{ active: inputMethod === 'image' }"
            @click="switchInputMode('image')"
          >
            图片识别
          </button>
          <button 
            class="mode-tab" 
            :class="{ active: inputMethod === 'text' }"
            @click="switchInputMode('text')"
          >
            文字查询
          </button>
        </div>
      </section>
      
      <!-- 图片上传区域 -->
      <section v-if="inputMethod === 'image'" class="image-upload-section">
        <div class="upload-card">
          <div 
            class="upload-area" 
            @click="triggerFileInput"
            :class="{ hasFile: imageFile }"
          >
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*"
              @change="handleFileChange"
              class="file-input"
            />
            <div v-if="!imageFile" class="upload-placeholder">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>点击上传药品图片</p>
              <p class="upload-tip">支持 JPG、PNG 格式</p>
            </div>
            <div v-if="imageFile" class="upload-preview">
              <img :src="imagePreviewUrl" alt="药品图片预览" class="preview-image" />
              <button class="remove-btn" @click="removeFile">移除</button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 文字输入区域 -->
      <section v-if="inputMethod === 'text'" class="text-input-section">
        <div class="input-card">
          <input 
            type="text" 
            v-model="medicineName"
            placeholder="请输入药品名称（如：布洛芬）"
            class="medicine-input"
            @keyup.enter="analyzeMedicine"
          />
        </div>
      </section>
      
      <!-- 错误/成功提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="!errorMessage && medicineResult" class="success-message">
        查询成功
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>正在分析药品信息...</p>
      </div>
      
      <!-- 分析按钮：查询成功后隐藏 -->
      <section class="action-section" v-if="!medicineResult">
        <button 
          class="analyze-btn"
          :disabled="isLoading || (inputMethod === 'image' && !imageFile) || (inputMethod === 'text' && !medicineName.trim())"
          @click="analyzeMedicine"
        >
          {{ isLoading ? '分析中...' : '开始分析' }}
        </button>
      </section>
      
      <!-- 结果展示区域 -->
      <section class="result-section" v-if="medicineResult">
        <div class="result-card">
          <h3>药品分析结果</h3>
          
          <div class="result-item">
            <span class="result-label">药品名称：</span>
            <span class="result-value">{{ medicineResult.medicineName }}</span>
          </div>
          
          <div class="result-item">
            <span class="result-label">用法用量：</span>
            <span class="result-value">{{ getFallbackValue(medicineResult.dosage, '成人一次1片，一日3次（具体请遵医嘱）') }}</span>
          </div>
          
          <div class="result-item">
            <span class="result-label">禁忌说明：</span>
            <span class="result-value">{{ getFallbackValue(medicineResult.tabooDesc, '对本品过敏者禁用，孕妇及哺乳期妇女慎用，严重肝肾功能不全者慎用') }}</span>
          </div>
          
          <div class="result-item">
            <span class="result-label">功效作用：</span>
            <span class="result-value">{{ getFallbackValue(medicineResult.efficacy, '用于缓解轻至中度疼痛如头痛、关节痛、偏头痛、牙痛、肌肉痛、神经痛、痛经，也用于普通感冒或流行性感冒引起的发热') }}</span>
          </div>
          
          <div class="result-actions">
            <button class="reset-btn" @click="resetAnalysis">重新分析</button>
          </div>
        </div>
      </section>
      
      <!-- 历史记录（新增删除功能） -->
      <section v-if="historyList.length > 0" class="history-section">
        <div class="history-header">
          <h3>查询历史</h3>
          <button class="clear-all-btn" @click="clearAllHistory">清空全部</button>
        </div>
        <div class="history-list">
          <div 
            v-for="(item, index) in historyList" 
            :key="index"
            class="history-item"
          >
            <div class="history-content" @click="loadHistoryItem(item)">
              <div class="history-name">{{ item.medicineName }}</div>
              <div class="history-time">{{ formatDate(item.queryTime) }}</div>
            </div>
            <button 
              class="delete-history-btn" 
              @click.stop="deleteHistoryItem(index)"
              title="删除该记录"
            >
              ×
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import NavHeader from '@/components/NavHeader.vue'
// 导入 api.js 中的配置
import { MEDICAL_API } from '@/config/api.js'

// ========== 核心：获取用户信息 ==========
// 从 localStorage 获取 token
const getToken = () => {
  return localStorage.getItem('token')
}

// 从 localStorage 获取用户ID
const getUserId = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      // 尝试获取用户ID，确保返回数字类型
      const id = userInfo.id || userInfo.userId || userInfo.userid
      return id ? Number(id) : null
    } catch (e) {
      console.warn('userInfo 解析失败:', e)
      return null
    }
  }
  return null
}

// ========== 页面状态 ==========
const inputMethod = ref('image') // image/text
const imageFile = ref(null)
const imagePreviewUrl = ref('')
const medicineName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const medicineResult = ref(null)
const historyList = ref([])
const fileInput = ref(null)

// ========== 辅助函数 ==========
// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 空值兜底函数
const getFallbackValue = (value, fallback) => {
  if (!value || value.trim() === '' || value === '暂无' || value === 'null' || value === 'undefined') {
    return fallback
  }
  return value
}

// ========== 页面方法 ==========
// 切换输入方式
const switchInputMode = (mode) => {
  inputMethod.value = mode
  resetAnalysis()
}

// 触发文件选择框
const triggerFileInput = () => {
  if (!isLoading.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
    errorMessage.value = ''
  }
}

// 移除文件
const removeFile = () => {
  imageFile.value = null
  imagePreviewUrl.value = ''
  fileInput.value.value = ''
}

// 重置分析状态
const resetAnalysis = () => {
  imageFile.value = null
  imagePreviewUrl.value = ''
  medicineName.value = ''
  medicineResult.value = null
  errorMessage.value = ''
  isLoading.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 分析药品（修复版，所有接口都使用存储的用户ID）
const analyzeMedicine = async () => {
  console.log('开始分析药品...')
  
  errorMessage.value = ''
  medicineResult.value = null
  
  // 登录校验
  const userId = getUserId()
  const token = getToken()
  
  console.log('当前用户ID:', userId, 'Token:', token ? '存在' : '不存在')
  
  if (!userId) {
    errorMessage.value = '请先登录后再进行药品分析'
    return
  }

  try {
    isLoading.value = true
    console.log('发送请求，输入方式:', inputMethod.value)
    
    let response, data
    
    if (inputMethod.value === 'image') {
      // 图片识别请求 - 通过header传递用户ID
      console.log('上传图片:', imageFile.value)
      const formData = new FormData()
      formData.append('file', imageFile.value)
      
      response = await fetch(MEDICAL_API.medication.queryImage, {
        method: 'POST',
        headers: {
          'userId': userId.toString(),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      })
    } else {
      // 文字查询请求 - 通过JSON body传递用户ID
      console.log('查询药品:', medicineName.value)
      
      // 构建请求数据
      const requestData = {
        medicineName: medicineName.value.trim(),
        userId: userId  // 数字类型
      }
      
      console.log('发送的JSON数据:', JSON.stringify(requestData, null, 2))
      
      response = await fetch(MEDICAL_API.medication.queryName, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestData)
      })
    }
    
    console.log('响应状态:', response.status, response.statusText)
    
    // 获取响应文本
    const responseText = await response.text()
    console.log('原始响应文本:', responseText.substring(0, 500))
    
    // 响应状态校验
    if (!response.ok) {
      throw new Error(`请求失败 [${response.status}]：${responseText.substring(0, 100)}`)
    }
    
    // JSON格式校验
    try {
      data = JSON.parse(responseText)
      console.log('解析后的JSON数据:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      throw new Error(`响应不是有效的JSON格式：${responseText.substring(0, 100)}`)
    }
    
    // 成功状态判断
    const isSuccess = data.success === true || data.code === 200
    
    console.log('成功状态判断:', isSuccess, 'success:', data.success, 'code:', data.code)
    
    if (isSuccess) {
      // 构建标准化数据
      const normalizedData = {
        medicineName: data.medicineName || '未知药品',
        dosage: data.dosage || '暂无',
        tabooDesc: data.tabooDesc || '暂无',
        efficacy: data.efficacy || '暂无'
      }
      
      console.log('标准化后的数据:', normalizedData)
      
      // 使用 nextTick 确保 DOM 更新
      await nextTick(() => {
        medicineResult.value = normalizedData
        console.log('medicineResult 已设置:', medicineResult.value)
        
        // 添加到历史记录
        const historyItem = {
          ...normalizedData,
          queryTime: new Date().toISOString(),
          queryMethod: inputMethod.value
        }
        
        addToHistory(historyItem)
        errorMessage.value = ''
      })
    } else {
      errorMessage.value = data.message || data.msg || data.error || '分析失败，请重试'
      console.log('分析失败，错误信息:', errorMessage.value)
    }
  } catch (error) {
    console.error('药品分析失败:', error)
    errorMessage.value = `分析失败：${error.message || '请检查网络或上传清晰的药品图片重试'}`
  } finally {
    isLoading.value = false
    console.log('分析完成，最终 medicineResult:', medicineResult.value)
  }
}

// 添加到历史记录
const addToHistory = (item) => {
  // 防止重复添加
  const exists = historyList.value.some(history => 
    history.medicineName === item.medicineName && 
    history.queryTime === item.queryTime
  )
  
  if (!exists) {
    historyList.value.unshift(item)
    
    // 限制历史记录数量
    if (historyList.value.length > 10) {
      historyList.value = historyList.value.slice(0, 10)
    }
    
    try {
      localStorage.setItem('medicineHistory', JSON.stringify(historyList.value))
      console.log('历史记录已保存:', historyList.value.length, '条')
    } catch (storageError) {
      console.warn('本地存储失败:', storageError)
    }
  }
}

// 加载历史记录项
const loadHistoryItem = (item) => {
  console.log('加载历史记录:', item)
  medicineResult.value = item
  
  // 根据查询方式设置输入
  if (item.queryMethod === 'text') {
    medicineName.value = item.medicineName
    inputMethod.value = 'text'
  }
  
  // 滚动到结果区域
  setTimeout(() => {
    const resultSection = document.querySelector('.result-section')
    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

// ========== 新增：历史记录删除功能 ==========
// 删除单条历史记录
const deleteHistoryItem = (index) => {
  if (confirm('确定要删除这条历史记录吗？')) {
    historyList.value.splice(index, 1)
    // 同步更新本地存储
    localStorage.setItem('medicineHistory', JSON.stringify(historyList.value))
    console.log('删除历史记录，当前剩余:', historyList.value.length, '条')
  }
}

// 清空全部历史记录
const clearAllHistory = () => {
  if (historyList.value.length === 0) return
  
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复')) {
    historyList.value = []
    // 清空本地存储
    localStorage.removeItem('medicineHistory')
    console.log('已清空所有历史记录')
  }
}

// 初始化历史记录
onMounted(() => {
  console.log('组件挂载，检查 medicineResult 初始值:', medicineResult.value)
  
  try {
    const savedHistory = localStorage.getItem('medicineHistory')
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory)
      if (Array.isArray(parsedHistory)) {
        historyList.value = parsedHistory
        console.log('加载历史记录:', historyList.value.length, '条')
      }
    }
  } catch (e) {
    console.warn('药品历史记录解析失败:', e)
  }
})
</script>

<style scoped>
.medicine-analysis-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 标题区域 */
.hero-section {
  padding: 40px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.hero-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.hero-content p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* 输入方式选择 */
.input-mode-section {
  margin-bottom: 30px;
}

.mode-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.mode-tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.mode-tab.active {
  color: #f472b6;
  border-bottom-color: #f472b6;
}

/* 图片上传区域 */
.image-upload-section {
  margin-bottom: 30px;
}

.upload-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #f472b6;
  background-color: #fff0f7;
}

.upload-area.hasFile {
  border-style: solid;
  padding: 10px;
}

.file-input {
  display: none;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #999;
  margin-bottom: 16px;
}

.upload-placeholder p {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
}

.upload-preview {
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff4d4f;
}

/* 文字输入区域 */
.text-input-section {
  margin-bottom: 30px;
}

.input-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
}

.medicine-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.medicine-input:focus {
  border-color: #f472b6;
  box-shadow: 0 0 0 2px rgba(244, 114, 182, 0.1);
}

/* 提示样式 */
.error-message {
  background-color: #fff1f0;
  color: #ff4d4f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffccc7;
}
.success-message {
  background-color: #f0fff4;
  color: #28a745;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #b7eb8f;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #f472b6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 按钮区域 */
.action-section {
  text-align: center;
  margin-bottom: 30px;
}

.analyze-btn {
  background-color: #f472b6;
  color: white;
  border: none;
  padding: 12px 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 200px;
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyze-btn:hover:not(:disabled) {
  background-color: #db2777;
}

/* 结果区域 */
.result-section {
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #fff0f7 0%, #f9f9f9 100%);
  border-radius: 12px;
  border: 1px solid #ffe4ec;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.result-card h3 {
  font-size: 22px;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
  border-bottom: 2px solid #ffe4ec;
  padding-bottom: 15px;
  font-weight: 600;
}

.result-item {
  display: flex;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.7;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.result-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.result-label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
  flex-shrink: 0;
  padding-right: 20px;
  white-space: nowrap;
}

.result-value {
  color: #555;
  flex: 1;
  word-break: break-word;
}

/* 结果按钮 */
.result-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reset-btn {
  padding: 10px 32px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid #f472b6;
  background-color: white;
  color: #f472b6;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #f472b6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 114, 182, 0.2);
}

/* 历史记录（新增删除样式） */
.history-section {
  margin-top: 40px;
  padding: 25px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  font-size: 20px;
  color: #333;
  margin: 0;
  font-weight: 600;
  padding-bottom: 0;
  border-bottom: none;
}

.clear-all-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: #ff4d4f;
  background: transparent;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #fff1f0;
  border-color: #ff4d4f;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  padding: 16px 20px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border-left: 4px solid transparent;
  position: relative;
}

.history-item:hover {
  background-color: #fff0f7;
  border-left-color: #f472b6;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.1);
}

.history-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-name {
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.history-time {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 10px;
}

/* 删除按钮样式 */
.delete-history-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .delete-history-btn {
  opacity: 1;
}

.delete-history-btn:hover {
  background: #ff7875;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 26px;
  }
  
  .hero-section {
    padding: 30px 15px;
  }
  
  .main-content {
    padding: 15px;
  }
  
  .result-item {
    flex-direction: column;
  }
  
  .result-label {
    min-width: auto;
    margin-bottom: 5px;
    padding-right: 0;
  }
  
  .result-card {
    padding: 20px 15px;
  }
  
  .analyze-btn {
    min-width: 100%;
  }
  
  /* 移动端历史记录适配 */
  .history-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .delete-history-btn {
    opacity: 1; /* 移动端始终显示删除按钮 */
    position: absolute;
    top: 10px;
    right: 10px;
    margin-left: 0;
  }
}
</style>