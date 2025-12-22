<template>
  <div 
     ref="container" 
    class="robot-container"
    @mousedown="startDrag"
    @click="handleRobotClick"
    @dblclick="handleRobotClick"
  ></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const emit = defineEmits(['robot-click', 'show-tip'])
const container = ref(null)

// 使用全局单例对象来存储Three.js实例，确保整个应用中只有一个渲染实例
if (!window.__robotViewerSingleton) {
  window.__robotViewerSingleton = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animationId: null,
    robot: null,
    isInitialized: false,
    container: null
  }
}

const singleton = window.__robotViewerSingleton
const initialScale = 3.0

// 拖拽相关变量
let isDragging = false
let startX, startY, initialX, initialY
let hasMoved = false
let tipTimer = null

const handleRobotClick = () => {
  if (isDragging || hasMoved) {
    hasMoved = false
    return
  }
  
  if (singleton.robot) {
    singleton.robot.scale.set(initialScale * 1.1, initialScale * 1.1, initialScale * 1.1)
    setTimeout(() => {
      singleton.robot.scale.set(initialScale, initialScale, initialScale)
    }, 200)
  // 添加额外的视觉反馈 - 闪烁效果
    singleton.robot.traverse(child => {
      if (child.isMesh && child.material) {
        const originalEmissive = child.material.emissive.clone()
        child.material.emissive.set(0x888888)
        setTimeout(() => {
          child.material.emissive.copy(originalEmissive)
        }, 150)
      }
    })
  }
  console.log('机器人被点击，发出robot-click事件')
  emit('robot-click')
}

const startDrag = (e) => {
  isDragging = true
  hasMoved = false
  startX = e.clientX
  startY = e.clientY
  
  if (container.value) {
    const rect = container.value.getBoundingClientRect()
    initialX = rect.left
    initialY = rect.top
  }
  
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', stopDrag)
}

const drag = (e) => {
  if (!isDragging || !container.value) return
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  container.value.style.left = `${initialX + dx}px`
  container.value.style.top = `${initialY + dy}px`
  container.value.style.transform = 'none'
  
  hasMoved = Math.abs(dx) > 5 || Math.abs(dy) > 5
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
  
  setTimeout(() => {
    hasMoved = false
  }, 100)
}

// 清理函数
const cleanup = () => {
  // 只有当当前容器是初始化容器时才清理
  if (singleton.container === container.value) {
    if (singleton.animationId) {
      cancelAnimationFrame(singleton.animationId)
      singleton.animationId = null
    }
    
    if (singleton.renderer && singleton.container) {
      singleton.container.removeChild(singleton.renderer.domElement)
      singleton.renderer.dispose()
    }
    
    if (singleton.controls) {
      singleton.controls.dispose()
    }
    
    if (singleton.scene) {
      while (singleton.scene.children.length > 0) {
        singleton.scene.remove(singleton.scene.children[0])
      }
    }
    
    // 重置单例状态
    singleton.scene = null
    singleton.camera = null
    singleton.renderer = null
    singleton.controls = null
    singleton.robot = null
    singleton.isInitialized = false
    singleton.container = null
  }
  
  // 清理当前组件的事件监听器和定时器
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
  
  if (tipTimer) {
    clearTimeout(tipTimer)
    tipTimer = null
  }
}

function initScene() {
  // 确保只初始化一次
  if (singleton.isInitialized) {
    // 如果已经初始化但容器不同，将canvas移动到新容器
    if (singleton.container !== container.value && singleton.renderer) {
      if (singleton.container) {
        singleton.container.removeChild(singleton.renderer.domElement)
      }
      container.value.appendChild(singleton.renderer.domElement)
      singleton.container = container.value
    }
    return
  }
  
  if (!container.value) return
  
  const { clientWidth, clientHeight } = container.value

  // 创建新的场景实例
  singleton.scene = new THREE.Scene()

  // 设置相机
  singleton.camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 1000)
  singleton.camera.position.set(0, 0, 1.8)

  // 创建渲染器
  singleton.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  singleton.renderer.setSize(clientWidth, clientHeight)
  singleton.renderer.shadowMap.enabled = true
  
  // 清空容器
  while (container.value.firstChild) {
    container.value.removeChild(container.value.firstChild)
  }
  
  container.value.appendChild(singleton.renderer.domElement)

  // 设置控制器
  singleton.controls = new OrbitControls(singleton.camera, singleton.renderer.domElement)
  singleton.controls.enableDamping = true
  singleton.controls.dampingFactor = 0.1
  singleton.controls.minDistance = 1.5
  singleton.controls.maxDistance = 3
  singleton.controls.enablePan = false

  // 添加光照
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
  mainLight.position.set(3, 6, 4)
  mainLight.castShadow = true
  singleton.scene.add(mainLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  singleton.scene.add(ambientLight)
  
  // 更新单例状态
  singleton.isInitialized = true
  singleton.container = container.value
}

function loadRobotModel() {
  if (!singleton.scene || singleton.robot) return
  
  const loader = new GLTFLoader()
  loader.load(
    '/robot.glb',
    (gltf) => {
      // 确保只有一个机器人模型
      if (singleton.robot) {
        singleton.scene.remove(singleton.robot)
      }
      
      singleton.robot = gltf.scene
      singleton.robot.scale.set(initialScale, initialScale, initialScale)
      singleton.robot.position.y = -0.5
      
      singleton.robot.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      singleton.scene.add(singleton.robot)
    },
    (progress) => console.log(`模型加载中：${Math.round(progress.loaded / progress.total * 100)}%`),
    (error) => console.error('模型加载失败：', error)
  )
}

function animate() {
  if (!singleton.renderer || !singleton.scene || !singleton.camera) return
  
  singleton.animationId = requestAnimationFrame(animate)
  
  if (singleton.robot) {
    singleton.robot.rotation.y += 0.008
  }
  
  if (singleton.controls) {
    singleton.controls.update()
  }
  
  singleton.renderer.render(singleton.scene, singleton.camera)
}

function onWindowResize() {
  if (!container.value || !singleton.camera || !singleton.renderer) return
  
  const { clientWidth, clientHeight } = container.value
  singleton.camera.aspect = clientWidth / clientHeight
  singleton.camera.updateProjectionMatrix()
  singleton.renderer.setSize(clientWidth, clientHeight)
}

onMounted(() => {
  if (container.value) {
    initScene()
    loadRobotModel()
    // 只有当动画循环未运行时才启动
    if (!singleton.animationId) {
      animate()
    }
    window.addEventListener('resize', onWindowResize)
    
    // 设置提示定时器
    tipTimer = setTimeout(() => {
      emit('show-tip', '我是你的小助手，你可以询问我一些关于网站的问题')
    }, 5000)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.robot-container {
  position: fixed;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
  width: 360px;
  height: 360px;
  border-radius: 50%;
  z-index: 100;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
}

.robot-container canvas {
  pointer-events: none;
}
</style>