<template>
    <NavHeader />
    <div class="tetris-container" @keydown="handleKeyDown" tabindex="0" ref="gameContainer">
        <div class="game-header">
            <h1>俄罗斯方块</h1>
        </div>

        <div class="game-area">
            <div class="main-game">
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">得分:</span>
                        <span class="stat-value">{{ score }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">等级:</span>
                        <span class="stat-value">{{ level }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">行数:</span>
                        <span class="stat-value">{{ linesCleared }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">最高分:</span>
                        <span class="stat-value">{{ highScore }}</span>
                    </div>
                </div>

                <canvas ref="gameCanvas" :width="COLS * BLOCK_SIZE" :height="ROWS * BLOCK_SIZE" class="game-canvas">
                </canvas>
            </div>

            <div class="game-sidebar">
                <div class="next-piece-container">
                    <h3>下一个方块</h3>
                    <canvas ref="nextCanvas" width="120" height="120" class="next-canvas">
                    </canvas>
                </div>

                <div class="game-controls">
                    <button @click="togglePause" class="control-button" :disabled="gameOver">
                        {{ isPaused ? '继续游戏' : '暂停游戏' }}
                    </button>
                    <button @click="startGame" class="control-button">
                        重新开始
                    </button>
                </div>

                <div class="instructions">
                    <h3>操作说明</h3>
                    <ul>
                        <li><kbd>←</kbd> <kbd>→</kbd> 左右移动</li>
                        <li><kbd>↑</kbd> 旋转方块</li>
                        <li><kbd>↓</kbd> 加速下降</li>
                        <li><kbd>空格</kbd> 瞬间下落</li>
                        <li><kbd>P</kbd> 暂停/继续</li>
                    </ul>
                </div>
            </div>
        </div>

        <div v-if="gameOver" class="game-over-overlay">
            <div class="game-over-content">
                <h2>游戏结束</h2>
                <p>最终得分: {{ score }}</p>
                <p>消除行数: {{ linesCleared }}</p>
                <p>达到等级: {{ level }}</p>
                <button @click="startGame" class="restart-button">再玩一次</button>
            </div>
        </div>

        <div v-if="isPaused && !gameOver" class="pause-overlay">
            <div class="pause-content">
                <h2>游戏已暂停</h2>
                <p>按 P 键或点击按钮继续游戏</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import { API_URLS } from '@/config/api.js'
import NavHeader from '@/components/NavHeader.vue'

// Canvas引用
const gameCanvas = ref(null)
const nextCanvas = ref(null)
const gameContainer = ref(null)

// 游戏状态
const score = ref(0)
const level = ref(1)
const linesCleared = ref(0)
const isPaused = ref(false)
const gameOver = ref(false)
const highScore = ref(0)

// 放松记录相关
const relaxationRecordData = ref(null)

// 配置axios实例
const axiosInstance = axios.create({
    baseURL: API_URLS.SOUL_ASSESS,
    timeout: 10000
})

// 游戏常量
const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 30
const EMPTY = 0

// 方块定义
const TETROMINOES = [
    { shape: [[1, 1, 1, 1]], color: '#00f0f0', name: 'I' }, // I
    { shape: [[1, 1], [1, 1]], color: '#f0f000', name: 'O' }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0', name: 'T' }, // T
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#f0a000', name: 'L' }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000f0', name: 'J' }, // J
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000', name: 'S' }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000', name: 'Z' }  // Z
]

// 游戏变量
let board = []
let currentPiece = null
let nextPiece = null
let ctx = null
let nextCtx = null
let dropCounter = 0
let dropInterval = 1000
let lastTime = 0
let animationId = null
let isGameRunning = false
let keysPressed = new Set()
let keyRepeatTimers = {}

// 键盘控制映射
const KEY_MAPPINGS = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowDown': 'down',
    'ArrowUp': 'rotate',
    ' ': 'hardDrop',
    'p': 'pause',
    'P': 'pause'
}

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
        relaxType: '游戏',
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

// 键盘事件处理
const handleKeyDown = (e) => {
    // 阻止默认行为，防止页面滚动
    e.preventDefault()

    const action = KEY_MAPPINGS[e.key]
    if (!action) return

    // 处理按键重复
    if (keysPressed.has(e.key)) {
        return
    }

    keysPressed.add(e.key)
    executeAction(action)

    // 设置按键重复
    if (['left', 'right', 'down'].includes(action)) {
        keyRepeatTimers[action] = setTimeout(() => {
            keyRepeatTimers[action] = setInterval(() => {
                if (keysPressed.has(e.key)) {
                    executeAction(action)
                }
            }, 100)
        }, 300)
    }
}

// 键盘释放事件
const handleKeyUp = (e) => {
    keysPressed.delete(e.key)

    // 清除按键重复定时器
    const action = KEY_MAPPINGS[e.key]
    if (action && keyRepeatTimers[action]) {
        clearTimeout(keyRepeatTimers[action])
        clearInterval(keyRepeatTimers[action])
        delete keyRepeatTimers[action]
    }
}

const executeAction = (action) => {
    switch (action) {
        case 'left':
            movePiece('left')
            break
        case 'right':
            movePiece('right')
            break
        case 'down':
            movePiece('down')
            break
        case 'rotate':
            rotatePiece()
            break
        case 'hardDrop':
            hardDrop()
            break
        case 'pause':
            togglePause()
            break
    }
}

// 游戏循环
const gameLoop = (time) => {
    if (!isGameRunning) return

    if (isPaused.value) {
        animationId = requestAnimationFrame(gameLoop)
        return
    }

    if (gameOver.value) {
        cancelAnimationFrame(animationId)
        animationId = null
        return
    }

    const deltaTime = time - lastTime
    lastTime = time

    dropCounter += deltaTime
    if (dropCounter > dropInterval) {
        movePiece('down')
        dropCounter = 0
    }

    draw()
    animationId = requestAnimationFrame(gameLoop)
}

// 开始游戏
const startGame = () => {
    // 创建游戏板
    board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => EMPTY)
    )

    // 重置状态
    score.value = 0
    level.value = 1
    linesCleared.value = 0
    isPaused.value = false
    gameOver.value = false
    dropInterval = 1000

    // 初始化第一个方块
    createPiece()
    createNextPiece()

    // 开始游戏循环
    isGameRunning = true
    lastTime = 0
    dropCounter = 0

    if (animationId) {
        cancelAnimationFrame(animationId)
    }
    animationId = requestAnimationFrame(gameLoop)

    // 聚焦游戏容器
    if (gameContainer.value) {
        gameContainer.value.focus()
    }

    // 加载最高分
    highScore.value = localStorage.getItem('tetrisHighScore') || 0

    // 更新放松记录
    // updateRelaxationRecord(false)
}

