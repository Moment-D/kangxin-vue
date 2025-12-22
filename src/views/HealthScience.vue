<template>
  <div class="health-science-page">
    <NavHeader />
    <!-- 替换后的顶部横幅区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">健康生活指南</h1>
        <p class="banner-desc">
          欢迎来到「健康生活指南」科普页！我们专注分享科学、实用的运动、饮食与作息的健康知识，你可点击下放视频进行观看，助您理解身体、优化生活方式，稳步迈向更有活力的每一天。
        </p>
      </div>
    </div>
    
    <!-- 悬浮分类标题（保留） -->
    <div class="sticky-category" :class="{ show: showStickyTitle }">
      <h2>{{ currentStickyTitle }}</h2>
    </div>
    
    <main class="content">
      <!-- 运动健康分类 -->
      <section 
        class="category-section" 
        id="section-sport"
        ref="sportRef"
      >
        <div class="videos-grid">
          <div 
            v-for="(article, index) in displayExerciseArticles" 
            :key="article.scienceId"
            class="video-card"
            :ref="el => { if (el) videoRefs[index] = el }"
          >
            <div class="video-container" @click="openVideoPlayer(article)">
              <img 
                :src="article.coverOssUrl" 
                :alt="article.title" 
                class="article-cover" 
                @error="handleImageError(article)"
                loading="lazy"
              >
              <div class="play-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.8)"/>
                  <path d="M9 7L16 12L9 17V7Z" fill="#1890ff"/>
                </svg>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ article.title }}</h3>
              <p class="publish-time">发布时间：{{ formatTime(article.publishTime) }}</p>
            </div>
          </div>
          
          <div class="loading-item" v-if="loadingMore && currentCategory === 'sport'">
            <p>加载中...</p>
          </div>
        </div>
      </section>

      <!-- 饮食健康分类 -->
      <section 
        class="category-section" 
        id="section-diet"
        ref="dietRef"
      >
        <div class="videos-grid">
          <div 
            v-for="(article, index) in displayDietArticles" 
            :key="article.scienceId"
            class="video-card"
            :ref="el => { if (el) dietVideoRefs[index] = el }"
          >
            <div class="video-container" @click="openVideoPlayer(article)">
              <img 
                :src="article.coverOssUrl" 
                :alt="article.title" 
                class="article-cover" 
                @error="handleImageError(article)"
                loading="lazy"
              >
              <div class="play-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.8)"/>
                  <path d="M9 7L16 12L9 17V7Z" fill="#1890ff"/>
                </svg>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ article.title }}</h3>
              <p class="publish-time">发布时间：{{ formatTime(article.publishTime) }}</p>
            </div>
          </div>
          
          <div class="loading-item" v-if="loadingMore && currentCategory === 'diet'">
            <p>加载中...</p>
          </div>
        </div>
      </section>

      <!-- 作息健康分类 -->
      <section 
        class="category-section" 
        id="section-rest"
        ref="restRef"
      >
        <div class="videos-grid">
          <div 
            v-for="(article, index) in displayRestArticles" 
            :key="article.scienceId"
            class="video-card"
            :ref="el => { if (el) restVideoRefs[index] = el }"
          >
            <div class="video-container" @click="openVideoPlayer(article)">
              <img 
                :src="article.coverOssUrl" 
                :alt="article.title" 
                class="article-cover" 
                @error="handleImageError(article)"
                loading="lazy"
              >
              <div class="play-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.8)"/>
                  <path d="M9 7L16 12L9 17V7Z" fill="#1890ff"/>
                </svg>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ article.title }}</h3>
              <p class="publish-time">发布时间：{{ formatTime(article.publishTime) }}</p>
            </div>
          </div>
          
          <div class="loading-item" v-if="loadingMore && currentCategory === 'rest'">
            <p>加载中...</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 视频播放弹窗 -->
    <div class="video-modal" v-if="showVideoModal">
      <div class="modal-overlay" @click="closeVideoPlayer()"></div>
      <div class="modal-content">
        <button class="close-btn" @click="closeVideoPlayer()">×</button>
        <div class="video-player-container">
          <h3>{{ currentVideo?.title }}</h3>
          <video 
            :src="currentVideo?.videoOssUrl" 
            :poster="currentVideo?.coverOssUrl"
            controls 
            class="video-player"
            preload="metadata"
          >
            您的浏览器不支持HTML5视频播放，请升级浏览器
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import NavHeader from '../components/NavHeader.vue'

