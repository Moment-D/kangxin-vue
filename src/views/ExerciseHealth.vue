<template>
  <div class="exercise-health-page">
    <NavHeader />
    <main class="content">
      <h1>运动健康</h1>
      <p class="category-description">科学的运动方式是保持身体健康的重要保障，帮助您了解各类运动的益处与正确方法。</p>
      
      <div class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <img :src="article.cover" :alt="article.title" class="article-cover">
          <div class="article-content">
            <h2>{{ article.title }}</h2>
            <p class="article-summary">{{ article.summary }}</p>
            <router-link :to="`/health-science/exercise/${article.id}`" class="read-more">阅读详情</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavHeader from '../components/NavHeader.vue'

// 模拟运动健康文章数据
const articles = [
  {
    id: 1,
    title: '有氧运动的好处',
    summary: '有氧运动能够提高心肺功能，增强免疫力，帮助燃烧脂肪，是保持身体健康的重要运动方式。本文详细介绍了有氧运动的各类益处和科学的运动时间安排。',
    cover: 'https://picsum.photos/id/1/600/400'
  },
  {
    id: 2,
    title: '办公室简易拉伸动作',
    summary: '长时间久坐容易导致肌肉僵硬，这些简易拉伸动作可以帮助您在工作间隙放松身心，预防职业病。每个动作都有详细的步骤说明和注意事项。',
    cover: 'https://picsum.photos/id/2/600/400'
  },
  {
    id: 3,
    title: '力量训练的重要性',
    summary: '力量训练不仅能够增加肌肉量，还能提高基础代谢率，改善骨骼健康，是全面健身计划中不可或缺的一部分。',
    cover: 'https://picsum.photos/id/7/600/400'
  },
  {
    id: 4,
    title: '运动前后的拉伸指南',
    summary: '正确的拉伸能够预防运动损伤，提高柔韧性，促进肌肉恢复。本文提供了完整的运动前后拉伸方案。',
    cover: 'https://picsum.photos/id/8/600/400'
  }
]
</script>

<style scoped>
.exercise-health-page {
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