// 暂停/继续游戏
const togglePause = () => {
    if (gameOver.value) return

    isPaused.value = !isPaused.value

    if (!isPaused.value && isGameRunning) {
        lastTime = performance.now()
        animationId = requestAnimationFrame(gameLoop)

        if (gameContainer.value) {
            gameContainer.value.focus()
        }
    }

    // 更新放松记录
    updateRelaxationRecord(false)
}

// 创建新方块
const createPiece = () => {
    if (nextPiece) {
        currentPiece = {
            shape: JSON.parse(JSON.stringify(nextPiece.shape)),
            color: nextPiece.color,
            x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2),
            y: 0
        }
    } else {
        const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
        currentPiece = {
            shape: JSON.parse(JSON.stringify(tetromino.shape)),
            color: tetromino.color,
            x: Math.floor(COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
            y: 0
        }
    }

    // 检查游戏是否结束
    if (checkCollision()) {
        gameOver.value = true
        isGameRunning = false

        // 更新最高分
        if (score.value > highScore.value) {
            highScore.value = score.value
            localStorage.setItem('tetrisHighScore', highScore.value)
        }

        // 更新放松记录
        updateRelaxationRecord(false)
    }

    createNextPiece()
}

// 旋转方块
const rotatePiece = () => {
    if (isPaused.value || gameOver.value || !currentPiece) return

    const originalShape = JSON.parse(JSON.stringify(currentPiece.shape))
    const rows = originalShape.length
    const cols = originalShape[0].length

    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0))

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            rotated[x][rows - 1 - y] = originalShape[y][x]
        }
    }

    currentPiece.shape = rotated

    let collision = true
    const kickOffsets = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -2, y: 0 },
        { x: 2, y: 0 }
    ]

    for (const offset of kickOffsets) {
        if (!checkCollision(currentPiece, offset.x, offset.y)) {
            currentPiece.x += offset.x
            currentPiece.y += offset.y
            collision = false
            break
        }
    }

    if (collision) {
        currentPiece.shape = originalShape
    }

    draw()
}

