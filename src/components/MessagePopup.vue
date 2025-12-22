<!-- 消息提示组件 -->
<template>
  <div v-if="visible" class="message-popup" :class="type">
    <div class="message-content">
      <span class="message-text">{{ message }}</span>
      <button class="close-btn" @click="closeMessage">×</button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'MessagePopup',
  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'info', 'warning', 'error'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  setup(props) {
    const visible = ref(false)

    const show = () => {
      visible.value = true
      const timer = setTimeout(() => {
        visible.value = false
      }, props.duration)
      // 清除定时器
      return () => clearTimeout(timer)
    }

    const closeMessage = () => {
      visible.value = false
    }

    watch(() => props.message, (newMessage) => {
      if (newMessage) {
        show()
      }
    })

    return {
      visible,
      show,
      closeMessage
    }
  }
}
</script>

<style scoped>
.message-popup {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 600px;
  animation: slideDown 0.3s ease-out;
}

.message-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-radius: 4px;
  font-family: "Source Han Sans SC", "Roboto", sans-serif;
  font-size: 14px;
  width: 100%;
}

/* 类型对应的背景色 */
.message-popup.primary .message-content {
  background-color: #e8f4ff;
  color: #1890ff;
}
.message-popup.success .message-content {
  background-color: #f0f9eb;
  color: #52c41a;
}
.message-popup.info .message-content {
  background-color: #f4f4f5;
  color: #909399;
}
.message-popup.warning .message-content {
  background-color: #fffbe6;
  color: #faad14;
}
.message-popup.error .message-content {
  background-color: #fff2f0;
  color: #f5222d;
}

/* 关闭按钮 */
.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-left: 16px;
  padding: 0;
  line-height: 1;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>