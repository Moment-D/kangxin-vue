<template>
  <div class="article-detail-page">
    <NavHeader />
    <main class="content">
      <div v-if="article" class="article-detail">
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <span class="publish-date">{{ article.publishDate }}</span>
          <span class="category">{{ article.category }}</span>
        </div>
        <img :src="article.cover" :alt="article.title" class="article-cover">
        <div class="article-body">
          <div v-html="article.content"></div>
        </div>
        <div class="related-articles">
          <h3>相关推荐</h3>
          <div class="related-list">
            <div v-for="related in relatedArticles" :key="related.id" class="related-item">
              <router-link :to="`${basePath}/${related.id}`">
                <h4>{{ related.title }}</h4>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="loading">加载中...</div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavHeader from '../components/NavHeader.vue'

const route = useRoute()
const article = ref(null)
const relatedArticles = ref([])

// 计算基础路径
const basePath = computed(() => {
  const pathParts = route.path.split('/')
  return `/${pathParts[1]}/${pathParts[2]}`
})

// 模拟获取文章详情数据
const fetchArticleDetail = () => {
  const { id } = route.params

  const pathParts = route.path.split('/')
  const category = pathParts[2]
  
  // 模拟文章详情数据
  const articleDetails = {
    exercise: {
      1: {
        id: 1,
        title: '有氧运动的好处',
        publishDate: '2024-01-15',
        category: '运动健康',
        cover: 'https://picsum.photos/id/1/1200/600',
        content: `
          <h2>什么是有氧运动？</h2>
          <p>有氧运动是指人体在氧气充分供应的情况下进行的体育锻炼。在运动过程中，人体吸入的氧气与需求相等，达到生理上的平衡状态。</p>
          
          <h2>有氧运动的主要益处</h2>
          <h3>1. 提高心肺功能</h3>
          <p>定期进行有氧运动可以增强心脏收缩力，增加肺活量，提高心肺系统的工作效率。长期坚持可降低患心血管疾病的风险。</p>
          
          <h3>2. 增强免疫力</h3>
          <p>适度的有氧运动可以促进血液循环，增强白细胞和抗体的活性，帮助身体更好地抵御疾病入侵。</p>
          
          <h3>3. 帮助燃烧脂肪</h3>
          <p>有氧运动是最有效的脂肪燃烧方式之一。当运动持续20分钟以上时，身体会开始更多地利用脂肪作为能量来源。</p>
          
          <h3>4. 改善心理健康</h3>
          <p>运动时身体会分泌内啡肽，这是一种天然的"快乐激素"，可以缓解压力，改善情绪，甚至帮助对抗抑郁和焦虑。</p>
          
          <h2>推荐的有氧运动类型</h2>
          <ul>
            <li>慢跑</li>
            <li>游泳</li>
            <li>骑自行车</li>
            <li>快走</li>
            <li>跳绳</li>
            <li>有氧舞蹈</li>
          </ul>
          
          <h2>科学的运动时间安排</h2>
          <p>根据世界卫生组织的建议，成年人每周应至少进行150分钟中等强度的有氧运动，或75分钟高强度的有氧运动。</p>
          
          <p>可以这样安排：</p>
          <ul>
            <li>每周5天，每天30分钟的中等强度运动</li>
            <li>或者每周3天，每天25分钟的高强度运动</li>
            <li>运动强度以能够说话但不能唱歌为宜</li>
          </ul>
        `
      },
      2: {
        id: 2,
        title: '办公室简易拉伸动作',
        publishDate: '2024-01-10',
        category: '运动健康',
        cover: 'https://picsum.photos/id/2/1200/600',
        content: '<h2>办公室拉伸的重要性</h2><p>长时间久坐容易导致肌肉僵硬，血液循环不畅。</p>'
      },
      3: {
        id: 3,
        title: '力量训练的重要性',
        publishDate: '2024-01-08',
        category: '运动健康',
        cover: 'https://picsum.photos/id/7/1200/600',
        content: '<h2>力量训练对健康的益处</h2><p>力量训练不仅能够增加肌肉量，还能提高基础代谢率。</p>'
      },
      4: {
        id: 4,
        title: '运动前后的拉伸指南',
        publishDate: '2024-01-05',
        category: '运动健康',
        cover: 'https://picsum.photos/id/8/1200/600',
        content: '<h2>为什么需要拉伸？</h2><p>正确的拉伸能够预防运动损伤，提高柔韧性。</p>'
      }
    },
    diet: {
      1: {
        id: 1,
        title: '均衡膳食搭配原则',
        publishDate: '2024-01-12',
        category: '饮食健康',
        cover: 'https://picsum.photos/id/3/1200/600',
        content: '<h2>膳食金字塔</h2><p>了解科学的膳食搭配原则，确保摄入全面的营养。</p>'
      },
      2: {
        id: 2,
        title: '控糖饮食指南',
        publishDate: '2024-01-09',
        category: '饮食健康',
        cover: 'https://picsum.photos/id/4/1200/600',
        content: '<h2>如何科学控糖</h2><p>科学控糖不仅有助于预防糖尿病，还能提高身体能量水平。</p>'
      },
      3: {
        id: 3,
        title: '每日饮水量指南',
        publishDate: '2024-01-07',
        category: '饮食健康',
        cover: 'https://picsum.photos/id/9/1200/600',
        content: '<h2>为什么多喝水很重要</h2><p>充足的水分摄入对维持身体健康至关重要。</p>'
      },
      4: {
        id: 4,
        title: '季节性健康食材推荐',
        publishDate: '2024-01-03',
        category: '饮食健康',
        cover: 'https://picsum.photos/id/10/1200/600',
        content: '<h2>应季食材的优势</h2><p>应季食材不仅新鲜美味，营养也更为丰富。</p>'
      }
    },
    rest: {
      1: {
        id: 1,
        title: '优质睡眠时间表',
        publishDate: '2024-01-14',
        category: '作息健康',
        cover: 'https://picsum.photos/id/5/1200/600',
        content: '<h2>人体生物钟规律</h2><p>了解人体生物钟规律，建立科学的睡眠时间表。</p>'
      },
      2: {
        id: 2,
        title: '熬夜后身体调理方法',
        publishDate: '2024-01-11',
        category: '作息健康',
        cover: 'https://picsum.photos/id/6/1200/600',
        content: '<h2>如何缓解熬夜的伤害</h2><p>偶尔熬夜后如何快速恢复身体状态？</p>'
      },
      3: {
        id: 3,
        title: '科学午休的好处',
        publishDate: '2024-01-06',
        category: '作息健康',
        cover: 'https://picsum.photos/id/11/1200/600',
        content: '<h2>午休的科学依据</h2><p>适当的午休能够提高下午的工作效率，缓解疲劳。</p>'
      },
      4: {
        id: 4,
        title: '改善睡眠质量的环境布置',
        publishDate: '2024-01-02',
        category: '作息健康',
        cover: 'https://picsum.photos/id/12/1200/600',
        content: '<h2>理想的睡眠环境</h2><p>睡眠环境对睡眠质量有重要影响。</p>'
      }
    }
  }
  
  // 设置当前文章
  article.value = articleDetails[category]?.[id]
  
  // 模拟相关文章数据
  relatedArticles.value = [
    { id: 1, title: '相关文章1' },
    { id: 2, title: '相关文章2' },
    { id: 3, title: '相关文章3' }
  ]
}

onMounted(() => {
  fetchArticleDetail()
})
</script>

<style scoped>
.article-detail-page {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.article-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.article-detail h1 {
  color: #1890ff;
  font-size: 32px;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.article-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 30px;
}

.article-body {
  margin-bottom: 40px;
}

.article-body h2 {
  color: #1890ff;
  font-size: 24px;
  margin-top: 30px;
  margin-bottom: 15px;
}

.article-body h3 {
  color: #333;
  font-size: 20px;
  margin-top: 25px;
  margin-bottom: 10px;
}

.article-body p {
  margin-bottom: 15px;
}

.article-body ul, .article-body ol {
  margin-bottom: 15px;
  padding-left: 30px;
}

.article-body li {
  margin-bottom: 8px;
}

.related-articles {
  margin-top: 40px;
}

.related-articles h3 {
  color: #1890ff;
  font-size: 20px;
  margin-bottom: 20px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.related-item {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.3s ease;
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-item h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.related-item a {
  text-decoration: none;
  color: inherit;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 18px;
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
  
  .article-detail {
    padding: 20px;
  }
  
  .article-detail h1 {
    font-size: 24px;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>