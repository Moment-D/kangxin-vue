<template>
    <NavHeader />
    <div class="game-container">
        <h1>推箱子小游戏</h1>

        <!-- 关卡信息 -->
        <div class="level-info">
            <p>当前关卡：{{ currentLevel + 1 }}/5</p>
            <div class="level-btns">
                <button @click="prevLevel" :disabled="currentLevel === 0" class="level-btn">上一关</button>
                <button @click="nextLevel" :disabled="currentLevel === 4" class="level-btn">下一关</button>
                <button @click="restartGame" class="level-btn">重玩本关</button>
            </div>
        </div>

        <!-- 游戏地图 -->
        <div class="game-map" :style="{ gridTemplateColumns: `repeat(${map[0].length}, 40px)` }">
            <div v-for="(cell, index) in flatMap" :key="index" class="cell" :class="[
                cell === 1 ? 'wall' : '',
                cell === 2 ? 'player' : '',
                cell === 3 ? 'box' : '',
                cell === 4 ? 'target' : '',
                cell === 5 ? 'box-on-target' : '',
                cell === 6 ? 'player-on-target' : ''
            ]"></div>
        </div>

        <!-- 游戏信息 -->
        <div class="game-info">
            <p>操作：方向键控制移动</p>
            <p v-if="isWon" class="win-text">
                {{ currentLevel === 4 ? '🎉 恭喜通关所有关卡！🎉' : '🎉 本关通关！即将进入下一关...' }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { API_URLS } from '@/config/api.js'
import NavHeader from '@/components/NavHeader.vue'

// 五关卡地图配置 
// 0: 空地, 1: 墙, 2: 玩家, 3: 箱子, 4: 目标点, 5: 箱子在目标点, 6: 玩家在目标点
const initialMaps = [
    // 关卡1：最简单，1个箱子1个目标点
    [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 2, 3, 1],
        [1, 0, 0, 4, 1],
        [1, 1, 1, 1, 1]
    ],
    // 关卡2：2个箱子2个目标点，简单路径
    [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 2, 3, 0, 1],
        [1, 0, 0, 3, 4, 1],
        [1, 0, 0, 0, 4, 1],
        [1, 1, 1, 1, 1, 1]
    ],
    // 关卡3：2个箱子，需要绕路推动
    [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1],
        [1, 0, 2, 1, 3, 0, 1],
        [1, 0, 0, 1, 4, 4, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ],
    // 关卡4：3个箱子，目标点分散
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 1, 0, 3, 0, 1],
        [1, 0, 0, 1, 2, 0, 0, 1],
        [1, 0, 4, 1, 0, 4, 0, 1],
        [1, 0, 0, 0, 0, 0, 3, 1],
        [1, 0, 0, 0, 0, 0, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // 关卡5：4个箱子，复杂布局（最终关卡）
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 3, 0, 1, 0, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 2, 0, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 3, 0, 1, 0, 3, 0, 1],
        [1, 0, 4, 0, 1, 0, 4, 0, 1],
        [1, 0, 4, 0, 0, 0, 4, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
]

// 配置axios实例
const axiosInstance = axios.create({
    baseURL: API_URLS.SOUL_ASSESS,
    timeout: 10000
})

// 响应式数据
const currentLevel = ref(0) // 当前关卡索引（0-4）
const map = ref(JSON.parse(JSON.stringify(initialMaps[currentLevel.value])))
const isWon = ref(false)
const relaxationRecordData = ref(null) // 添加放松记录数据

// 扁平化地图（方便渲染）
const flatMap = computed(() => map.value.flat())

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
        relaxType: '推箱子游戏',
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

// 监听关卡变化，重置地图
watch(currentLevel, (newLevel) => {
    map.value = JSON.parse(JSON.stringify(initialMaps[newLevel]))
    isWon.value = false
}, { immediate: true })

// 监听通关状态，自动切换下一关（非最后一关）
watch(isWon, (won) => {
    if (won && currentLevel.value < 4) {
        setTimeout(() => {
            currentLevel.value += 1
        }, 1500) // 延迟1.5秒切换，给玩家提示时间
    }
})

// 找到玩家当前位置
const findPlayer = () => {
    for (let y = 0; y < map.value.length; y++) {
        for (let x = 0; x < map.value[y].length; x++) {
            if (map.value[y][x] === 2 || map.value[y][x] === 6) {
                return { x, y }
            }
        }
    }
    return { x: 0, y: 0 }
}

