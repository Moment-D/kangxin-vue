<!-- MindRelaxGame.vue -->
<template>
    <NavHeader />
    <div class="container">
        <header>
            <h1>心灵舒缓</h1>
            <p>放松心情，享受游戏</p>
        </header>

        <main>
            <section class="tabs">
                <button id="gameTab" class="tab-btn active">
                    轻松游戏
                </button>
            </section>

            <section class="games-section">
                <div class="game-list">
                    <div class="game-item" @click="startGame('relaxPuzzle')">
                        <div class="game-icon">🐍</div>
                        <div class="game-info">
                            <h3>手势贪吃蛇</h3>
                            <p>通过手势控制贪吃蛇，收集食物，避免撞墙</p>
                        </div>
                    </div>

                    <div class="game-item" @click="startGame('breathingExercise')">
                        <div class="game-icon">✨</div>
                        <div class="game-info">
                            <h3>俄罗斯方块</h3>
                            <p>跟随下降的方块，帮助消除坏心情</p>
                        </div>
                    </div>

                    <div class="game-item" @click="startGame('sokoban')">
                        <div class="game-icon">📦</div>
                        <div class="game-info">
                            <h3>推箱子游戏</h3>
                            <p>经典益智游戏，通过推动箱子到指定位置完成关卡</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { API_URLS } from '@/config/api.js';
import NavHeader from '../components/NavHeader.vue';
import router from '@/router';

export default {
    name: 'MindRelaxGame',
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

        // 创建放松记录 - 检查是否存在已有的会话
        const createRelaxationRecord = () => {
            // 检查 sessionStorage 中是否已有计时记录
            const sessionRecord = sessionStorage.getItem('mindRelaxSession');
            if (sessionRecord) {
                relaxationRecordData.value = JSON.parse(sessionRecord);
                return;
            }

            const userId = getUserId();
            if (!userId) return;

            // 创建新的计时记录，添加 entryTime
            relaxationRecordData.value = {
                userId: userId,
                relaxType: '游戏',
            };

            // 保存到 sessionStorage
            sessionStorage.setItem('mindRelaxSession', JSON.stringify(relaxationRecordData.value));
        };


        // 更新放松记录 - 区分临时更新和最终上报
        const updateRelaxationRecord = async (isFinal = false) => {
            if (!relaxationRecordData.value || !relaxationRecordData.value.entryTime) return;

            try {
                const exitTime = new Date().getTime();
                const durationInMinutes = Math.round((exitTime - relaxationRecordData.value.entryTime) / 60000);

                if (isFinal) {
                    // 最终上报
                    const updatedRecord = {
                        ...relaxationRecordData.value,
                        useDuration: durationInMinutes
                    };

                    delete updatedRecord.entryTime;

                    await axiosInstance.post('/relaxation', updatedRecord);

                    // 清理 sessionStorage
                    sessionStorage.removeItem('mindRelaxSession');
                    relaxationRecordData.value = null;
                } else {
                    // 临时更新 - 仅保存当前进度
                    relaxationRecordData.value.currentDuration = durationInMinutes;
                    sessionStorage.setItem('mindRelaxSession', JSON.stringify(relaxationRecordData.value));
                }
            } catch (error) {
                console.error('更新放松记录失败:', error);
            }
        };


        // 监听浏览器后退事件
        const handleBrowserBack = () => {
            updateRelaxationRecord();
        };

        // 修改 startGame 函数 - 传递当前计时信息
        const startGame = (gameType) => {
            console.log(`开始游戏: ${gameType}`);

            // 更新当前会话时长但不结束计时（临时更新）
            updateRelaxationRecord(true);  // 改为 true 表示临时更新

            if (gameType === 'relaxPuzzle') {
                router.push({ name: 'MindRelaxSnakeGame' });
            } else if (gameType === 'breathingExercise') {
                router.push({ name: 'MindRelaxBreath' });
            } else if (gameType === 'sokoban') {
                router.push({ name: 'MindRelaxSokoban' });
            }
        };

        onMounted(() => {
            // 添加事件监听器
            window.addEventListener('popstate', handleBrowserBack);
            // 创建放松记录
            createRelaxationRecord();
        });

        onUnmounted(() => {
            updateRelaxationRecord(true);
            // 移除事件监听器
            window.removeEventListener('popstate', handleBrowserBack);
        });

        return {
            // 方法
            startGame
        };
    }
};
</script>

<style scoped>
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

.games-section {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    min-height: 300px;
}

.game-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.game-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.game-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.game-icon {
    font-size: 2rem;
    margin-right: 15px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    border-radius: 50%;
}

.game-info h3 {
    margin-bottom: 8px;
    color: #4a6baf;
}

.game-info p {
    font-size: 14px;
    color: #666;
}

@media (max-width: 768px) {
    .game-list {
        grid-template-columns: 1fr;
    }

    .game-item {
        flex-direction: column;
        text-align: center;
    }

    .game-icon {
        margin-right: 0;
        margin-bottom: 15px;
    }
}
</style>