<template>
  <NavHeader />
  <div class="container">

    <header>
      <h1>心灵舒缓</h1>
      <p>放松心情，享受音乐</p>
    </header>

    <main>
      <section class="tabs">
        <button id="musicTab" class="tab-btn active">
          舒缓音乐
        </button>
      </section>

      <section class="search-section">
        <input type="text" id="searchInput" placeholder="搜索..." v-model="searchKeyword" @keyup.enter="search">
        <button @click="search">搜索</button>
      </section>

      <section id="contentSection" class="content-section">
        <div id="loading" class="loading" v-if="loading">加载中...</div>
        <div id="itemList" class="item-list" v-else>
          <div v-if="items.length === 0" class="no-data">暂无数据</div>
          <div v-for="item in items" :key="getItemId(item)" class="item">
            <div class="item-info">
              <h4>{{ getItemTitle(item) }}</h4>
              <p>{{ getItemAuthor(item) || '未知作者' }}</p>
              <p>播放次数: {{ item.playCount || 0 }}</p>
            </div>
            <div class="item-actions">
              <button @click="playAudio(getItemId(item))">播放</button>
              <button @click="viewDetails(getItemId(item))">详情</button>
            </div>
          </div>
        </div>
      </section>

      <section class="pagination" v-if="pageData.total > 0">
        <button id="prevBtn" @click="changePage(-1)" :disabled="pageData.pageNum <= 1">
          上一页
        </button>
        <span id="pageInfo">第 {{ pageData.pageNum }} 页 / 共 {{ pageData.pages }} 页</span>
        <button id="nextBtn" @click="changePage(1)" :disabled="pageData.pageNum >= pageData.pages">
          下一页
        </button>
      </section>

      <section class="player-section">
        <div class="player-info">
          <h3 id="playerTitle">{{ playerTitle }}</h3>
          <p id="playerAuthor">{{ playerAuthor }}</p>
          <div id="playerStatus" :class="['status', playerStatus.class]">
            {{ playerStatus.text }}
          </div>
          <!-- 只在点击详情时显示详细信息 -->
          <div id="playerDetails" class="details" v-html="playerDetails" v-if="showDetails"></div>
        </div>
        <audio id="audioPlayer" ref="audioPlayer" controls @error="handleAudioError" @loadeddata="handleAudioLoaded"
          @loadstart="handleAudioLoadStart" @loadedmetadata="handleAudioMetadata" @canplay="handleAudioCanPlay"
          @waiting="handleAudioWaiting" @playing="handleAudioPlaying" @stalled="handleAudioStalled"
          @abort="handleAudioAbort" @suspend="handleAudioSuspend" @emptied="handleAudioEmptied"></audio>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { API_URLS } from '@/config/api.js';
import NavHeader from '../components/NavHeader.vue';

