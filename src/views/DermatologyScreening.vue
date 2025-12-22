<template>
  <div class="dermatology-screening-page">
    <NavHeader />
    <main class="content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="animated-title">皮肤病筛查</h1>
        <p class="subtitle">通过AI图像识别技术，帮助您初步判断常见皮肤问题</p>
        <div class="header-decoration"></div>
      </div>

      <!-- 主要功能区域 -->
      <div class="screening-container">
        <!-- 图片上传区域 -->
        <div class="upload-area">
          <div class="upload-card glass-card">
            <div 
              class="drop-zone"
              @dragover.prevent
              @dragleave.prevent
              @drop="handleImageDrop"
              @click="triggerFileInput"
            >
              <input 
                type="file" 
                ref="fileInput"
                accept="image/*"
                @change="handleFileChange"
                style="display: none"
              />
              <div class="drop-zone-content" :class="{ 'hidden': selectedImage }">
                <div class="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p class="upload-tip">点击或拖拽图片到此处上传</p>
                <small class="upload-format">支持 JPG, PNG, WEBP 格式</small>
              </div>
              <div v-if="selectedImage" class="preview-container">
                <img :src="selectedImage" class="preview-image" />
                <div class="image-overlay">
                  <span class="image-placeholder-text">已选择图片</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="selectedImage" class="action-buttons">
          <button 
            class="analyze-btn"
            @click="analyzeSkinCondition"
            :disabled="isAnalyzing"
          >
            <span v-if="isAnalyzing" class="loading-spinner"></span>
            {{ isAnalyzing ? '分析中...' : '开始分析' }}
          </button>
          <button 
            class="reset-btn"
            @click="resetSkinAnalysis"
          >
            重新上传
          </button>
        </div>

        <!-- 简化的分析结果 -->
        <div v-if="showSkinResult" class="simple-result slide-in">
          <h3>识别结果</h3>
          <p class="result-text">您的皮肤病类型：<span class="disease-type">{{ skinResult.condition || '无法识别' }}</span></p>
          <p class="advice-text">{{ skinResult.advice || '请咨询专业医生' }}</p>
        </div>
      </div>

      <!-- 导入提示组件 -->
      <MessagePopup ref="messagePopup" />
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import NavHeader from '../components/NavHeader.vue'
import { MEDICAL_API } from '../config/api.js'
import axios from 'axios'
// 导入提示组件
import MessagePopup from '../components/MessagePopup.vue'

// 响应式状态
const fileInput = ref(null)
const selectedImage = ref('')
const isAnalyzing = ref(false)
const showSkinResult = ref(false)
const messagePopup = ref(null) // 提示组件实例

const skinResult = reactive({
  condition: '',
  advice: ''
})

// 处理图片拖放
const handleImageDrop = (event) => {
  event.preventDefault()
  if (event.dataTransfer.files.length) {
    const file = event.dataTransfer.files[0]
    processImageFile(file)
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  if (event.target.files.length) {
    const file = event.target.files[0]
    processImageFile(file)
  }
}

// 处理图片文件
const processImageFile = (file) => {
  if (!file.type.match('image.*')) {
    messagePopup.value.show('请上传图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    showSkinResult.value = false
  }
  reader.readAsDataURL(file)
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 分析皮肤状况
const analyzeSkinCondition = async () => {
  if (!selectedImage.value) {
    messagePopup.value.show('请先上传皮肤图片')
    return
  }
  
  isAnalyzing.value = true
  showSkinResult.value = false
  
  try {
    const response = await fetch(selectedImage.value);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, 'skin_image.jpg');
    
    const res = await axios.post(MEDICAL_API.skin.analysisPython, formData, {
      timeout: 30000
    });
    
    if (res.data && res.data.code === 200) {
      const data = res.data.data
      skinResult.condition = data.disease_type || '无法识别' // 匹配后端返回的disease_type字段
      skinResult.advice = data.advice || '请咨询专业医生'
      showSkinResult.value = true
      messagePopup.value.show('识别成功')
    } else {
      throw new Error(res.data?.message || '分析失败')
    }
  } catch (error) {
    console.error('调用失败:', error)
    messagePopup.value.show(`分析失败：${error.message || '网络异常'}`)
    // 模拟数据
    skinResult.condition = '水痘'
    skinResult.advice = '请咨询专业医生'
    showSkinResult.value = true
  } finally {
    isAnalyzing.value = false
  }
}

// 重置
const resetSkinAnalysis = () => {
  selectedImage.value = ''
  showSkinResult.value = false
  skinResult.condition = ''
  skinResult.advice = ''
}

onMounted(() => {
  document.title = '皮肤病筛查'
})
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e0e0e0;
  --background-color: #f8f9fa;
  --border-radius: 12px;
  --transition-speed: 0.3s;
}

/* 页面整体 */
.dermatology-screening-page {
  min-height: 100vh;
  background-color: var(--background-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  padding-bottom: 24px;
}

.animated-title {
  color: var(--text-primary);
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}

.animated-title::after {
  content: '';
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: rgb(252, 211, 211);
  border-radius: 2px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 筛查容器 */
.screening-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 36px;
  margin-bottom: 40px;
}

/* 玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 24px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #ccc;
  padding: 40px 20px;
  text-align: center;
  margin-top: 20px;
}

.upload-area:hover {
  border-color: #666;
}

/* 拖拽区域 */
.drop-zone {
  border: 3px dashed rgb(252, 211, 211);
  border-radius: var(--border-radius);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-color);
}

.drop-zone-content.hidden {
  display: none;
}

/* 上传图标 */
.upload-icon {
  margin-bottom: 24px;
}

/* 上传提示 */
.upload-tip {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-format {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 预览图 */
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 95%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 8px;
  border: 4px solid rgb(252, 211, 211);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.image-overlay {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}

/* 开始分析按钮样式 */
.analyze-btn {
  padding: 12px 32px;
  background: rgb(252, 211, 211);
  color: #000 !important;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-speed) ease;
}

.analyze-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
}

/* 重新上传按钮样式 */
.reset-btn {
  padding: 12px 32px;
  background: rgb(243, 209, 158);
  color: #000 !important;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-speed) ease;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  border-top-color: #000;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

/* 简化的结果样式 */
.simple-result {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.simple-result h3 {
  color: var(--text-primary);
  font-size: 20px;
  margin-bottom: 16px;
}

.result-text {
  font-size: 18px;
  margin-bottom: 12px;
}

.disease-type {
  color: #e63946;
  font-weight: 700;
}

.advice-text {
  color: var(--text-secondary);
  font-size: 16px;
}

/* 动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in {
  animation: slideIn 0.6s ease-out;
}

/* 响应式 */
@media (max-width: 768px) {
  .content {
    padding: 24px 16px;
  }
  
  .animated-title {
    font-size: 28px;
  }
  
  .screening-container {
    padding: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons button {
    width: 100%;
  }
}
</style>