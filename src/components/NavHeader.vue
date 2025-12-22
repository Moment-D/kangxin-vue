<!-- 顶部导航组件 -->
<template>
  <header class="dark-nav">
    <!-- Logo 区域：点击刷新页面 -->
    <div class="logo" @click="refreshPage">
      <img src="@/assets/logo.png" alt="Ze AI-CARE Logo" class="logo-img" />
      <span class="logo-text">Ze AI-CARE</span>
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <ul class="menu-list">
        <li v-for="item in menuItems" :key="item.path" class="menu-item">
          <router-link :to="item.path" class="menu-link">
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 右侧用户操作区域 -->
    <div class="nav-right">
      <!-- 未登录状态：显示登录注册按钮 -->
      <div v-if="!isLoggedIn" class="auth-buttons">
        <button @click="goToRegister" class="register-btn">注册</button>
        <button @click="goToLogin" class="login-btn">登录</button>
      </div>
      
      <!-- 已登录状态：显示用户信息 -->
      <div v-else class="user-info">
        <div class="user-avatar">
          {{ userInitial }}
        </div>
        <span class="username">{{ userInfo.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式状态
const isLoggedIn = ref(false)
const userInfo = ref({})

// 计算用户名字的首字母（用于头像显示）
const userInitial = computed(() => {
  if (userInfo.value.username) {
    return userInfo.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

// 检查登录状态
const checkLoginStatus = () => {
  const savedUserInfo = localStorage.getItem('userInfo')
  const savedLoginStatus = localStorage.getItem('isLoggedIn')
  
  if (savedUserInfo && savedLoginStatus === 'true') {
    isLoggedIn.value = true
    userInfo.value = JSON.parse(savedUserInfo)
  } else {
    isLoggedIn.value = false
    userInfo.value = {}
  }
}

// 刷新页面（回到首页）
const refreshPage = () => {
  router.push('/')
  window.location.reload()
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 退出登录
const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem('userInfo')
  localStorage.removeItem('isLoggedIn')
  
  // 更新状态
  isLoggedIn.value = false
  userInfo.value = {}
  
  // 跳转到首页
  router.push('/')
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
  
  // 监听存储变化（用于多个标签页同步）
  window.addEventListener('storage', checkLoginStatus)
})

// 菜单数据
const menuItems = [
  { path: '/', label: '心光栖所' },
  { path: '/mental-health', label: '心晴苑' },
  { path: '/medical-assistant', label: '安康津梁' },
  { path: '/mind-relax', label: '静心云屿' },
  { path: '/health-record', label: '健康纪事' },
  { path: '/health-science', label: '康养知行' },
  { path: '/personal-center', label: '个人中心' }
]
</script>

<style scoped>
.dark-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background-color:rgb(121, 187, 255); /* 改为蓝色背景 */
  /* 添加阴影效果,水平垂直偏移量，模糊半径，rgb颜色+透明度 */
  box-shadow: 0 2px 10px rgba(24, 144, 255, 0.3); /* 调整阴影颜色 */
  height: 90px;
}

/* Logo 样式 */
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}
.logo-text {
  color: #fff; /* 文字保持白色，在蓝色背景上更清晰 */
  font-size: 20px;
  font-weight: bold;
}

/* 菜单样式 */
.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}
.menu-list {
  display: flex;
  list-style: none;
  gap: 55px;
  margin: 0;
  padding: 0;
}
.menu-link {
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
  font-weight: 700;
  position: relative;
  color: #fff; /* 文字保持白色 */
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
}

/* 悬浮动效修改为蓝色系 */
.menu-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #e2b6b6; /* 下划线改为白色 */
  transition: width 0.3s ease, transform 0.3s ease;
  transform-origin: bottom;
  border-radius: 4px;
}
.menu-link:hover {
  color:rgb(248, 152, 152); /* 悬浮时保持白色 */
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}
.menu-link:hover::after {
  width: 100%;
  transform: scaleY(1);
}

/* 路由激活样式 */
.menu-item.router-link-exact-active .menu-link {
  color: #fff; /* 激活时保持白色 */
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}
.menu-item.router-link-exact-active .menu-link::after {
  width: 100%;
}

/* 右侧用户操作区域 */
.nav-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 登录注册按钮样式调整 */
.auth-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 注册按钮样式 */
.register-btn {
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

/* 登录按钮样式 */
.login-btn {
  background: #fff;
  border: none;
  color: #1890ff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
}

.login-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-weight: 700;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
}

.username {
  font-weight: 600;
  font-size: 14px;
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Source Han Sans SC Bold", "Roboto Bold", sans-serif;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #fff;
  transform: translateY(-1px);
}
</style>