// 移动方块
const movePiece = (direction) => {
    if (isPaused.value || gameOver.value || !currentPiece) return

    let offsetX = 0, offsetY = 0

    switch (direction) {
        case 'left': offsetX = -1; break
        case 'right': offsetX = 1; break
        case 'down': offsetY = 1; break
    }

    if (!checkCollision(currentPiece, offsetX, offsetY)) {
        currentPiece.x += offsetX
        currentPiece.y += offsetY
        if (offsetY > 0) {
            score.value += 1
        }
    } else if (direction === 'down') {
        mergePiece()
        clearLines()
        createPiece()
    }

    draw()
}

// 硬降落
const hardDrop = () => {
    if (isPaused.value || gameOver.value || !currentPiece) return

    let dropDistance = 0
    while (!checkCollision(currentPiece, 0, dropDistance + 1)) {
        dropDistance++
    }

    if (dropDistance > 0) {
        currentPiece.y += dropDistance
        score.value += dropDistance * 2
        mergePiece()
        clearLines()
        createPiece()
    }
}

// 碰撞检测
const checkCollision = (piece = currentPiece, offsetX = 0, offsetY = 0) => {
    if (!piece) return true

    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX
                const newY = piece.y + y + offsetY

                if (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                ) {
                    return true
                }
            }
        }
    }
    return false
}

// 合并方块到游戏板
const mergePiece = () => {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y
                if (boardY >= 0) {
                    board[boardY][currentPiece.x + x] = currentPiece.color
                }
            }
        }
    }
}

// 清除完整行
const clearLines = () => {
    let lines = 0

    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== EMPTY)) {
            board.splice(y, 1)
            board.unshift(Array.from({ length: COLS }, () => EMPTY))
            lines++
            y++
        }
    }

    if (lines > 0) {
        const linePoints = [0, 100, 300, 600, 1000]
        score.value += linePoints[lines] * level.value
        linesCleared.value += lines

        const newLevel = Math.floor(linesCleared.value / 10) + 1
        if (newLevel > level.value) {
            level.value = newLevel
            dropInterval = Math.max(100, 1000 - (level.value - 1) * 100)
        }
    }
}

// 绘制游戏
const draw = () => {
    if (!ctx) return

    ctx.clearRect(0, 0, gameCanvas.value.width, gameCanvas.value.height)
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, gameCanvas.value.width, gameCanvas.value.height)

    drawBoard()
    if (currentPiece) {
        drawPiece()
    }
    drawGrid()
}

// 绘制游戏板
const drawBoard = () => {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x])
            } else {
                ctx.fillStyle = '#222'
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
                ctx.strokeStyle = '#333'
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
            }
        }
    }
}

// 绘制单个方块
const drawBlock = (context, x, y, color) => {
    context.fillStyle = color
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)

    context.fillStyle = 'rgba(255, 255, 255, 0.2)'
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 3)
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE)

    context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    context.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE + BLOCK_SIZE - 3,
        BLOCK_SIZE,
        3
    )
    context.fillRect(
        x * BLOCK_SIZE + BLOCK_SIZE - 3,
        y * BLOCK_SIZE,
        3,
        BLOCK_SIZE
    )

    context.strokeStyle = '#000'
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// 绘制当前方块
const drawPiece = () => {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color)
            }
        }
    }
}

// 绘制网格
const drawGrid = () => {
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath()
        ctx.moveTo(x * BLOCK_SIZE, 0)
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE)
        ctx.stroke()
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * BLOCK_SIZE)
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE)
        ctx.stroke()
    }
}

// 创建下一个方块
const createNextPiece = () => {
    const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
    nextPiece = {
        shape: JSON.parse(JSON.stringify(tetromino.shape)),
        color: tetromino.color
    }
    drawNextPiece()
}

