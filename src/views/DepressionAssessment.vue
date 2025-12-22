<template>
  <div class="depression-assessment-page">
    <!-- 保留原导航栏 -->
    <NavHeader />
    
    <!-- 标题区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>您的 PHQ-9+1 情绪健康自查</h1>
        <p>通过可靠的10项量表，了解您的情绪健康</p>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 介绍区域 -->
      <section class="intro-section">
        <div class="intro-card">
          <h2>关于 PHQ-9+1 量表</h2>
          <p>使用PHQ-9+1轻松评估您的情绪状态。这是一种简单、保密的方式来完成10项测试，并从中获得宝贵的见解，助力您的健康之旅。</p>
          
          <div class="info-box">
            <p><strong>注意：</strong>本评估结果仅供参考，不能替代专业医疗诊断。如有需要，请咨询专业医生。</p>
          </div>
          
          <div v-if="!hasStarted && !showResult" class="start-section">
            <button class="start-btn" @click="startAssessment">
              开始您的 PHQ-9+1 评估
            </button>
          </div>
        </div>
        
        <!-- AI洞察说明 -->
        <div class="ai-insight-section">
          <h3>关于 PHQ-9+1 筛查工具和可选的 AI 洞察</h3>
          <p>患者健康问卷-9+1(PHQ-9+1)是一种备受推崇的工具，用于筛查和衡量抑郁症的严重程度。我们的平台提供了一个易于使用的PHQ-9+1评估，现在通过AI驱动的个性化分析得到增强，除了标准的PHQ-9+1分数之外，还提供了更深入的见解。</p>
          <p>我们的平台旨在易于使用，旨在帮助您进行可靠的PHQ-9+1自我评估。您可以收到您的标准PHQ-9+1结果，或者选择提供额外的背景信息以获得全面的详细报告，概述个人优势、挑战、对日常生活的影响，以及根据您的PHQ-9+1结果给出的可行建议。</p>
          <p>请记住，本PHQ-9+1测试及其可选的详细报告是信息性筛查工具，而不是诊断工具。如需明确的诊断和治疗方案，请咨询合格的医疗保健专业人员。使用您的PHQ-9+1结果和任何由此产生的见解作为讨论的起点。</p>
        </div>
      </section>
      
      <!-- 评估进度 -->
      <section v-if="hasStarted" class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(currentQuestion / questions.length) * 100}%` }"
          ></div>
        </div>
        <div class="progress-text">
          问题 {{ currentQuestion }} / {{ questions.length }}
        </div>
      </section>
      
      <!-- 评估问题区域 -->
      <section v-if="hasStarted && !showResult" class="questions-section">
        <div class="question-card">
          <div class="question-number">问题 {{ currentQuestion }}</div>
          <h3 class="question-text">{{ currentQuestionData.question }}</h3>
          
          <div class="options-container">
            <label 
              v-for="(option, index) in currentQuestionData.options" 
              :key="index"
              class="option-label"
              :class="{ selected: selectedOptions[currentQuestion - 1] === index }"
            >
              <input 
                type="radio" 
                name="question-option"
                :value="index"
                :checked="selectedOptions[currentQuestion - 1] === index"
                @change="selectOption(index)"
              />
              <span class="option-content">
                <span class="option-number">{{ index }}</span>
                <span class="option-text">{{ option.text }}</span>
              </span>
            </label>
          </div>
          
          <div class="navigation-buttons">
            <button 
              class="nav-btn prev-btn" 
              :disabled="currentQuestion === 1"
              @click="goToPrevious"
            >
              上一题
            </button>
            <button 
              class="nav-btn next-btn" 
              :disabled="selectedOptions[currentQuestion - 1] === null"
              @click="goToNext"
            >
              {{ currentQuestion === questions.length ? '提交评估' : '下一题' }}
            </button>
          </div>
        </div>
      </section>
      
      <!-- 评估结果区域（使用后端返回数据） -->
      <section v-if="showResult" class="result-section">
        <div class="result-card">
          <h3>您的评估结果</h3>
          
          <div class="result-header">
            <div class="score-info">
              <span class="score-label">评估分数</span>
              <span class="score-number">{{ backendResult.assessScore }}</span>
            </div>
            <div class="risk-level" :class="getLevelClassFromScore(backendResult.assessScore)">
              {{ getLevelFromScore(backendResult.assessScore) }}
            </div>
          </div>
          
          <div class="result-description">
            <h4>结果解读</h4>
            <p>{{ backendResult.resultInterpret }}</p>
          </div>
          
          <div class="intervention-plan">
            <h4>针对性干预方案</h4>
            <ul>
              <li v-for="(plan, index) in interventionPlans" :key="index">
                {{ plan }}
              </li>
            </ul>
          </div>
          
          <div class="assessment-time">
            <p>评估完成时间：{{ formatFullDate(new Date(backendResult.assessTime)) }}</p>
          </div>
          
          <div class="result-actions">
            <button class="save-result-btn" @click="saveResult">保存结果</button>
            <button class="new-assessment-btn" @click="resetAssessment">重新评估</button>
          </div>
        </div>
      </section>
      
      <!-- 历史记录（已优化为网格布局 + 颜色渐变） -->
      <section v-if="assessmentHistory.length > 0" class="history-section">
        <h3>历史评估记录（趋势分析）</h3>
        <div class="history-grid">
          <div 
            v-for="(record, index) in assessmentHistory" 
            :key="index"
            class="history-item"
            :class="getHistoryItemClass(record.level)"
            @click="viewHistoryDetail(record)"
          >
            <div class="history-date">{{ formatFullDate(record.date) }}</div>
            <div class="history-score">分数：{{ record.score }}</div>
            <div class="history-level">{{ record.level }}</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavHeader from '@/components/NavHeader.vue'
import { HEALTH_API } from '@/config/api.js'

// 状态
const hasStarted = ref(false)
const currentQuestion = ref(1)
const selectedOptions = ref(Array(10).fill(null))
const showResult = ref(false)
const assessmentHistory = ref([])
const backendResult = ref({
  assessScore: 0,
  resultInterpret: '',
  intervenePlan: '',
  assessTime: new Date().toISOString()
})
const interventionPlans = ref([])

// 从 localStorage 获取用户信息
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

// 问题数据
const questions = [
  { question: '做事时提不起劲或没有兴趣', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '感到心情低落、沮丧或绝望', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '入睡困难、睡不安稳或睡眠过多', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '感到疲倦或没有精力', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '食欲不振或吃太多', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '觉得自己很糟、很失败，或让自己、家人失望', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '难以集中注意力，例如阅读报纸或看电视时', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '行动或说话速度缓慢到别人已经察觉，或刚好相反——坐立不安、动来动去的情况更胜于平常', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '有不如死掉或用某种方式伤害自己的念头', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] },
  { question: '刻意回避社交场合，不愿与人交往或交流', options: [{text:'完全不会',score:0},{text:'有几天',score:1},{text:'超过一半天数',score:2},{text:'几乎每天',score:3}] }
]

// 计算属性
const currentQuestionData = computed(() => questions[currentQuestion.value - 1])

// 辅助函数：根据分数获取等级
const getLevelFromScore = (score) => {
  if (score <= 5) return '无明显抑郁倾向'
  if (score <= 11) return '轻度抑郁风险'
  if (score <= 17) return '中度抑郁风险'
  if (score <= 23) return '中重度抑郁风险'
  return '重度抑郁风险'
}

const getLevelClassFromScore = (score) => {
  const level = getLevelFromScore(score)
  return getLevelClass(level)
}

const getLevelClass = (level) => {
  switch (level) {
    case '无明显抑郁倾向': return 'level-low'
    case '轻度抑郁风险': return 'level-mild'
    case '中度抑郁风险': return 'level-moderate'
    case '中重度抑郁风险': return 'level-moderate-severe'
    case '重度抑郁风险': return 'level-severe'
    default: return ''
  }
}


// 新增：用于历史记录卡片的整体样式类
const getHistoryItemClass = (level) => {
  return getLevelClass(level)
}

// 方法
const selectOption = (optionIndex) => {
  selectedOptions.value[currentQuestion.value - 1] = optionIndex
}
const goToPrevious = () => { if (currentQuestion.value > 1) currentQuestion.value-- }

const goToNext = async () => {
  if (currentQuestion.value < questions.length) {
    currentQuestion.value++
  } else {
    await submitAssessment()
  }
}

const submitAssessment = async () => {
  const token = getToken()
  const userId = getUserId()

  if (!token || !userId) {
    alert('请先登录后再提交评估')
    return
  }

  const answers = selectedOptions.value.map((optIndex, idx) => {
    if (optIndex === null) throw new Error('未完成所有题目')
    return {
      questionNo: idx + 1,
      score: questions[idx].options[optIndex].score
    }
  })

  const payload = {
    userId: userId,
    answers
  }

  try {
    const response = await fetch(HEALTH_API.depressionAssess, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.code === 200 && data.data) {
      backendResult.value = data.data
      interventionPlans.value = data.data.intervenePlan
        .split(/[\n。；;]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)

      showResult.value = true
      saveToHistory({
        date: new Date(data.data.assessTime),
        score: data.data.assessScore,
        level: getLevelFromScore(data.data.assessScore)
      })
    } else {
      alert('评估失败：' + (data.msg || '未知错误'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    alert('网络错误，请检查后端服务是否运行')
  }
}

const startAssessment = () => {
  const userId = getUserId()
  if (!userId) {
    alert('请先登录后再开始评估')
    return
  }
  hasStarted.value = true
  currentQuestion.value = 1
  selectedOptions.value = Array(10).fill(null)
  showResult.value = false
}

const saveResult = () => {
  saveToHistory({
    date: new Date(backendResult.value.assessTime),
    score: backendResult.value.assessScore,
    level: getLevelFromScore(backendResult.value.assessScore)
  })
  alert('评估结果已保存')
}

const resetAssessment = () => {
  hasStarted.value = false
  currentQuestion.value = 1
  selectedOptions.value = Array(10).fill(null)
  showResult.value = false
}

const saveToHistory = (record) => {
  assessmentHistory.value.unshift(record)
  if (assessmentHistory.value.length > 5) assessmentHistory.value.pop()
  localStorage.setItem('phq10History', JSON.stringify(assessmentHistory.value))
}

const viewHistoryDetail = (record) => {
  console.log('查看历史:', record)
}

const formatFullDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// 初始化历史记录
onMounted(() => {
  const saved = localStorage.getItem('phq10History')
  if (saved) {
    try {
      assessmentHistory.value = JSON.parse(saved)
    } catch (e) {
      console.warn('历史记录解析失败')
    }
  }
})
</script>

<style scoped>
.depression-assessment-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.hero-section {
  padding: 40px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}
.hero-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}
.hero-content p {
  font-size: 16px;
  color: #666;
  margin: 0;
}
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
.intro-section {
  margin-bottom: 30px;
}
.intro-card {
  padding: 20px 0;
  text-align: center;
}
.intro-card h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 16px;
}
.intro-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.info-box {
  background-color: #fff5f5;
  border: 1px solid #ffe5e5;
  border-radius: 4px;
  padding: 12px;
  max-width: 700px;
  margin: 0 auto 20px;
}
.info-box p {
  margin: 0;
  color: #d93025;
  font-size: 13px;
  text-align: left;
}
.start-section {
  margin-top: 20px;
}
.start-btn {
  background-color: #f472b6;
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.start-btn:hover {
  background-color: #db2777;
}
.ai-insight-section {
  margin-top: 30px;
  padding: 0 20px;
}
.ai-insight-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
}
.ai-insight-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 10px;
}
.progress-section {
  margin: 20px 0;
}
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #f472b6;
  transition: width 0.3s;
}
.progress-text {
  text-align: right;
  font-size: 13px;
  color: #666;
  margin-top: 8px;
}
.question-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 20px;
}
.question-number {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.question-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}
.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.option-label {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}
.option-label:hover {
  background-color: #f9f9f9;
}
.option-label.selected {
  border-color: #f472b6;
  background-color: #fff0f7;
}
.option-label input[type="radio"] {
  margin-right: 12px;
  width: 16px;
  height: 16px;
}
.option-content {
  display: flex;
  align-items: center;
  flex: 1;
}
.option-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}
.option-label.selected .option-number {
  background-color: #f472b6;
  color: white;
}
.option-text {
  font-size: 15px;
  color: #333;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.nav-btn {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.prev-btn {
  background-color: #f0f0f0;
  color: #333;
}
.next-btn {
  background-color: #f472b6;
  color: white;
}
.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.result-section {
  margin: 20px 0;
}
.result-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 24px;
}
.result-card h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.score-info {
  text-align: left;
}
.score-label {
  font-size: 13px;
  color: #666;
  display: block;
}
.score-number {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}
.risk-level {
  font-size: 16px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
}
.level-low { background-color: #e6f7e9; color: #389e0d; }
.level-mild { background-color: #fffbe6; color: #faad14; }
.level-moderate { background-color: #fff2e8; color: #fa8c16; }
.level-moderate-severe { background-color: #fff1f0; color: #fa541c; }
.level-severe { background-color: #fff1f0; color: #d93025; }
.result-description, .intervention-plan {
  margin-bottom: 20px;
  text-align: left;
}
.result-description h4, .intervention-plan h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}
.result-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
}
.intervention-plan ul {
  padding-left: 20px;
}
.intervention-plan li {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 8px;
}
.assessment-time {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  text-align: right;
}
.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.save-result-btn, .new-assessment-btn {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.save-result-btn {
  background-color: #52c41a;
  color: white;
}
.new-assessment-btn {
  background-color: #f0f0f0;
  color: #333;
}

/* === 历史记录新样式 === */
.history-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
.history-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.history-item {
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

/* 渐变背景：绿 → 黄 → 橙 → 红 */
.history-item.level-low {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}
.history-item.level-mild {
  background: linear-gradient(135deg, #faad14, #d48806);
}
.history-item.level-moderate {
  background: linear-gradient(135deg, #fa8c16, #d46b08);
}
.history-item.level-moderate-severe {
  background: linear-gradient(135deg, #fa541c, #d4380d);
}
.history-item.level-severe {
  background: linear-gradient(135deg, #d93025, #a8071a);
}

.history-item .history-date,
.history-item .history-score,
.history-item .history-level {
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.history-item .history-date {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 6px;
}
.history-item .history-score {
  font-size: 16px;
  margin-bottom: 4px;
}
.history-item .history-level {
  font-size: 13px;
  font-weight: 600;
}
</style>