export default {
  name: 'MindRelaxMusic',
  components: {
    NavHeader
  },
  setup() {
    // 配置axios基础URL
    const axiosInstance = axios.create({
      baseURL: API_URLS.SOUL_ASSESS,
      timeout: 10000
    });
    const relaxationRecordData = ref(null);

    // 响应式数据 (仅保留音乐功能)
    const currentPage = ref(1);
    const searchKeyword = ref('');
    const pageSize = 10;
    const loading = ref(false);
    const items = ref([]);
    const currentAudioId = ref(null);
    const showDetails = ref(false); // 控制详情显示的响应式变量

    const pageData = reactive({
      pageNum: 1,
      pages: 1,
      total: 0
    });

    const playerTitle = ref('请选择一个音频');
    const playerAuthor = ref('');
    const playerStatus = reactive({
      text: '',
      class: ''
    });
    const playerDetails = ref('');

    const audioPlayer = ref(null);

    // 获取用户ID的函数
    const getUserId = () => {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          return userInfo.id || null;
        } catch (e) {
          console.warn('userInfo 解析失败');
          return null;
        }
      }
      return null;
    };

    // 创建放松记录
    const createRelaxationRecord = () => {
      const userId = getUserId();
      if (!userId) return;

      // 只记录本地数据，不发送请求
      relaxationRecordData.value = {
        userId: userId,
        relaxType: '音乐',
      };
      relaxationRecordData.value.entryTime = new Date(); // 记录进入时间
    };

    // 更新放松记录
    const updateRelaxationRecord = async () => {
      if (!relaxationRecordData.value || !relaxationRecordData.value.entryTime) return;

      try {
        const exitTime = new Date();
        const durationInMinutes = Math.round((exitTime - relaxationRecordData.value.entryTime) / 60000); // 转换为分钟

        const updatedRecord = {
          ...relaxationRecordData.value,
          useDuration: durationInMinutes
        };

        // 删除 entryTime 属性，因为它是本地添加的
        delete updatedRecord.entryTime;

        await axiosInstance.post('/relaxation', updatedRecord);

        // 重置记录
        relaxationRecordData.value = null;
      } catch (error) {
        console.error('更新放松记录失败:', error);
      }
    };

    // 监听浏览器后退事件
    const handleBrowserBack = () => {
      updateRelaxationRecord();
    };

    onMounted(() => {
      // 添加事件监听器
      window.addEventListener('popstate', handleBrowserBack);
      // 创建放松记录
      createRelaxationRecord();
      loadData();
    });

    onUnmounted(() => {
      updateRelaxationRecord();
      // 移除事件监听器
      window.removeEventListener('popstate', handleBrowserBack);
    });

    // 计算属性方法 (仅保留音乐相关)
    const getItemId = (item) => item.musicId;
    const getItemTitle = (item) => item.musicName;
    const getItemAuthor = (item) => item.singer;

    const search = () => {
      currentPage.value = 1;
      loadData();
    };

    const loadData = async () => {
      loading.value = true;
      resetPlayer();

      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize
      };

      // 添加搜索参数 (仅音乐)
      if (searchKeyword.value.trim()) {
        params.name = searchKeyword.value.trim();
      }

      // 发送请求 (仅音乐分页)
      const url = '/music/findPage';

      try {
        const response = await axiosInstance.get(url, { params });
        const data = response.data;

        if (data.code === 200) {
          items.value = data.data.list || [];
          Object.assign(pageData, {
            pageNum: data.data.pageNum,
            pages: data.data.pages,
            total: data.data.total
          });
        } else {
          showError(data.msg || '加载数据失败');
        }
      } catch (error) {
        showError('网络错误，请稍后重试');
        console.error('Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const changePage = (direction) => {
      const newPage = currentPage.value + direction;
      if (newPage >= 1 && newPage <= pageData.pages) {
        currentPage.value = newPage;
        loadData();
      }
    };

    const playAudio = async (id) => {
      currentAudioId.value = id;

      // 增加播放次数 (仅音乐)
      const playUrl = `/music/play/${id}`;

      try {
        await axiosInstance.post(playUrl);
      } catch (error) {
        console.warn('更新播放次数失败:', error);
      }

      // 获取音频流URL (音乐) - 优化URL路径，与故事页面保持一致
      const streamUrl = `${API_URLS.SOUL_ASSESS}/audio/music/${id}`;

      // 重置状态
      playerStatus.text = '正在准备音频...';
      playerStatus.class = '';
      playerDetails.value = ''; // 清空详细信息
      showDetails.value = false; // 隐藏详细信息

      // 获取基本详情信息（不显示详细信息）
      await viewBasicDetails(id);

      // 设置音频源并开始加载
      if (audioPlayer.value) {
        audioPlayer.value.src = streamUrl;
        audioPlayer.value.load();

        // 延迟播放
        setTimeout(() => {
          attemptPlay();
        }, 800);
      }
    };

    const attemptPlay = async () => {
      if (!audioPlayer.value || audioPlayer.value.readyState < 2) {
        setTimeout(() => {
          attemptPlay();
        }, 500);
        return;
      }

      try {
        await audioPlayer.value.play();
        playerStatus.text = '正在播放音频...';
        playerStatus.class = 'success';
      } catch (error) {
        console.error('自动播放失败:', error);

        if (error.name === 'NotAllowedError') {
          playerStatus.text = '⚠️ 浏览器阻止了自动播放，请点击播放按钮';
          playerStatus.class = 'warning';
        } else if (error.name === 'NotSupportedError') {
          playerStatus.text = '❌ 音频格式不受支持';
          playerStatus.class = 'error';
        } else {
          playerStatus.text = '播放失败: ' + error.message;
          playerStatus.class = 'error';
        }

        diagnoseAudioProblem();
      }
    };

    // 新增：只获取基本信息，不显示详细信息
    const viewBasicDetails = async (id) => {
      // 获取详情 (音乐)
      const detailUrl = `/music/${id}`;

      try {
        const response = await axiosInstance.get(detailUrl);
        const data = response.data;

        if (data.code === 200) {
          const item = data.data;
          playerTitle.value = item.musicName;
          playerAuthor.value = item.singer;
        } else {
          showError(data.msg || '获取详情失败');
        }
      } catch (error) {
        showError('获取详情失败');
        console.error('Error:', error);
      }
    };

    const viewDetails = async (id) => {
      // 先获取基本信息
      await viewBasicDetails(id);

      // 再获取音频详细信息
      await getAudioInfo(id);

      // 显示详细信息
      showDetails.value = true;
    };

    const getAudioInfo = async (id) => {
      // 获取音频信息 (音乐)
      const infoUrl = `/audio/info/music/${id}`;

      try {
        const response = await axiosInstance.get(infoUrl);
        const data = response.data;

        if (data.code === 200) {
          const audioInfo = data.data;
          console.log('音频信息获取成功:', audioInfo);

          // 检查音频可访问性
          if (!audioInfo.accessible) {
            playerStatus.text = '⚠️ 音频文件无法访问，请检查文件路径或网络连接';
            playerStatus.class = 'error';
            console.error('音频文件不可访问:', audioInfo.url);
          }

          // 检查文件大小
          let sizeWarning = '';
          if (audioInfo.contentLength === 0) {
            sizeWarning = '<p style="color: red;"><strong>⚠️ 警告: 文件大小为0，可能为空文件</strong></p>';
          } else if (audioInfo.contentLength < 1024) {
            sizeWarning = '<p style="color: orange;"><strong>⚠️ 警告: 文件异常小，可能已损坏</strong></p>';
          }

          // 检查响应代码
          let responseWarning = '';
          if (audioInfo.responseCode && audioInfo.responseCode !== 200) {
            responseWarning = `<p style="color: red;"><strong>⚠️ HTTP响应代码异常: ${audioInfo.responseCode}</strong></p>`;
          }

          playerDetails.value = `
            <div class="audio-details">
              <p><strong>🏷️ 名称:</strong> ${audioInfo.name}</p>
              <p><strong>🔗 URL:</strong> <span style="font-size: 11px; word-break: break-all; font-family: monospace;">${audioInfo.url}</span></p>
                <p><strong>📋 类型:</strong> ${audioInfo.contentType || '未知'}</p>
              <p><strong>📦 大小:</strong> ${formatBytes(audioInfo.contentLength)}</p>
              <p><strong>✅ 可访问:</strong> ${audioInfo.accessible ? '✅ 是' : '❌ 否'}</p>
              <p><strong>🌐 HTTP状态:</strong> ${audioInfo.responseCode || '未知'}</p>
              ${sizeWarning}
              ${responseWarning}
            </div>
          `;

        } else {
          console.warn('获取音频信息失败:', data.msg);
          playerStatus.text = '❌ 无法获取音频信息: ' + data.msg;
          playerStatus.class = 'error';
        }
      } catch (error) {
        console.error('获取音频信息失败:', error);
        playerStatus.text = '❌ 网络错误: 无法连接到音频服务器';
        playerStatus.class = 'error';
      }
    };

    const resetPlayer = () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.src = '';
      }
      playerTitle.value = '请选择一个音频';
      playerAuthor.value = '';
      playerStatus.text = '';
      playerStatus.class = '';
      playerDetails.value = '';
      currentAudioId.value = null;
      showDetails.value = false; // 重置详情显示状态
    };

    const showError = (message) => {
      items.value = [];
      console.error('错误:', message);
    };

    // 音频事件处理
    const handleAudioError = (e) => {
      console.error('音频加载错误:', e);
      const audioElement = e.target;

      let errorMessage = '音频播放失败';
      let errorType = '未知错误';

      if (audioElement.error) {
        switch (audioElement.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = '音频加载被中止';
            errorType = 'MEDIA_ERR_ABORTED';
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = '网络错误导致音频加载失败';
            errorType = 'MEDIA_ERR_NETWORK';
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMessage = '音频解码失败，格式可能不受支持';
            errorType = 'MEDIA_ERR_DECODE';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = '音频格式不受支持或源文件不可访问';
            errorType = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
            break;
        }
      }

      playerStatus.text = '❌ ' + errorMessage;
      playerStatus.class = 'error';
      diagnoseAudioProblem(errorType, audioElement);
    };

    const handleAudioLoaded = (e) => {
      const audioElement = e.target;
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        playerStatus.text = `音频已加载 (时长: ${formatTime(audioElement.duration)})`;
        playerStatus.class = '';
      }
    };

    const handleAudioLoadStart = () => {
      playerStatus.text = '开始加载音频...';
      playerStatus.class = '';
    };

    const handleAudioMetadata = () => {
      playerStatus.text = '音频元数据加载完成';
      playerStatus.class = '';
    };

    const handleAudioCanPlay = () => {
      playerStatus.text = '音频可以开始播放';
      playerStatus.class = 'success';
    };

    const handleAudioWaiting = () => {
      playerStatus.text = '音频缓冲中，请稍候...';
      playerStatus.class = '';
    };

    const handleAudioPlaying = () => {
      playerStatus.text = '正在播放音频';
      playerStatus.class = 'success';
    };

    const handleAudioStalled = () => {
      playerStatus.text = '音频加载停滞';
      playerStatus.class = 'error';
    };

    const handleAudioAbort = () => {
      playerStatus.text = '音频加载被中止';
      playerStatus.class = 'error';
    };

    const handleAudioSuspend = () => {
      playerStatus.text = '音频加载被暂停';
      playerStatus.class = '';
    };

    const handleAudioEmptied = () => {
      playerStatus.text = '音频源已清空';
      playerStatus.class = '';
    };

    const diagnoseAudioProblem = (errorType, audioElement) => {
      if (!audioElement) audioElement = audioPlayer.value;
      if (!audioElement) return;

      console.log('=== 音频诊断信息 ===');
      console.log('当前源:', audioElement.src);
      console.log('就绪状态:', audioElement.readyState);
      console.log('网络状态:', audioElement.networkState);
      console.log('错误信息:', audioElement.error);
      console.log('错误类型:', errorType);

      // 尝试直接访问音频URL
      fetch(audioElement.src, { method: 'HEAD' })
        .then(response => {
          console.log('直接访问URL的响应状态:', response.status);
          console.log('Content-Type:', response.headers.get('Content-Type'));
          console.log('Content-Length:', response.headers.get('Content-Length'));
          console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));

          if (!response.ok) {
            switch (response.status) {
              case 404:
                playerStatus.text = '❌ 音频文件不存在 (404)';
                break;
              case 403:
                playerStatus.text = '❌ 访问被拒绝，可能是CORS问题 (403)';
                break;
              case 500:
                playerStatus.text = '❌ 服务器内部错误 (500)';
                break;
              default:
                playerStatus.text = `❌ 服务器错误 (${response.status})`;
            }
          }
        })
        .catch(error => {
          console.error('直接访问URL失败:', error);
          if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            playerStatus.text = '❌ 网络错误: 可能是CORS跨域问题或服务器不可达';
          } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            playerStatus.text = '❌ 网络连接错误，请检查网络连接';
          } else {
            playerStatus.text = '❌ 未知网络错误: ' + error.message;
          }
        });
    };

    const formatTime = (seconds) => {
      if (isNaN(seconds)) return '未知';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      // 响应式数据
      searchKeyword,
      loading,
      items,
      pageData,
      playerTitle,
      playerAuthor,
      playerStatus,
      playerDetails,
      audioPlayer,
      showDetails, // 暴露给模板使用

      // 方法
      search,
      changePage,
      getItemId,
      getItemTitle,
      getItemAuthor,
      playAudio,
      viewDetails,
      formatTime,

      // 音频事件处理
      handleAudioError,
      handleAudioLoaded,
      handleAudioLoadStart,
      handleAudioMetadata,
      handleAudioCanPlay,
      handleAudioWaiting,
      handleAudioPlaying,
      handleAudioStalled,
      handleAudioAbort,
      handleAudioSuspend,
      handleAudioEmptied
    };
  }
};
</script>

