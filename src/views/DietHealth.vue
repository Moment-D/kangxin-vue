<template>
  <div class="diet-health-page">
    <NavHeader />
    <main class="content">
      <h1>饮食健康</h1>
      <p class="category-description">均衡的饮食是健康生活的基础，为您提供科学的膳食搭配指南和营养知识。</p>
      
      <div class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <img :src="article.cover" :alt="article.title" class="article-cover">
          <div class="article-content">
            <h2>{{ article.title }}</h2>
            <p class="article-summary">{{ article.summary }}</p>
            <router-link :to="`/health-science/diet/${article.id}`" class="read-more">阅读详情</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavHeader from '../components/NavHeader.vue'

// 模拟饮食健康文章数据
const articles = [
  {
    id: 1,
    title: '均衡膳食搭配原则',
    summary: '了解科学的膳食搭配原则，确保摄入全面的营养，维持身体正常代谢和健康状态。本文提供了详细的膳食金字塔指南。',
    cover: 'https://picsum.photos/id/3/600/400'
  },
  {
    id: 2,
    title: '控糖饮食指南',
    summary: '科学控糖不仅有助于预防糖尿病，还能提高身体能量水平，改善皮肤状态，延缓衰老。本文介绍了如何识别隐藏糖分及健康替代品。',
    cover: 'https://picsum.photos/id/4/600/400'
  },
  {
    id: 3,
    title: '每日饮水量指南',
    summary: '充足的水分摄入对维持身体健康至关重要。本文详细介绍了不同人群的每日饮水量建议及科学饮水时间。',
    cover: 'https://picsum.photos/id/9/600/400'
  },
  {
    id: 4,
    title: '季节性健康食材推荐',
    summary: '应季食材不仅新鲜美味，营养也更为丰富。本文为您推荐不同季节的健康食材及简单烹饪方法。',
    cover: 'https://picsum.photos/id/10/600/400'
  }
]
</script>

<style scoped>
.diet-health-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.content h1 {
  color: #333;
  font-size: 32px;
  margin-bottom: 16px;
  border-left: 4px solid #1890ff;
  padding-left: 16px;
}

.category-description {
  color: #666;
  font-size: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.articles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.article-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.article-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.article-content {
  padding: 20px;
}

.article-content h2 {
  color: #333;
  font-size: 18px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
 display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3; /* 添加标准属性 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more {
  display: inline-block;
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.read-more:hover {
  background-color: #1890ff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 24px 16px;
  }
  
  .content h1 {
    font-size: 26px;
  }
  
  .articles-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .article-cover {
    height: 180px;
  }
}
</style>