// 检查是否通关
const checkWin = () => {
    for (let y = 0; y < map.value.length; y++) {
        for (let x = 0; x < map.value[y].length; x++) {
            // 存在未归位的箱子/空目标点则未通关
            if (map.value[y][x] === 3 || map.value[y][x] === 4) return false
        }
    }
    return true
}

// 移动逻辑
const movePlayer = (dx, dy) => {
    if (isWon.value) return

    const { x, y } = findPlayer()
    const targetX = x + dx
    const targetY = y + dy
    const nextTargetX = targetX + dx
    const nextTargetY = targetY + dy

    // 1. 检查目标位置是否是墙
    if (map.value[targetY][targetX] === 1) return

    // 2. 检查目标位置是否是箱子
    if (map.value[targetY][targetX] === 3 || map.value[targetY][targetX] === 5) {
        // 检查箱子前方是否是墙/另一个箱子
        if (map.value[nextTargetY][nextTargetX] === 1 ||
            map.value[nextTargetY][nextTargetX] === 3 ||
            map.value[nextTargetY][nextTargetX] === 5) {
            return
        }

        // 移动箱子
        map.value[nextTargetY][nextTargetX] = map.value[nextTargetY][nextTargetX] === 4
            ? 5 // 箱子移到目标点
            : 3 // 箱子移到普通空地
    }

    // 3. 移动玩家
    // 清除原位置玩家
    map.value[y][x] = map.value[y][x] === 6 ? 4 : 0
    // 设置新位置玩家
    map.value[targetY][targetX] = map.value[targetY][targetX] === 4
        ? 6 // 玩家移到目标点
        : 2 // 玩家移到普通空地

    // 检查是否通关
    if (checkWin()) {
        isWon.value = true
    }
}

// 键盘事件处理
const handleKeydown = (e) => {
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1)
            break
        case 'ArrowDown':
            movePlayer(0, 1)
            break
        case 'ArrowLeft':
            movePlayer(-1, 0)
            break
        case 'ArrowRight':
            movePlayer(1, 0)
            break
        default:
            break
    }
}

// 关卡切换功能
const prevLevel = () => {
    if (currentLevel.value > 0) {
        currentLevel.value -= 1
    }
}

const nextLevel = () => {
    if (currentLevel.value < 4) {
        currentLevel.value += 1
    }
}

// 重新开始当前关卡
const restartGame = () => {
    map.value = JSON.parse(JSON.stringify(initialMaps[currentLevel.value]))
    isWon.value = false
}

// 生命周期钩子
onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('popstate', handleBrowserBack)
    createRelaxationRecord()
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('popstate', handleBrowserBack)
    updateRelaxationRecord(true)
})
</script>

<style scoped>
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
}

.level-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
}

.level-info p {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
}

.level-btns {
    display: flex;
    gap: 8px;
}

.level-btn {
    padding: 6px 12px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.level-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

.level-btn:hover:not(:disabled) {
    background-color: #2980b9;
}

.game-map {
    display: grid;
    gap: 1px;
    background-color: #ccc;
    border: 2px solid #333;
    margin: 10px 0 20px;
}

.cell {
    width: 40px;
    height: 40px;
    background-color: #fff;
    box-sizing: border-box;
}

/* 墙 */
.wall {
    background-color: #333;
}

/* 玩家 */
.player,
.player-on-target {
    background-color: #42b983;
    border-radius: 50%;
    position: relative;
}

.player::after,
.player-on-target::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
    background-color: #2d8f62;
    border-radius: 50%;
}

/* 箱子 */
.box,
.box-on-target {
    background-color: #e7c049;
    border-radius: 4px;
    position: relative;
}

.box::after,
.box-on-target::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 24px;
    height: 24px;
    background-color: #d4aa2c;
    border-radius: 4px;
}

/* 目标点 */
.target {
    background-color: #fff;
    position: relative;
}

.target::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f08080;
    opacity: 0.6;
}

/* 箱子在目标点上 */
.box-on-target {
    background-color: #e7c049;
    position: relative;
}

.box-on-target::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 24px;
    height: 24px;
    background-color: #d4aa2c;
    border-radius: 4px;
    box-shadow: 0 0 0 4px rgba(240, 128, 128, 0.6);
}

/* 玩家在目标点上 */
.player-on-target {
    background-color: #42b983;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 0 4px rgba(240, 128, 128, 0.6);
}

.game-info {
    text-align: center;
    width: 100%;
}

.win-text {
    color: #e74c3c;
    font-size: 22px;
    font-weight: bold;
    margin: 10px 0;
}
</style>