// 基础数据
const loading = ref(true)
const showStickyTitle = ref(false)
const currentStickyTitle = ref('运动健康')
const currentCategory = ref('sport')
const loadingMore = ref(false)

// 原始接口数据
const allExerciseArticles = ref([])
const allDietArticles = ref([])
const allRestArticles = ref([])

// 分页显示数据
const sportPage = ref(1)
const dietPage = ref(1)
const restPage = ref(1)
const pageSize = 6 

// 计算属性
const displayExerciseArticles = computed(() => {
  const end = sportPage.value * pageSize
  return allExerciseArticles.value.slice(0, end)
})

const displayDietArticles = computed(() => {
  const end = dietPage.value * pageSize
  return allDietArticles.value.slice(0, end)
})

const displayRestArticles = computed(() => {
  const end = restPage.value * pageSize
  return allRestArticles.value.slice(0, end)
})

// 懒加载相关DOM引用
const videoRefs = ref([])
const dietVideoRefs = ref([])
const restVideoRefs = ref([])

// DOM引用
const sportRef = ref(null)
const dietRef = ref(null)
const restRef = ref(null)

// 视频播放相关
const showVideoModal = ref(false)
const currentVideo = ref(null)

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 处理图片加载失败
const handleImageError = (article) => {
  article.coverOssUrl = 'https://picsum.photos/id/237/600/400'
}

// 打开视频播放弹窗
const openVideoPlayer = (videoInfo) => {
  currentVideo.value = videoInfo
  showVideoModal.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭视频播放弹窗
const closeVideoPlayer = () => {
  showVideoModal.value = false
  currentVideo.value = null
  document.body.style.overflow = 'auto'
}

// 原始后端接口调用
const getHealthData = async () => {
  try {
    const response = await fetch('http://localhost:8085/api/health-science/health/allInfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`请求失败，状态码：${response.status}`)
    }

    const result = await response.json()
    
    if (result.code === 200 && result.data) {
      allExerciseArticles.value = result.data.filter(item => item.scienceType === '运动健康')
      allDietArticles.value = result.data.filter(item => item.scienceType === '饮食健康')
      allRestArticles.value = result.data.filter(item => item.scienceType === '作息健康')
    } else {
      console.error('获取数据失败：', result.msg || '未知错误')
    }
  } catch (error) {
    console.error('接口请求异常：', error)
    alert('数据加载失败，请检查网络或后端服务是否正常')
  } finally {
    loading.value = false
  }
}

// 加载更多数据
const loadMoreData = (category) => {
  if (loadingMore.value) return
  
  loadingMore.value = true
  
  setTimeout(() => {
    switch (category) {
      case 'sport':
        if (displayExerciseArticles.value.length < allExerciseArticles.value.length) {
          sportPage.value += 1
        }
        break
      case 'diet':
        if (displayDietArticles.value.length < allDietArticles.value.length) {
          dietPage.value += 1
        }
        break
      case 'rest':
        if (displayRestArticles.value.length < allRestArticles.value.length) {
          restPage.value += 1
        }
        break
    }
    loadingMore.value = false
  }, 500)
}

// 检测悬浮标题显示
const checkStickyTitle = () => {
  const scrollTop = window.scrollY
  
  const sportRect = sportRef.value?.getBoundingClientRect()
  const dietRect = dietRef.value?.getBoundingClientRect()
  const restRect = restRef.value?.getBoundingClientRect()
  
  if (sportRect && sportRect.top <= 50 && dietRect && dietRect.top > 50) {
    currentStickyTitle.value = '运动健康'
    currentCategory.value = 'sport'
    showStickyTitle.value = true
  } else if (dietRect && dietRect.top <= 50 && restRect && restRect.top > 50) {
    currentStickyTitle.value = '饮食健康'
    currentCategory.value = 'diet'
    showStickyTitle.value = true
  } else if (restRect && restRect.top <= 50) {
    currentStickyTitle.value = '作息健康'
    currentCategory.value = 'rest'
    showStickyTitle.value = true
  } else if (scrollTop < 100) {
    showStickyTitle.value = false
  }
}

// 监听滚动事件
const handleScroll = () => {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  
  checkStickyTitle()
  checkLazyLoad(scrollTop, windowHeight)
}

// 检测懒加载
const checkLazyLoad = (scrollTop, windowHeight) => {
  let lastRef
  switch (currentCategory.value) {
    case 'sport':
      lastRef = videoRefs.value[videoRefs.value.length - 1]
      break
    case 'diet':
      lastRef = dietVideoRefs.value[dietVideoRefs.value.length - 1]
      break
    case 'rest':
      lastRef = restVideoRefs.value[restVideoRefs.value.length - 1]
      break
  }
  
  if (!lastRef) return
  
  const rect = lastRef.getBoundingClientRect()
  if (rect.top < windowHeight + 200) {
    const hasMore = currentCategory.value === 'sport' 
      ? displayExerciseArticles.value.length < allExerciseArticles.value.length
      : currentCategory.value === 'diet'
        ? displayDietArticles.value.length < allDietArticles.value.length
        : displayRestArticles.value.length < allRestArticles.value.length
    
    if (hasMore) {
      loadMoreData(currentCategory.value)
    }
  }
}

// 页面挂载时初始化
onMounted(async () => {
  await getHealthData()
  window.addEventListener('scroll', handleScroll)
})

// 页面卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.health-science-page {
  min-height: 100vh;
  background-color: rgb(236, 245, 255);
  padding-bottom: 60px;
}

