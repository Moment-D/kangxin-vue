<template>
  <div class="mental-health-page">
    <!-- 导航头部 - 保留原有组件 -->
    <NavHeader />

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 页面标题区域（改为图一样式） -->
      <section class="page-header-section">
        <h1 class="main-title">心理健康管理中心</h1>
        <p class="subtitle-desc">整合情绪监测、抑郁评估和智能咨询，为您的心理健康保驾护航</p>
        <p class="detail-desc">
          我们提供专业的心理健康管理服务，通过情绪监测、标准化PHQ-9抑郁评估、智能咨询等工具，
          帮助您轻松了解自身心理状态，获取科学的调节建议，助力您的心理健康之旅。
        </p>
      </section>

      <!-- 核心功能模块区域 -->
      <section class="modules-section">
        <div class="modules-grid">
          <!-- 情绪监测模块（#CCFFE5 青粉色系） -->
          <div class="module-card" @click="navigateTo('/mental-health/emotion-detection')">
            <img 
              class="module-icon" 
              src="/images/情绪.png" 
              alt="情绪监测"
            >
            <h2 class="module-title">情绪监测</h2>
            <p class="module-description">
              输入日记或心情描述，通过AI分析您的情绪状态，获取0-100分的情绪评分和个性化建议
            </p>
            <div class="module-features">
              <span class="feature-tag tag-ccffe5">文本分析</span>
              <span class="feature-tag tag-ccffe5">情绪评分</span>
              <span class="feature-tag tag-ccffe5">可视化引导</span>
            </div>
            <button class="action-btn btn-ccffe5">开始监测 →</button>
          </div>

          <!-- 抑郁评估模块（#FFCCE5 粉橙色系） -->
          <div class="module-card" @click="navigateTo('/mental-health/depression-assessment')">
            <img 
              class="module-icon" 
              src="/images/抑郁.png" 
              alt="抑郁评估"
            >
            <h2 class="module-title">抑郁评估</h2>
            <p class="module-description">
              基于标准化PHQ-9量表，完成10道核心问题，获取专业的抑郁风险评估和干预建议
            </p>
            <div class="module-features">
              <span class="feature-tag tag-ffcce5">PHQ-9量表</span>
              <span class="feature-tag tag-ffcce5">风险评估</span>
              <span class="feature-tag tag-ffcce5">趋势分析</span>
            </div>
            <button class="action-btn btn-ffcce5">开始评估 →</button>
          </div>

          <!-- 智能咨询模块（#99CCFF 淡蓝色系） -->
          <div class="module-card" @click="navigateTo('/mental-health/smart-consultation')">
            <img 
              class="module-icon" 
              src="/images/咨询.png" 
              alt="智能咨询"
            >
            <h2 class="module-title">智能咨询</h2>
            <p class="module-description">
              输入您的症状描述，通过多轮交互获取个性化的健康建议，所有记录可追溯回顾
            </p>
            <div class="module-features">
              <span class="feature-tag tag-99ccff">多轮交互</span>
              <span class="feature-tag tag-99ccff">健康建议</span>
              <span class="feature-tag tag-99ccff">记录追溯</span>
            </div>
            <button class="action-btn btn-99ccff">开始咨询 →</button>
          </div>
        </div>
      </section>

      <!-- 服务特点区域 -->
      <section class="features-section">
        <h2 class="section-title">我们的服务特点</h2>
        <div class="features-grid">
          <div class="feature-card">
            <img 
              class="feature-icon" 
              src="/images/隐私保护.png" 
              alt="隐私保护"
            >
            <h3 class="feature-title">隐私保护</h3>
            <p>所有数据严格保密，仅用于为您提供个性化服务</p>
          </div>
          <div class="feature-card">
            <img 
              class="feature-icon" 
              src="/images/AI驱动.png" 
              alt="AI驱动"
            >
            <h3 class="feature-title">AI驱动</h3>
            <p>基于科大讯飞星火大模型与百度飞桨技术提供专业分析</p>
          </div>
          <div class="feature-card">
            <img 
              class="feature-icon" 
              src="/images/量化分析.png" 
              alt="量化分析"
            >
            <h3 class="feature-title">量化分析</h3>
            <p>提供客观的评分体系和可视化数据，帮助您了解自身状态</p>
          </div>
          <div class="feature-card">
            <img 
              class="feature-icon" 
              src="/images/个性化方案.png" 
              alt="个性化方案"
            >
            <h3 class="feature-title">个性化方案</h3>
            <p>根据您的具体情况提供针对性的建议和干预方案</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import NavHeader from '@/components/NavHeader.vue'

