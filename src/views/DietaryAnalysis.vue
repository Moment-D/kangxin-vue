<template>
  <div class="dietary-analysis-page">
    <!-- 导航栏 -->
    <NavHeader />
    
    <!-- 页面内容区 -->
    <main class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>膳食分析</h1>
        <p class="subtitle">智能分析食物营养成分，提供个性化饮食建议</p>
      </div>
      
      <!-- 功能区域 -->
      <div class="dietary-analysis-container">
        <!-- 图片上传区域 -->
        <div class="upload-card">
          <div 
            class="drop-zone"
            @dragover.prevent
            @dragleave.prevent
            @drop="handleImageDrop"
            @click="triggerFileUpload"
          >
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              @change="handleImageUpload"
              style="display: none"
            />
            
            <!-- 上传提示（无按钮） -->
            <div v-if="!selectedImage" class="drop-zone-content">
              <img src="/images/档案.png" alt="上传图标" class="upload-icon" />
              <p class="upload-tip">点击或拖拽上传食品图片</p>
              <small class="upload-format">支持JPG、PNG、WEBP格式，大小不超过5MB</small>
            </div>
            
            <!-- 图片预览（上传后显示） -->
            <div v-if="selectedImage" class="preview-container">
              <img :src="selectedImage" class="preview-image" />
              <div class="image-overlay">已选择图片</div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div v-if="selectedImage" class="action-buttons">
            <button 
              class="analyze-btn"
              @click="analyzeDiet"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '分析中...' : '开始分析' }}
            </button>
            <button 
              class="reset-btn"
              @click="reset"
            >
              重新上传
            </button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-section">
          <div class="loading-spinner"></div>
          <p>正在识别食物并分析营养成分...</p>
        </div>
        
        <!-- 结果展示区域 -->
        <div v-if="showResults" class="results-section">
          <!-- 1. 食物识别结果（展示后端返回的food_name、confidence） -->
          <div class="food-recognition-result">
            <h3>食物识别结果</h3>
            <div class="food-list">
              <div class="food-item">
                <div class="food-info">
                  <div class="food-name">{{ foodData.food_name }}</div>
                  <div class="food-confidence">
                    <div class="confidence-bar">
                      <div 
                        class="confidence-fill" 
                        :style="{ width: foodData.confidence + '%' }"
                      ></div>
                    </div>
                    <span class="confidence-text">{{ foodData.confidence }}%</span>
                  </div>
                </div>
                <div class="food-amount">
                  <input 
                    type="number" 
                    v-model="foodAmount" 
                    min="10" 
                    max="2000"
                    class="amount-input"
                    @change="calculateRealNutrition"
                  />
                  <span class="amount-unit">g</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 2. 营养成分摘要（展示后端的calorie_per_100g_final，及按重量计算的实际热量） -->
          <div class="nutrition-summary">
            <h3>营养成分摘要</h3>
            <div class="nutrition-cards">
              <div class="nutrition-card">
                <div class="nutrition-icon calories-icon"></div>
                <div class="nutrition-info">
                  <div class="nutrition-value">{{ realCalorie.toFixed(1) }}</div>
                  <div class="nutrition-label">实际卡路里(kcal)</div>
                </div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-icon per100g-icon"></div>
                <div class="nutrition-info">
                  <div class="nutrition-value">{{ foodData.calorie_per_100g_final }}</div>
                  <div class="nutrition-label">每100克卡路里(kcal)</div>
                </div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-icon predict-icon"></div>
                <div class="nutrition-info">
                  <div class="nutrition-value">{{ foodData.calorie_per_100g_pred }}</div>
                  <div class="nutrition-label">预测每100克卡路里(kcal)</div>
                </div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-icon table-icon"></div>
                <div class="nutrition-info">
                  <div class="nutrition-value">{{ foodData.calorie_per_100g_table }}</div>
                  <div class="nutrition-label">数据库每100克卡路里(kcal)</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 3. 后端分析建议（展示analysis字段） -->
          <div class="dietary-advice">
            <h3>分析建议</h3>
            <div class="advice-content">
              <div class="advice-item success">
                <div class="advice-text">
                  <p>{{ foodData.analysis }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 保存记录按钮 -->
          <div class="save-record">
            <button class="save-btn" @click="saveDietRecord">
              <i class="icon-save"></i>
              <span>保存膳食记录</span>
            </button>
          </div>
        </div>
        
        <!-- 无结果提示 -->
        <div v-if="showNoResults" class="no-results">
          <img src="/images/档案.png" alt="无结果图标" class="no-results-icon" />
          <p>无法识别食品</p>
          <p class="no-results-tips">请上传清晰的食品图片，确保食品完整可见</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="showError" class="error-section">
          <i class="icon-error"></i>
          <p>{{ errorMessage }}</p>
          <button class="retry-btn" @click="analyzeDiet">重新分析</button>
        </div>
      </div>
    </main>
    
    <!-- 消息提示弹窗 -->
    <MessagePopup 
      v-if="popupMessage"
      :message="popupMessage"
      :type="popupType"
      :duration="3000"
      position="top"
      @close="clearPopup"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import NavHeader from '@/components/NavHeader.vue';
import MessagePopup from '@/components/MessagePopup.vue';
import { MEDICAL_API } from '@/config/api.js';

export default {
  name: 'DietaryAnalysis',
  components: {
    NavHeader,
    MessagePopup
  },
  setup() {
    // 响应式数据
    const selectedImage = ref('');
    const showResults = ref(false);
    const showNoResults = ref(false);
    const showError = ref(false);
    const errorMessage = ref('');
    const isLoading = ref(false);
    const fileInput = ref(null);
    
    // 消息弹窗相关
    const popupMessage = ref('');
    const popupType = ref('info');
    
    // 后端返回的原始数据（直接存储，用于展示）
    const foodData = ref({
      food_name: '',
      confidence: 0,
      calorie_per_100g_table: 0,
      calorie_per_100g_pred: 0,
      calorie_per_100g_final: 0,
      analysis: ''
    });
    
    // 食物重量（用户输入，默认100g）
    const foodAmount = ref(100);
    // 实际热量（按重量计算：(foodAmount/100)*calorie_per_100g_final）
    const realCalorie = ref(0);

    // 显示消息弹窗
    const showPopup = (message, type = 'info') => {
      popupMessage.value = message;
      popupType.value = type;
    };
    
    // 清空消息弹窗
    const clearPopup = () => {
      popupMessage.value = '';
      popupType.value = 'info';
    };
    
    // 拖放上传
    const handleImageDrop = (event) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        const file = event.dataTransfer.files[0];
        processImageFile(file);
      }
    };
    
    // 选择文件上传
    const handleImageUpload = (event) => {
      if (event.target.files.length) {
        const file = event.target.files[0];
        processImageFile(file);
      }
    };
    
    // 处理图片文件
    const processImageFile = (file) => {
      if (!file.type.match('image/')) {
        showPopup('请上传有效的图片文件', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showPopup('图片大小不能超过5MB', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage.value = e.target.result;
        fileInput.value.value = '';
        showResults.value = false;
        showNoResults.value = false;
        showError.value = false;
        showPopup('图片上传成功', 'success');
      };
      reader.readAsDataURL(file);
    };
    
    // 触发文件选择
    const triggerFileUpload = () => {
      fileInput.value?.click();
    };
    
    // 核心：分析膳食（直接映射后端返回的所有字段）
    const analyzeDiet = async () => {
      if (!selectedImage.value) return;
      
      showResults.value = false;
      showNoResults.value = false;
      showError.value = false;
      errorMessage.value = '';
      isLoading.value = true;
      
      try {
        const response = await fetch(selectedImage.value);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'food_image.jpg');
        
        // 请求后端接口
        const apiResponse = await axios.post(MEDICAL_API.foodCalorie.analysis, formData, {
          timeout: 30000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // 后端返回code=200则展示数据
        if (apiResponse.data && apiResponse.data.code === 200) {
          const result = apiResponse.data.data;
          
          // 1. 直接存储后端返回的所有数据
          foodData.value = {
            food_name: result.food_name || '未知食物',
            confidence: result.confidence || 0,
            calorie_per_100g_table: result.calorie_per_100g_table || 0,
            calorie_per_100g_pred: result.calorie_per_100g_pred || 0,
            calorie_per_100g_final: result.calorie_per_100g_final || 0,
            analysis: result.analysis || '暂无分析建议'
          };
          
          // 2. 计算实际热量
          calculateRealNutrition();
          
          // 3. 显示结果
          showResults.value = true;
          showPopup('膳食分析完成', 'success');
        } else {
          showNoResults.value = true;
          showPopup(apiResponse.data?.message || '分析结果为空', 'warning');
        }
      } catch (error) {
        console.error('分析失败:', error);
        showError.value = true;
        
        if (error.code === 'ECONNABORTED') {
          errorMessage.value = '请求超时，请检查网络';
          showPopup('请求超时，请检查网络', 'error');
        } else if (error.response) {
          errorMessage.value = `服务器错误: ${error.response.data?.detail || error.response.data?.message || '未知错误'}`;
          showPopup(`服务器错误: ${error.response.data?.detail || error.response.data?.message || '未知错误'}`, 'error');
        } else if (error.request) {
          errorMessage.value = '无法连接到服务器，请检查Python后端是否启动（端口8000）';
          showPopup('无法连接到服务器，请检查Python后端是否启动（端口8000）', 'error');
        } else {
          errorMessage.value = `分析失败: ${error.message || '未知错误'}`;
          showPopup(`分析失败: ${error.message || '未知错误'}`, 'error');
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    // 计算实际热量（按用户输入的重量）
    const calculateRealNutrition = () => {
      realCalorie.value = (foodAmount.value / 100) * foodData.value.calorie_per_100g_final;
    };
    
    // 保存膳食记录
    const saveDietRecord = () => {
      setTimeout(() => {
        showPopup('膳食记录已保存', 'success');
      }, 500);
    };
    
    // 重置
    const reset = () => {
      selectedImage.value = '';
      showResults.value = false;
      showNoResults.value = false;
      showError.value = false;
      foodData.value = {
        food_name: '',
        confidence: 0,
        calorie_per_100g_table: 0,
        calorie_per_100g_pred: 0,
        calorie_per_100g_final: 0,
        analysis: ''
      };
      foodAmount.value = 100;
      realCalorie.value = 0;
      showPopup('已重置数据', 'info');
    };
    
    onMounted(() => {});
    onUnmounted(() => {});
    
    return {
      selectedImage,
      showResults,
      showNoResults,
      showError,
      errorMessage,
      isLoading,
      fileInput,
      foodData,
      foodAmount,
      realCalorie,
      popupMessage,
      popupType,
      handleImageDrop,
      handleImageUpload,
      triggerFileUpload,
      analyzeDiet,
      calculateRealNutrition,
      saveDietRecord,
      reset,
      showPopup,
      clearPopup
    };
  }
};
</script>

<style scoped>
/* 全局样式 */
:root {
  --primary-light: #fff1f0;
  --secondary-light: #fff7e6;
  --primary-color: #faad14;
  --secondary-color: #f5222d;
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e0e0e0;
  --bg-color: #f8f9fa;
  --border-radius: 12px;
}

/* 页面布局 - 加宽主内容区 */
.dietary-analysis-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.main-content {
  max-width: 1200px; 
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
}

.dietary-analysis-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 36px;
  margin-bottom: 40px;
  width: 100%;
  box-sizing: border-box;
}

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.page-header .subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* 上传卡片 */
.upload-card {
  text-align: center;
}

.drop-zone {
  border: 3px dashed #ccc;
  border-radius: var(--border-radius);
  padding: 40px 20px;
  cursor: pointer;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: var(--primary-color);
  background: var(--secondary-light);
}

.drop-zone-content {
  text-align: center;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
}

.upload-tip {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.upload-format {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 预览图 */
.preview-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  border: 4px solid var(--primary-color);
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

.analyze-btn {
  padding: 12px 32px;
  background: rgb(250, 182, 182);
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.analyze-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.reset-btn {
  padding: 12px 32px;
  background: rgb(243, 209, 158);
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-section {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

/* 结果展示区域 */
.results-section {
  margin-top: 32px;
  animation: fadeIn 0.5s ease;
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 食物识别结果 */
.food-recognition-result h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.food-name {
  font-size: 16px;
  font-weight: 500;
}

.food-confidence {
  display: flex;
  align-items: center;
  gap: 10px;
}

.confidence-bar {
  width: 100px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: #52c41a;
}

/* 营养成分摘要 */
.nutrition-summary h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 16px;
}

.nutrition-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
}

.nutrition-card {
  flex: 1;
  min-width: 180px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.nutrition-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

/* 分析建议 */
.dietary-advice {
  margin: 24px 0;
}

.advice-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advice-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid;
  width: 100%;
  box-sizing: border-box;
}

.advice-item.success {
  border-left-color: #52c41a;
  background: #f6ffed;
}

/* 保存记录 */
.save-record {
  text-align: center;
  margin-top: 32px;
}

.save-btn {
  padding: 12px 32px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

/* 无结果/错误提示 */
.no-results, .error-section {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .main-content {
    max-width: 95%;
    padding: 32px 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons button {
    width: 100%;
  }
  
  .nutrition-cards {
    flex-direction: column;
  }
}
</style>