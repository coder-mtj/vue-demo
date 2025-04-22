<script setup>
/**
 * 登录组件
 * 提供用户登录功能，包含表单验证、记住登录状态等功能
 * 使用Element Plus组件库实现UI界面
 */
import { ref } from 'vue'; // 导入Vue的响应式API
import { ElMessage } from 'element-plus'; // 导入Element Plus的消息提示组件
import { User, Lock } from '@element-plus/icons-vue'; // 导入用户和锁图标用于输入框
import axios from 'axios'; // 导入HTTP请求库
import { useRouter } from 'vue-router'; // 导入路由器，用于页面跳转

// 初始化路由器实例
const router = useRouter();
// 定义事件，用于在不同视图间切换（登录、注册、忘记密码）
const emit = defineEmits(['switch-view']);

// 使用ref定义响应式登录表单数据
const loginForm = ref({
  username: '', // 用户名
  password: '', // 密码
  remember: false // 是否记住登录状态
});

// 定义表单验证规则
const rules = {
  // 用户名验证规则：必填，长度3-20个字符
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  // 密码验证规则：必填，长度6-20个字符
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 表单引用，用于表单验证和提交
const formRef = ref(null);
// 加载状态，控制登录按钮的loading效果
const loading = ref(false);

/**
 * 处理登录逻辑
 * 1. 验证表单数据
 * 2. 发送登录请求
 * 3. 处理登录成功/失败逻辑
 */
const handleLogin = async () => {
  if (!formRef.value) return;
  
  // 表单验证
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true; // 显示加载状态
      
      try {
        // 发送登录请求到后端API
        const response = await axios.post('/api/auth/login', {
          username: loginForm.value.username,
          password: loginForm.value.password
        });
        
        // 处理响应结果
        if (response.data.code === 200 && response.data.success) {
          // 登录成功，获取用户信息和token
          const { user, token } = response.data.data;
          // 将token和用户信息存储到本地存储中
          localStorage.setItem('token', token);
          localStorage.setItem('userInfo', JSON.stringify(user));
          
          // 处理"记住我"功能
          if (loginForm.value.remember) {
            // 如果选择了"记住我"，则保存用户名
            localStorage.setItem('rememberUser', loginForm.value.username);
          } else {
            // 否则删除之前可能存在的记住用户名
            localStorage.removeItem('rememberUser');
          }
          
          // 显示登录成功消息
          ElMessage.success('登录成功！');
          // 延迟1.5秒后跳转到仪表盘页面
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          // 登录失败，显示错误消息
          ElMessage.error(response.data.message || '登录失败，请检查用户名和密码');
        }
      } catch (error) {
        // 处理网络错误或服务器错误
        console.error('登录失败:', error);
        ElMessage.error('登录失败，请检查网络连接或服务器状态');
      } finally {
        // 无论成功还是失败，都关闭加载状态
        loading.value = false;
      }
    } else {
      // 表单验证失败
      return false;
    }
  });
};

/**
 * 检查是否有记住的用户
 * 在组件加载时执行，恢复之前保存的用户名
 */
const checkRememberedUser = () => {
  // 从本地存储中获取记住的用户名
  const rememberedUser = localStorage.getItem('rememberUser');
  if (rememberedUser) {
    // 如果存在，填充到表单中
    loginForm.value.username = rememberedUser;
    loginForm.value.remember = true;
  }
};

// 组件加载时执行，检查记住的用户
checkRememberedUser();
</script>

<template>
  <!-- 登录页面容器 -->
  <div class="login-container">
    <!-- 登录卡片 -->
    <el-card class="login-card">
      <!-- 卡片头部，包含标题和副标题 -->
      <div class="card-header">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">请使用您的账号登录系统</p>
      </div>
      
      <!-- 登录表单，按回车键触发登录 -->
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        class="login-form"
        @keydown.enter="handleLogin"
      >
        <!-- 用户名输入框，使用用户图标作为前缀 -->
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <!-- 密码输入框，使用锁图标作为前缀，显示密码切换按钮 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        
        <!-- 登录选项：记住我和忘记密码 -->
        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password" @click="emit('switch-view', 'forgot')">忘记密码?</el-link>
        </div>
        
        <!-- 登录按钮，加载状态时显示加载动画 -->
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            class="login-button"
            size="large"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
        
        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="emit('switch-view', 'register')">
            立即注册
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
/* 登录容器样式，确保在各种屏幕尺寸上具有适当的宽度和内边距 */
.login-container {
  width: 100%;
  padding: 0 20px;
}

/* 登录卡片样式，添加圆角和阴影效果 */
.login-card {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  border: none;
}

/* 卡片头部样式 */
.card-header {
  padding: 20px 20px 0;
}

/* 登录标题样式 */
.login-title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 登录副标题样式 */
.login-subtitle {
  text-align: center;
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

/* 登录表单样式 */
.login-form {
  padding: 20px;
}

/* 登录按钮样式 */
.login-button {
  width: 100%;
  margin-top: 10px;
  height: 45px;
  font-size: 16px;
  border-radius: 4px;
}

/* 登录选项区域样式，使"记住我"和"忘记密码"在一行显示 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 忘记密码链接样式 */
.forgot-password {
  font-size: 14px;
}

/* 注册链接区域样式 */
.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

/* 深度选择器，修改Element Plus组件内部样式 */
:deep(.el-input__wrapper) {
  border-radius: 4px;
}

/* 修改表单标签的字体粗细 */
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 