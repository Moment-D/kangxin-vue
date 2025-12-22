<template>
  <div class="health-science-page">
    <!-- 导航头部 -->
    <NavHeader />

    <!-- 主页横幅 -->
    <div class="banner">
      <h1>医疗助手中心</h1>
      <p class="banner-desc">
        整合皮肤筛查、用药管理和膳食分析，为您的健康生活保驾护航
      </p>
      <p class="banner-subdesc">
        我们提供专业的医疗辅助服务，通过AI图像识别、药品查询、膳食分析等工具，帮助您轻松管理健康状态，获取科学的健康建议，助力您的健康生活之旅。
      </p>
    </div>

    <main class="content">
      <!-- 医疗服务模块区域 -->
      <section class="modules-section">
        <div class="modules-grid">
          <!-- 皮肤病筛查 -->
          <div class="module-card" @click="navigateTo('/medical-assistant/skin-check')">
            <img 
              class="module-icon" 
              src="/images/皮肤病.png" 
              alt="皮肤病筛查"
            >
            <h2 class="module-title">皮肤病筛查</h2>
            <p class="module-description">
              通过AI图像识别技术，帮助您初步判断常见皮肤问题，提供专业的护理建议和就医指导
            </p>
            <div class="module-features">
              <span class="feature-tag tag-ccffe5">图像识别</span>
              <span class="feature-tag tag-ccffe5">AI分析</span>
              <span class="feature-tag tag-ccffe5">护理建议</span>
            </div>
            <button class="action-btn btn-ccffe5">开始筛查 →</button>
          </div>

          <!-- 用药管理 -->
          <div class="module-card" @click="navigateTo('/medical-assistant/drug-management')">
            <img 
              class="module-icon" 
              src="/images/用药管理.png" 
              alt="用药管理"
            >
            <h2 class="module-title">用药管理</h2>
            <p class="module-description">
              查询药品信息，了解正确用法用量及注意事项，支持药品图片识别和名称搜索
            </p>
            <div class="module-features">
              <span class="feature-tag tag-ffcce5">药品查询</span>
              <span class="feature-tag tag-ffcce5">用法用量</span>
              <span class="feature-tag tag-ffcce5">注意事项</span>
            </div>
            <button class="action-btn btn-ffcce5">查询药品 →</button>
          </div>

          <!-- 膳食分析 -->
          <div class="module-card" @click="navigateTo('/medical-assistant/diet-analysis')">
            <img 
              class="module-icon" 
              src="/images/膳食分析.png" 
              alt="膳食分析"
            >
            <h2 class="module-title">膳食分析</h2>
            <p class="module-description">
              分析食物营养成分，获取个性化膳食建议，帮助您合理规划饮食，保持健康生活方式
            </p>
            <div class="module-features">
              <span class="feature-tag tag-99ccff">营养分析</span>
              <span class="feature-tag tag-99ccff">个性化建议</span>
              <span class="feature-tag tag-99ccff">健康规划</span>
            </div>
            <button class="action-btn btn-99ccff">分析膳食 →</button>
          </div>
        </div>
      </section>

      <!-- 我们的技术特点 -->
      <section class="features-section">
        <h2 class="section-title">我们的技术特点</h2>
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
import NavHeader from '../components/NavHeader.vue'

const router = useRouter()

// 导航到指定路径
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.health-science-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 主内容区域 */
.content {
  max-width: 1600px; /* 加宽主内容区域 */
  margin: 0 auto;
  padding: 0 30px;
  width: 100%;
}

/* 横幅样式 */
.banner {
  text-align: center;
  padding: 50px 20px;
  margin-bottom: 60px;
}

.banner h1 {
  font-size: 36px;
  margin: 0 0 18px;
  font-weight: 700;
  color: #333;
}

.banner-desc {
  font-size: 20px;
  color: #666;
  margin: 0 0 10px;
}

.banner-subdesc {
  font-size: 16px;
  color: #999;
  max-width: 1200px;
  margin: 0 auto;
  line-height: 1.7;
}

/* 医疗服务模块区域（大幅加宽卡片） */
.modules-section {
  margin-bottom: 70px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); /* 进一步加宽卡片 */
  gap: 40px; /* 加大卡片间距 */
  padding: 0 20px;
}

.module-card {
  background: white;
  border-radius: 16px;
  padding: 32px; /* 增加内边距 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.35s ease; /* 延长过渡时间 */
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

/* 模块卡片悬浮效果 */
.module-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15); /* 更强阴影 */
  transform: translateY(-8px); /* 更大上浮幅度 */
}

.module-icon {
  width: 60px; /* 加大图标 */
  height: 60px;
  object-fit: contain;
  margin-bottom: 20px;
}

.module-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.module-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.module-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.feature-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.tag-ccffe5 {
  background: #CCFFE5;
  color: #008055;
}

.tag-ffcce5 {
  background: #FFCCE5;
  color: #B34768;
}

.tag-99ccff {
  background: #99CCFF;
  color: #2E5A88;
}

.action-btn {
  border: none;
  padding: 14px 24px; /* 加大按钮 */
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-ccffe5 {
  background: #CCFFE5;
  color: #006644;
}
.btn-ccffe5:hover {
  background: #99FFD6;
}

.btn-ffcce5 {
  background: #FFCCE5;
  color: #992E51;
}
.btn-ffcce5:hover {
  background: #FF99C2;
}

.btn-99ccff {
  background: #99CCFF;
  color: #1A4069;
}
.btn-99ccff:hover {
  background: #66B2FF;
}

/* 技术特点区域（加宽卡片+悬浮效果） */
.features-section {
  margin-bottom: 70px;
}

.section-title {
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 40px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* 大幅加宽特点卡片 */
  gap: 30px; /* 加大间距 */
  padding: 0 20px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 28px; /* 增加内边距 */
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.35s ease; /* 过渡动画 */
  cursor: pointer; /* 增加点击指针 */
  border: 1px solid #f0f0f0;
}

/* 技术特点卡片悬浮效果 */
.feature-card:hover {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
  transform: translateY(-6px);
}

.feature-icon {
  width: 50px; /* 加大图标 */
  height: 50px;
  object-fit: contain;
  margin-bottom: 18px;
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
@media (max-width: 1400px) {
  .modules-grid {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 1200px) {
  .modules-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .content {
    padding: 0 15px;
  }
  .modules-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .module-card {
    padding: 24px;
  }
  .feature-card {
    padding: 20px;
  }
}
</style>