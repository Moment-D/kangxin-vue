import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件（后续创建）
import Home from '../views/HomeViews.vue'
//首页路由
import MentalHealth from '../views/MentalHealth.vue'
//心理健康路由
import MedicalAssistant from '../views/MedicalAssistant.vue'
//医疗助手路由
import MindRelax from '../views/MindRelax.vue'
//心灵舒缓馆路由
import MindRelaxMusic from "../views/MindRelaxMusic.vue";
// 舒缓音乐路由
import MindRelaxStory from "../views/MindRelaxStory.vue";
//静心故事路由
import HealthRecord from '../views/HealthRecord.vue'
// 健康档案路由
import HealthScience from '../views/HealthScience.vue'
// 健康科普路由
import RegisterView from '@/views/RegisterView.vue'

//注册页面路由
import LoginView from '@/views/LoginView.vue'
//登录中心路由

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: '心光栖所' } // 用于导航栏显示自定义名称
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
      meta:{title:'注册'}
    },
    {
      path: '/mental-health',
      name: 'MentalHealth',
      component: MentalHealth,
      meta: { title: '心晴苑' }
    },
     // 情绪监测页面路由
    {
      path: '/mental-health/emotion-detection',
      name: 'EmotionDetection',
      component: () => import('../views/EmotionDetection.vue'),
      meta: { title: '情绪监测' }
    },
    // 抑郁评估页面路由
    {
      path: '/mental-health/depression-assessment',
      name: 'DepressionAssessment',
      component: () => import('../views/DepressionAssessment.vue'),
      meta: { title: '抑郁评估' }
    },
    // 智能咨询页面路由
    {
      path: '/mental-health/smart-consultation',
      name: 'SmartConsultation',
      component: () => import('../views/SmartConsultation.vue'),
      meta: { title: '智能咨询' }
    },
    {
      path: '/medical-assistant',
      name: 'MedicalAssistant',
      component: MedicalAssistant,
      meta: { title: '安康津梁' }
    },
    // 皮肤病筛查页面路由
    {
      path: '/medical-assistant/skin-check',
      name: 'DermatologyScreening',
      component: () => import('../views/DermatologyScreening.vue'),
      meta: { title: '皮肤病筛查' }
    },
    // 用药管理页面路由
    {
       path: '/medical-assistant/drug-management',
      name: 'MedicationManagement',
      component: () => import('../views/MedicationManagement.vue'), 
      meta: { title: '用药管理' }
    },
    // 膳食分析页面路由
    {
      path: '/medical-assistant/diet-analysis',
      name: 'DietaryAnalysis',
      component: () => import('../views/DietaryAnalysis.vue'),
      meta: { title: '膳食分析' }
    },
    {
      path: '/mind-relax',
      name: 'MindRelax',
      component: MindRelax,
      meta: { title: '静心云屿' }
    },
    // 轻松游戏页面路由（补充的路由）
    {
      path: '/mind-relax/game',
      name: 'MindRelaxGame',
      component: () => import('../views/MindRelaxGame.vue'),
      meta: { title: '轻松游戏' }
    },
    // 手势贪吃蛇页面路由（补充的路由）
    {
      path: '/mind-relax/game/snake-game',
      name: 'MindRelaxSnakeGame',
      component: () => import('../views/MindRelaxSnakeGame.vue'),
      meta: { title: '手势贪吃蛇' }
    },
    // 俄罗斯方块游戏页面路由（补充的路由 - 注意对方路径名为breath，但标题是俄罗斯方块）
    {
      path: '/mind-relax/game/breath',
      name: 'MindRelaxBreath',
      component: () => import('../views/MindRelaxBreath.vue'),
      meta: { title: '俄罗斯方块' }
    },
    // 推箱子游戏页面路由（补充的路由）
    {
      path: '/mind-relax/game/sokoban',
      name: 'MindRelaxSokoban',
      component: () => import('../views/MindRelaxSokoban.vue'),
      meta: { title: '推箱子游戏' }
    },
    // 音乐播放页面路由（补充的路由）
    {
      path: '/mind-relax/music',
      name: 'MindRelaxMusic',
      component: MindRelaxMusic,
      meta: { title: '舒缓音乐' }
    },
    // 静心故事页面路由（补充的路由）
    {
      path: '/mind-relax/story',
      name: 'MindRelaxStory',
      component: MindRelaxStory,
      meta: { title: '静心故事' }
    },
    {
      path: '/health-record',
      name: 'HealthRecord',
      component: HealthRecord,
      meta: { title: '健康纪事' }
    },
    {
      path: '/health-science',
      name: 'HealthScience',
      component: HealthScience,
      meta: { title: '康养知行' }
    },
    // 运动健康页面路由 - 修正路径
    {
      path: '/health-science/exercise',
      name: 'ExerciseHealth',
      component: () => import('../views/ExerciseHealth.vue'),
      meta: { title: '运动健康' }
    },
    // 运动健康文章详情路由 - 修正路径
    {
      path: '/health-science/exercise/:id',
      name: 'ExerciseArticleDetail',
      component: () => import('../views/ArticleDetail.vue'),
      props: true
    },
    // 饮食健康页面路由 - 修正路径
    {
      path: '/health-science/diet',
      name: 'DietHealth',
      component: () => import('../views/DietHealth.vue'),
      meta: { title: '饮食健康' }
    },
    // 饮食健康文章详情路由 - 修正路径
    {
      path: '/health-science/diet/:id',
      name: 'DietArticleDetail',
      component: () => import('../views/ArticleDetail.vue'),
      props: true
    },
    // 作息健康页面路由 - 修正路径
    {
      path: '/health-science/rest',
      name: 'RestHealth',
      component: () => import('../views/RestHealth.vue'),
      meta: { title: '作息健康' }
    },
    // 作息健康文章详情路由 - 修正路径
    {
      path: '/health-science/rest/:id',
      name: 'RestArticleDetail',
      component: () => import('../views/ArticleDetail.vue'),
      props: true
    },
    {
      path: '/personal-center',
      name: 'PersonalCenter',
      // component:PersonalCenter,
      component: () =>import('../views/PersonalCenter.vue'),
      meta: { title: '个人中心' }
    }
  ]
})

export default router