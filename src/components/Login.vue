<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['switch-view']);

const loginForm = ref({
  username: '',
  password: '',
  remember: false
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

const formRef = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      try {
        const response = await axios.post('/api/auth/login', {
          username: loginForm.value.username,
          password: loginForm.value.password
        });
        
        if (response.data.code === 200 && response.data.success) {
          // 存储用户信息和token
          const { user, token } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('userInfo', JSON.stringify(user));
          
          // 记住我功能
          if (loginForm.value.remember) {
            localStorage.setItem('rememberUser', loginForm.value.username);
          } else {
            localStorage.removeItem('rememberUser');
          }
          
          ElMessage.success('登录成功！');
          // 登录成功后跳转
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          ElMessage.error(response.data.message || '登录失败，请检查用户名和密码');
        }
      } catch (error) {
        console.error('登录失败:', error);
        ElMessage.error('登录失败，请检查网络连接或服务器状态');
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};

// 页面加载时检查是否有记住的用户
const checkRememberedUser = () => {
  const rememberedUser = localStorage.getItem('rememberUser');
  if (rememberedUser) {
    loginForm.value.username = rememberedUser;
    loginForm.value.remember = true;
  }
};

checkRememberedUser();
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="card-header">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">请使用您的账号登录系统</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        class="login-form"
        @keydown.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
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
        
        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password" @click="emit('switch-view', 'forgot')">忘记密码?</el-link>
        </div>
        
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

.login-container {
  width: 100%;
  padding: 0 20px;
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  border: none;
}

.card-header {
  padding: 20px 20px 0;
}

.login-title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.login-subtitle {
  text-align: center;
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

.login-form {
  padding: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
  height: 45px;
  font-size: 16px;
  border-radius: 4px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 14px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 