const router = useRouter()

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.mental-health-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 主内容：缩小左右内边距，减少与左右的距离 */
.main-content {
  flex: 1;
  padding: 20px 15px; /* 缩小左右间距 */
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 页面标题区域（改为图一样式） */
.page-header-section {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 20px;
  background: linear-gradient(180deg, #fef3f8, #f0f9ff); /* 淡粉到淡蓝渐变 */
  border-radius: 8px;
  color: #333;
  margin-top: 20px;
}

.main-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #2d3748;
}

.subtitle-desc {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 12px;
}

.detail-desc {
  font-size: 15px;
  color: #718096;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
}

/* 核心功能模块区域样式（紧凑调整） */
.modules-section {
  margin-bottom: 80px;
}

/* 模块网格：缩小列最小宽度+间距，减少左右留白 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 缩小列宽 */
  gap: 20px; /* 缩小模块间距 */
  padding: 0 5px; /* 避免贴边 */
}

.module-card {
  background: white;
  border-radius: 16px;
  padding: 24px; /* 缩小内边距 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

/* 模块hover边框匹配对应色值 */
.module-card:nth-child(1):hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border-color: #CCFFE5;
}
.module-card:nth-child(2):hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border-color: #FFCCE5;
}
.module-card:nth-child(3):hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border-color: #99CCFF;
}

.module-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 20px;
}

.module-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.module-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.module-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

/* 标签样式 - 对应指定色值 */
.feature-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}
/* #CCFFE5 青粉色标签 */
.tag-ccffe5 {
  background: #CCFFE5;
  color: #008055;
}
/* #FFCCE5 粉橙色标签 */
.tag-ffcce5 {
  background: #FFCCE5;
  color: #B34768;
}
/* #99CCFF 淡蓝色标签 */
.tag-99ccff {
  background: #99CCFF;
  color: #2E5A88;
}

/* 按钮样式 - 对应指定色值渐变 */
.action-btn {
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  color: white;
}
/* #CCFFE5 青粉色按钮（渐变加深） */
.btn-ccffe5 {
  background: linear-gradient(135deg, #CCFFE5, #99FFD6);
  color: #006644;
}
.btn-ccffe5:hover {
  background: linear-gradient(135deg, #99FFD6, #66FFC7);
  transform: translateY(-2px);
}
/* #FFCCE5 粉橙色按钮（渐变加深） */
.btn-ffcce5 {
  background: linear-gradient(135deg, #FFCCE5, #FF99C2);
  color: #992E51;
}
.btn-ffcce5:hover {
  background: linear-gradient(135deg, #FF99C2, #FF66A8);
  transform: translateY(-2px);
}
/* #99CCFF 淡蓝色按钮（渐变加深） */
.btn-99ccff {
  background: linear-gradient(135deg, #99CCFF, #66B2FF);
  color: #1A4069;
}
.btn-99ccff:hover {
  background: linear-gradient(135deg, #66B2FF, #3399FF);
  transform: translateY(-2px);
}

/* 服务特点区域样式（紧凑调整） */
.features-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 40px;
  color: #333;
}

/* 服务特点网格：缩小列最小宽度+间距 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* 缩小列宽 */
  gap: 15px; /* 缩小间距 */
  padding: 0 5px; /* 避免贴边 */
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 20px; /* 缩小内边距 */
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px 10px;
  }
  
  .main-title {
    font-size: 32px;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>