<template>
  <div class="rest-health-page">
    <NavHeader />
    <main class="content">
      <h1>作息健康</h1>
      <p class="category-description">规律的作息时间对身心健康至关重要，帮助您建立科学的生活习惯。</p>
      
      <div class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <img :src="article.cover" :alt="article.title" class="article-cover">
          <div class="article-content">
            <h2>{{ article.title }}</h2>
            <p class="article-summary">{{ article.summary }}</p>
            <router-link :to="`/health-science/rest/${article.id}`" class="read-more">阅读详情</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavHeader from '../components/NavHeader.vue'

// 模拟作息健康文章数据
const articles = [
  {
    id: 1,
    title: '优质睡眠时间表',
    summary: '了解人体生物钟规律，建立科学的睡眠时间表，提高睡眠质量，让身体得到充分休息。本文包含不同年龄段的睡眠建议时长。',
    cover: 'https://picsum.photos/id/5/600/400'
  },
  {
    id: 2,
    title: '熬夜后身体调理方法',
    summary: '偶尔熬夜后如何快速恢复身体状态？本文提供实用的调理方法，帮助减轻熬夜对身体的伤害。',
    cover: 'https://picsum.photos/id/6/600/400'
  },
  {
    id: 3,
    title: '科学午休的好处',
    summary: '适当的午休能够提高下午的工作效率，缓解疲劳，改善记忆力。本文教您如何正确安排午休时间。',
    cover: 'https://picsum.photos/id/11/600/400'
  },
  {
    id: 4,
    title: '改善睡眠质量的环境布置',
    summary: '睡眠环境对睡眠质量有重要影响。本文介绍如何优化卧室环境，创造理想的睡眠条件。',
    cover: 'https://picsum.photos/id/12/600/400'
  }
]
</script>

<style scoped>
.rest-health-page {
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