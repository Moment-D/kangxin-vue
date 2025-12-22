<template>
  <NavHeader />
  <div class="game-container">
    <iframe ref="gameFrame" :src="gameUrl" frameborder="0" width="100%" height="800px" @load="onGameLoad"></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { API_URLS } from '@/config/api.js'
import NavHeader from '@/components/NavHeader.vue'

// 响应式数据
const gameUrl = ref('/snake-game.html')
const gameFrame = ref(null)
const relaxationRecordData = ref(null)

// 配置axios实例
const axiosInstance = axios.create({
  baseURL: API_URLS.SOUL_ASSESS,
  timeout: 10000
})

// 获取用户ID
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

// 创建放松记录
const createRelaxationRecord = () => {
  const sessionRecord = sessionStorage.getItem('mindRelaxSession')
  if (sessionRecord) {
    relaxationRecordData.value = JSON.parse(sessionRecord)
    // 如果已有记录，更新 entryTime 为当前时间
    relaxationRecordData.value.entryTime = new Date().getTime()
    return
  }

  const userId = getUserId()
  if (!userId) return

  relaxationRecordData.value = {
    userId: userId,
    relaxType: '贪吃蛇游戏',
  }

  sessionStorage.setItem('mindRelaxSession', JSON.stringify(relaxationRecordData.value))
}

// 更新放松记录
const updateRelaxationRecord = async (isFinal = false) => {
  if (!relaxationRecordData.value || !relaxationRecordData.value.entryTime) return

  try {
    const exitTime = new Date().getTime()
    const durationInMinutes = Math.round((exitTime - relaxationRecordData.value.entryTime) / 60000)

    if (isFinal) {
      // 最终上报
      const updatedRecord = {
        ...relaxationRecordData.value,
        useDuration: durationInMinutes
      }

      delete updatedRecord.entryTime

      await axiosInstance.post('/relaxation', updatedRecord)

      // 清理 sessionStorage
      sessionStorage.removeItem('mindRelaxSession')
      relaxationRecordData.value = null
    } else {
      // 临时更新 - 仅保存当前进度
      relaxationRecordData.value.currentDuration = durationInMinutes
      sessionStorage.setItem('mindRelaxSession', JSON.stringify(relaxationRecordData.value))
    }
  } catch (error) {
    console.error('更新放松记录失败:', error)
  }
}

// 浏览器后退事件处理
const handleBrowserBack = () => {
  updateRelaxationRecord(true)
}

// iframe加载完成回调
const onGameLoad = () => {
  console.log('游戏加载完成')
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('popstate', handleBrowserBack)
  createRelaxationRecord()
})

onUnmounted(() => {
  window.removeEventListener('popstate', handleBrowserBack)
  updateRelaxationRecord(true)
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>