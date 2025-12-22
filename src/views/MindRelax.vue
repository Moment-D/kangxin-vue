<!-- 心灵舒缓馆 -->
<template>
  <div class="mind-relax-page">
    <!-- 导航头部 - 使用现有的 NavHeader 组件 -->
    <NavHeader />

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 页面标题区域 -->
      <section class="page-header-section">
        <h1 class="main-title">心灵舒缓馆</h1>
        <p class="subtitle">通过游戏、音乐、故事多元化方式，帮您释放压力、平复情绪</p>
      </section>

      <!-- 核心功能模块区域 -->
      <section class="relax-modules-section">
        <div class="modules-grid">
          <!-- 游戏舒缓模块 -->
          <div class="module-card game-module">
            <div class="module-icon game-icon">🎮</div>
            <h2 class="module-title">轻松游戏</h2>
            <p class="module-description">
              简单有趣的小游戏，让您在轻松愉快的氛围中转移注意力，缓解压力
            </p>
            <div class="game-list">
              <div class="game-item">
                <span class="game-emoji">🐍</span>
                <span class="game-name">手势贪吃蛇</span>
              </div>
              <div class="game-item">
                <span class="game-emoji">🧩</span>
                <span class="game-name">俄罗斯方块</span>
              </div>
              <div class="game-item">
                <span class="game-emoji">📦</span>
                <span class="game-name">推箱子游戏</span>
              </div>
            </div>
            <button class="action-btn" @click="showAllGames">查看全部游戏 →</button>
          </div>

          <!-- 音乐舒缓模块 -->
          <div class="module-card music-module">
            <div class="module-icon music-icon">🎵</div>
            <h2 class="module-title">静心音乐</h2>
            <p class="module-description">
              精选舒缓音乐，帮助您放松身心，调整情绪状态
            </p>
            <!-- 替换原有的音乐播放器模板 -->
            <div class="music-player">
              <div class="music-album">
                <div class="album-cover">
                  <span class="album-emoji">🎵</span>
                </div>
                <div class="music-info">
                  <h3 class="music-title">{{ playerTitle }}</h3>
                  <p class="music-artist">{{ playerAuthor }}</p>
                </div>
              </div>
              <div class="music-controls">
                <button class="control-btn" @click="previousTrack">⏮️</button>
                <button class="control-btn" @click="togglePlay">{{ isPlaying ? '⏸️' : '▶️' }}</button>
                <button class="control-btn" @click="nextTrack">⏭️</button>
              </div>
              <div class="music-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="time-info">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
              </div>
            </div>
            <button class="action-btn" @click="showAllMusic">浏览音乐库 →</button>
          </div>

          <!-- 故事舒缓模块 -->
          <div class="module-card story-module">
            <div class="module-icon story-icon">📖</div>
            <h2 class="module-title">暖心故事</h2>
            <p class="module-description">
              温馨治愈的小故事，带给您心灵的慰藉和启发
            </p>
            <div class="story-list">
              <div class="story-item">
                <div class="story-content">
                  <h3 class="story-title">森林之旅</h3>
                  <p class="story-excerpt">在一片宁静的森林里，小兔子开始了一段奇妙的旅程...</p>
                </div>
                <span class="story-time">5分钟</span>
              </div>
              <div class="story-item">
                <div class="story-content">
                  <h3 class="story-title">星空夜话</h3>
                  <p class="story-excerpt">当夜幕降临，星星们开始讲述它们的故事...</p>
                </div>
                <span class="story-time">8分钟</span>
              </div>
            </div>
            <button class="action-btn" @click="showAllStories">查看更多故事 →</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_URLS } from '@/config/api.js'
import NavHeader from '../components/NavHeader.vue'
import router from '@/router'

// 添加登录检测函数
const getToken = () => {
  return localStorage.getItem('token')
}

const getUserId = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.id || null
    } catch (e) {
      console.warn('userInfo 解析失败')
      return null
    }
  }
  return null
}


// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_URLS.SOUL_ASSESS,
  timeout: 10000
})

const isPlaying = ref(false)
const progress = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const playerTitle = ref('请选择一个音频')
const playerAuthor = ref('')
const items = ref([]) // 音乐列表
const currentIndex = ref(0) // 当前播放索引
const audioPlayer = ref(null) // 隐形audio元素

// // 游戏功能
// const startGame = (gameType) => {
//   // 检查用户是否已登录
//   const token = getToken()
//   const userId = getUserId()
//   if (!userId || !token) {
//     alert('请先登录后再玩游戏')
//     return
//   }

//   console.log(`开始游戏: ${gameType}`)
//   // alert(`准备开始${gameType === 'relaxPuzzle' ? '手势贪吃蛇' : gameType === 'breathingExercise' ? '粒子动效' : '推箱子游戏'}游戏`)
//   if (gameType === 'relaxPuzzle') {
//     router.push({ name: 'SnakeGame' })
//   } else if (gameType === 'breathingExercise') {
//     router.push({ name: 'ParticleEffect' })
//   } else if (gameType === 'sokoban') {
//     router.push({ name: 'Sokoban' })
//   }
// }