// 绘制下一个方块预览
const drawNextPiece = () => {
    if (!nextCtx || !nextPiece) return

    nextCtx.clearRect(0, 0, nextCanvas.value.width, nextCanvas.value.height)
    nextCtx.fillStyle = '#222'
    nextCtx.fillRect(0, 0, nextCanvas.value.width, nextCanvas.value.height)

    const blockSize = 20
    const offsetX = (nextCanvas.value.width - nextPiece.shape[0].length * blockSize) / 2
    const offsetY = (nextCanvas.value.height - nextPiece.shape.length * blockSize) / 2

    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextCtx.fillStyle = nextPiece.color
                nextCtx.fillRect(
                    offsetX + x * blockSize,
                    offsetY + y * blockSize,
                    blockSize - 1,
                    blockSize - 1
                )

                nextCtx.fillStyle = 'rgba(255, 255, 255, 0.2)'
                nextCtx.fillRect(
                    offsetX + x * blockSize,
                    offsetY + y * blockSize,
                    blockSize - 1,
                    2
                )
                nextCtx.fillRect(
                    offsetX + x * blockSize,
                    offsetY + y * blockSize,
                    2,
                    blockSize - 1
                )
            }
        })
    })
}

// 浏览器后退事件处理
const handleBrowserBack = () => {
    updateRelaxationRecord(true)
}

// 生命周期钩子
onMounted(() => {
    if (gameCanvas.value) {
        ctx = gameCanvas.value.getContext('2d')
    }
    if (nextCanvas.value) {
        nextCtx = nextCanvas.value.getContext('2d')
    }

    startGame()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('popstate', handleBrowserBack)

    nextTick(() => {
        if (gameContainer.value) {
            gameContainer.value.focus()
        }
    })

    // 创建放松记录
    createRelaxationRecord()
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('popstate', handleBrowserBack)

    isGameRunning = false
    if (animationId) {
        cancelAnimationFrame(animationId)
    }

    // 清理所有定时器
    Object.values(keyRepeatTimers).forEach(timer => {
        clearTimeout(timer)
        clearInterval(timer)
    })

    // 最终更新放松记录
    updateRelaxationRecord(true)
})
</script>

<style scoped>
.tetris-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    /* min-height: 100vh; */
    min-height: auto;
    height: fit-content;
    color: white;
    outline: none;
    position: relative;
}

.tetris-container:focus {
    outline: none;
}

.game-header {
    text-align: center;
    margin-bottom: 20px;
}

.game-header h1 {
    font-size: 2.5rem;
    margin: 0;
    color: #4fc3f7;
    text-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
}

.game-area {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.main-game {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.game-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 20px;
    border-radius: 8px;
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.9rem;
    color: #aaa;
}

.stat-value {
    display: block;
    font-size: 1.4rem;
    font-weight: bold;
    color: #4fc3f7;
}

.game-canvas {
    border: 2px solid #4fc3f7;
    box-shadow: 0 0 20px rgba(79, 195, 247, 0.3);
    background-color: #111;
}

.game-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 200px;
}

.next-piece-container {
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
}

.next-piece-container h3 {
    margin-top: 0;
    color: #4fc3f7;
}

.next-canvas {
    background-color: #222;
    border: 1px solid #444;
    margin: 0 auto;
}

.game-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.control-button {
    padding: 10px;
    background: #4fc3f7;
    color: #000;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.control-button:hover:not(:disabled) {
    background: #29b6f6;
    transform: translateY(-2px);
}

.control-button:disabled {
    background: #666;
    cursor: not-allowed;
}

.instructions {
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 8px;
}

.instructions h3 {
    margin-top: 0;
    color: #4fc3f7;
}

.instructions ul {
    padding-left: 20px;
    margin: 0;
}

.instructions li {
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.instructions kbd {
    background: #333;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

.game-over-overlay,
.pause-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.game-over-content,
.pause-content {
    background: #1a1a2e;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    border: 2px solid #4fc3f7;
    box-shadow: 0 0 30px rgba(79, 195, 247, 0.5);
}

.game-over-content h2,
.pause-content h2 {
    color: #ff5252;
    margin-top: 0;
}

.pause-content h2 {
    color: #4fc3f7;
}

.restart-button {
    padding: 12px 24px;
    background: #4fc3f7;
    color: #000;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.restart-button:hover {
    background: #29b6f6;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .game-area {
        flex-direction: column;
        align-items: center;
    }

    .game-sidebar {
        width: 100%;
        max-width: 300px;
    }

    .game-stats {
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>