/* 替换后的顶部横幅 */
.banner-section {
  /* 背景图 + 80%透明度 */
  background: rgba(0, 0, 0, 0.2) url('@/assets/主页图像3.png') center/cover no-repeat;
  /* 圆角 */
  border-radius: 50px;

  max-width: 60%;
  margin: 0 auto 40px;
  padding: 40px 20px;
  text-align: center;
}

.banner-title {
  font-size: 36px;
  color: black;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.banner-desc {
  font-size: 16px;
  color:black;
  line-height: 1.6;
  margin: 0;
  max-width: 800px;
  margin: 0 auto;
}

/* 悬浮分类标题 - 核心修改部分 */
.sticky-category {
  position: fixed;
  top: 0;
  left: 0; /* 固定在左上角 */
  width: 250px; /* 宽度自适应内容，不再占满全屏 */
  background: rgba(255, 255, 255, 1) url('@/assets/分类背景.jpg') center/cover no-repeat; /* 背景图 + 80%不透明度（等同于20%透明度） */
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  border-bottom: 2px solid #1890ff;
  border-radius: 0 0 8px 0; /* 右下角圆角，视觉更友好 */
  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.3s ease;
}

.sticky-category.show {
  opacity: 1;
  transform: translateY(0);
}

.sticky-category h2 {
  margin: 0;
  font-size: 24px;
  color: rgb(248, 152, 152);
  padding-left: 0; /* 移除左侧内边距，适配左上角布局 */
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

/* 分类区域 */
.category-section {
  background-color: transparent;
  border-radius: 0;
  padding: 0 0 40px 0;
  margin-bottom: 40px;
  box-shadow: none;
  scroll-margin-top: 80px;
}

/* 视频卡片网格 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 视频卡片 */
.video-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.video-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.article-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.video-card:hover .article-cover {
  transform: scale(1.05);
  opacity: 0.9;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.video-card:hover .play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-info h3 {
  color: #333;
  font-size: 18px;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.publish-time {
  color: #999;
  font-size: 14px;
  margin: 0;
  margin-top: auto;
}

/* 加载中提示 */
.loading-item {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 16px;
}

/* 视频弹窗样式 */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1;
  padding: 24px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  z-index: 2;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.video-player-container {
  padding: 10px 0;
}

.video-player-container h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 20px;
  text-align: center;
}

.video-player {
  width: 100%;
  height: auto;
  min-height: 400px;
  border-radius: 4px;
  object-fit: cover;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .banner-section {
    max-width: 90%;
    padding: 30px 16px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-desc {
    font-size: 14px;
  }
  
  .sticky-category h2 {
    font-size: 20px;
  }
  
  .content {
    padding: 0 16px;
  }
  
  .category-section {
    padding: 0 0 30px 0;
    margin-bottom: 30px;
  }
  
  .videos-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .video-container {
    height: 200px;
  }
  
  .modal-content {
    width: 95%;
    max-height: 80vh;
    padding: 16px;
  }
  
  .video-player {
    min-height: 250px;
  }
}
</style>