const showAllGames = () => {
  const token = getToken()
  const userId = getUserId()
  if (!userId || !token) {
    alert('请先登录后查看所有游戏')
    return
  }

  console.log('查看全部游戏')
  router.push({ name: 'MindRelaxGame' })
}

// 加载音乐列表
const loadMusicList = async () => {
  try {
    const response = await axiosInstance.get('/music/findPage', {
      params: { pageNum: 1, pageSize: 5 }
    })

    if (response.data.code === 200) {
      items.value = response.data.data.list || []
      if (items.value.length > 0) {
        // 默认设置第一个为当前播放
        updateCurrentTrack(0)
      }
    }
  } catch (error) {
    console.error('加载音乐列表失败:', error)
  }
}

// 更新当前播放曲目
const updateCurrentTrack = (index) => {
  if (index >= 0 && index < items.value.length) {
    currentIndex.value = index
    const item = items.value[index]
    playerTitle.value = item.musicName
    playerAuthor.value = item.singer
  }
}

// 播放音频
const playAudio = async (index) => {
  if (index >= 0 && index < items.value.length) {
    updateCurrentTrack(index)

    const item = items.value[index]
    const id = item.musicId

    // 增加播放次数
    try {
      await axiosInstance.post(`/music/play/${id}`)
    } catch (error) {
      console.warn('更新播放次数失败:', error)
    }

    // 获取音频流URL
    const streamUrl = `${API_URLS.SOUL_ASSESS}/audio/music/${id}`

    // 创建临时audio元素进行播放
    if (!audioPlayer.value) {
      audioPlayer.value = new Audio()
      audioPlayer.value.addEventListener('timeupdate', updateProgress)
      audioPlayer.value.addEventListener('ended', nextTrack)
      audioPlayer.value.addEventListener('loadedmetadata', () => {
        duration.value = audioPlayer.value.duration
      })
    }

    audioPlayer.value.src = streamUrl
    audioPlayer.value.load()

    setTimeout(async () => {
      try {
        await audioPlayer.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('播放失败:', error)
        isPlaying.value = false
      }
    }, 500)
  }
}

// 切换播放/暂停
const togglePlay = async () => {
  if (items.value.length === 0) {
    await loadMusicList()
    if (items.value.length > 0) {
      await playAudio(0)
      return
    }
  }

  if (!audioPlayer.value) return

  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    await audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 上一首
const previousTrack = () => {
  if (items.value.length === 0) return

  const newIndex = (currentIndex.value - 1 + items.value.length) % items.value.length
  playAudio(newIndex)
}

// 下一首
const nextTrack = () => {
  if (items.value.length === 0) return

  const newIndex = (currentIndex.value + 1) % items.value.length
  playAudio(newIndex)
}

// 更新播放进度
const updateProgress = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
    duration.value = audioPlayer.value.duration || 0
    progress.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
  }
}

// 格式化时间
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// 在组件挂载时加载音乐列表
onMounted(() => {
  // 检查用户是否已登录
  const token = getToken()
  const userId = getUserId()
  if (!userId || !token) {
    alert('请先登录后再访问此页面')
    // 可以选择重定向到登录页面
    // router.push('/login')
  }

  loadMusicList()
})

const showAllMusic = () => {
  const token = getToken()
  const userId = getUserId()
  if (!userId || !token) {
    alert('请先登录后浏览音乐库')
    return
  }

  console.log('浏览音乐库')
  router.push({ name: 'MindRelaxMusic' })
}

const showAllStories = () => {
  const token = getToken()
  const userId = getUserId()
  if (!userId || !token) {
    alert('请先登录后查看所有故事')
    return
  }

  console.log('查看更多故事')
  router.push({ name: 'MindRelaxStory' })
}
</script>

<style scoped>
/* 页面基础样式 */
.mind-relax-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* 页面标题区域 */
.page-header-section {
  text-align: center;
  margin-bottom: 48px;
  color: white;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* 核心功能模块区域 */
.relax-modules-section {
  margin-bottom: 64px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.module-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.module-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
}

.module-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* 游戏模块样式 */
.game-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.game-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.game-emoji {
  font-size: 1.5rem;
  margin-right: 12px;
}

.game-name {
  font-weight: 500;
  color: #495057;
}

/* 音乐模块样式 */
.music-player {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.music-album {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.album-cover {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.album-emoji {
  font-size: 2rem;
}

.music-info {
  flex: 1;
}

.music-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.music-artist {
  font-size: 0.875rem;
  color: #666;
}

.music-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

.music-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.time-info {
  font-size: 0.75rem;
  color: #666;
  text-align: right;
}

/* 故事模块样式 */
.story-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.story-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.story-item:hover {
  background: #e9ecef;
}

.story-content {
  flex: 1;
}

.story-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.story-excerpt {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
}

.story-time {
  font-size: 0.75rem;
  color: #999;
  background: #dee2e6;
  padding: 4px 8px;
  border-radius: 12px;
  align-self: center;
}

/* 按钮样式 */
.action-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 快速入口区域 */
.quick-access-section {
  text-align: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: white;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  backdrop-filter: blur(10px);
}

.quick-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.quick-emoji {
  font-size: 2rem;
}

.quick-text {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .module-card {
    padding: 24px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-btn {
    width: 200px;
  }
}
</style>