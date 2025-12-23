// api.js
const API_CONFIG = {
  userService: 'https://47.109.193.83:8081',
  healthService: 'https://47.109.193.83:8082',
  medicalService: 'https://47.109.193.83:8083', // Java后端（保留不动）
  soulService: 'https://47.109.193.83:8084',
  healthScienceService: 'https://47.109.193.83:8085',
  personalProfile: 'https://47.109.193.83:8086',
  personalService: 'https://47.109.193.83:8087',
  pythonMedicalService: 'https://47.109.193.83:8000' // Python后端端口（和后端127.0.0.1:8000一致）
}

export const API_URLS = {
  // 用户服务
  CHAT: `${API_CONFIG.userService}/api/user/chat`,
  REGISTER: `${API_CONFIG.userService}/api/user/register`,
  LOGIN: `${API_CONFIG.userService}/api/user/Login/doLogin`,

  // 心理健康服务模块
  DEPRESSION_ASSESS: `${API_CONFIG.healthService}/api/mental-health/api/depression/assess`,
  EMOTION_DETECT: `${API_CONFIG.healthService}/api/mental-health/api/emotion/detect/add`,
  OCR_UPLOAD: `${API_CONFIG.healthService}/api/mental-health/api/emotion/ocr/upload`,
  CONSULT_CHAT: `${API_CONFIG.healthService}/api/mental-health/api/consult/chat`,
  CONSULT_TEST: `${API_CONFIG.healthService}/api/mental-health/api/consult/test`,

  // 医疗助手服务模块（Java后端 - 保留不动）
  MEDICATION_QUERY_IMAGE: `${API_CONFIG.medicalService}/api/medical-assistant/medication/query/image`,
  MEDICATION_QUERY_NAME: `${API_CONFIG.medicalService}/api/medical-assistant/medication/query/name`,
  MEDICATION_ASK: `${API_CONFIG.medicalService}/api/medical-assistant/medication/ask`,
  SKIN_ANALYSIS_JAVA: `${API_CONFIG.medicalService}/api/medical-assistant/skin/analysis`, // 重命名区分Java接口
  DIETARY_ANALYSIS: `${API_CONFIG.medicalService}/api/medical-assistant/dietary/analysis`,

  // Python后端皮肤分析接口（新增）
  SKIN_ANALYSIS_PYTHON: `${API_CONFIG.pythonMedicalService}/api/v1/skin-disease/predict`,
  // 修正：将 analysis 改为 predict，匹配后端接口
  FOOD_CALORIE_ANALYSIS_PYTHON: `${API_CONFIG.pythonMedicalService}/api/v1/food-calorie/predict`,

  // 个人中心服务接口
  PERSONAL_GET_USER_INFO: `${API_CONFIG.personalService}/api/personal/user/`,
  PERSONAL_UPDATE_PASSWORD: `${API_CONFIG.personalService}/api/personal/user/password`,
  PERSONAL_UPDATE_USER_INFO: `${API_CONFIG.personalService}/api/personal/user`,
  
  // 新增健康档案可视化接口（核心）
  VISUALIZATION_SCORE_TREND: `${API_CONFIG.personalProfile}/api/personal/profile/visualization/score-trend`,
  VISUALIZATION_EMOTION_DISTRIBUTION: `${API_CONFIG.personalProfile}/api/personal/profile/visualization/emotion-distribution`,
  VISUALIZATION_RELAXATION_USAGE: `${API_CONFIG.personalProfile}/api/personal/profile/visualization/relaxation-usage`,
  VISUALIZATION_DEPRESSION_RESULT: `${API_CONFIG.personalProfile}/api/personal/profile/visualization/depression-result`,
  
  // 新增健康数据导出接口
  EXPORT_HEALTH_DATA: `${API_CONFIG.personalProfile}/api/personal/profile/export`,

  // 新增健康科普服务接口
  HEALTH_SCIENCE_ALL_INFO: `${API_CONFIG.healthScienceService}/api/health-science/health/allInfo`,

  // 心灵服务（补充的API）
  SOUL_ASSESS: `${API_CONFIG.soulService}/api/soul-soothing`,
  MUSIC: `${API_CONFIG.soulService}/api/soul-soothing/music`,
  MUSIC_FIND_PAGE: `${API_CONFIG.soulService}/api/soul-soothing/music/findPage`,  // 音乐分页
  STORY: `${API_CONFIG.soulService}/api/soul-soothing/audio/story`,
  GAME: `${API_CONFIG.soulService}/api/soul-soothing/game`,
}

export const USER_API = {
  base: API_CONFIG.userService,
  chat: API_URLS.CHAT,
  register: API_URLS.REGISTER,
  login: API_URLS.LOGIN
}

export const HEALTH_API = {
  base: API_CONFIG.healthService,
  depressionAssess: API_URLS.DEPRESSION_ASSESS,
  emotionDetect: API_URLS.EMOTION_DETECT,
  ocrUpload: API_URLS.OCR_UPLOAD,
  consultChat: API_URLS.CONSULT_CHAT,
  consultTest: API_URLS.CONSULT_TEST
}

export const MEDICAL_API = {
  base: API_CONFIG.medicalService, // Java后端基础地址（保留）
  medication: {
    queryImage: API_URLS.MEDICATION_QUERY_IMAGE,
    queryName: API_URLS.MEDICATION_QUERY_NAME,
    askQuestion: API_URLS.MEDICATION_ASK
  },
  skin: {
    analysisJava: API_URLS.SKIN_ANALYSIS_JAVA, // Java皮肤分析接口
    analysisPython: API_URLS.SKIN_ANALYSIS_PYTHON // Python皮肤分析接口（新增）
  },
  dietary: {
    analysis: API_URLS.DIETARY_ANALYSIS
  },
  // Python后端单独配置（新增）
  pythonBase: API_CONFIG.pythonMedicalService,
  foodCalorie: {
    // 修正：使用正确的predict路径
    analysis: API_URLS.FOOD_CALORIE_ANALYSIS_PYTHON
  }
}

// 个人中心API配置
export const PERSONAL_API = {
  base: API_CONFIG.personalService,
  getUserInfo: API_URLS.PERSONAL_GET_USER_INFO,
  updatePassword: API_URLS.PERSONAL_UPDATE_PASSWORD,
  updateUserInfo: API_URLS.PERSONAL_UPDATE_USER_INFO,
  // 新增可视化接口
  visualization: {
    scoreTrend: API_URLS.VISUALIZATION_SCORE_TREND,
    emotionDistribution: API_URLS.VISUALIZATION_EMOTION_DISTRIBUTION,
    relaxationUsage: API_URLS.VISUALIZATION_RELAXATION_USAGE,
    depressionResult: API_URLS.VISUALIZATION_DEPRESSION_RESULT
  },
  exportData: API_URLS.EXPORT_HEALTH_DATA
}

// 新增健康科普API配置
export const HEALTH_SCIENCE_API = {
  base: API_CONFIG.healthScienceService,
  allInfo: API_URLS.HEALTH_SCIENCE_ALL_INFO
}

// 心灵服务API配置（补充的配置）
export const SOUL_API = {
  base: API_CONFIG.soulService,
  music: API_URLS.MUSIC,
  musicFindPage: API_URLS.MUSIC_FIND_PAGE,
  story: API_URLS.STORY,
  game: API_URLS.GAME,
  soulAssess: API_URLS.SOUL_ASSESS
}

export { API_CONFIG }