<style scoped>
/* 样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #4a6baf;
  margin-bottom: 10px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 15px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.tab-btn.active {
  background-color: #4a6baf;
  color: white;
}

.search-section {
  display: flex;
  margin-bottom: 20px;
}

.search-section input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-section button {
  padding: 12px 20px;
  background-color: #4a6baf;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.content-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.loading {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.item-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.item-info h4 {
  margin-bottom: 5px;
  color: #4a6baf;
}

.item-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 3px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.item-actions button:first-child {
  background-color: #4a6baf;
  color: white;
}

.item-actions button:last-child {
  background-color: #f0f0f0;
  color: #333;
}

.item-actions button:hover {
  opacity: 0.8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.pagination button {
  padding: 8px 15px;
  background-color: #4a6baf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.player-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.player-info {
  margin-bottom: 15px;
}

.player-info h3 {
  color: #4a6baf;
  margin-bottom: 5px;
}

.player-info p {
  color: #666;
}

#audioPlayer {
  width: 100%;
  margin-top: 10px;
}

.no-data,
.error {
  text-align: center;
  padding: 30px;
  color: #666;
}

.error {
  color: #d32f2f;
}

.status.success {
  color: #4caf50;
}

.status.warning {
  color: #ff9800;
}

.status.error {
  color: #f44336;
}

.audio-details {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
}

.audio-details p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .item-list {
    grid-template-columns: 1fr;
  }

  .item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .item-actions {
    flex-direction: row;
    width: 100%;
  }

  .item-actions button {
    flex: 1;
  }
}
</style>