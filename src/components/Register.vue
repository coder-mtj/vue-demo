<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Phone, Avatar } from '@element-plus/icons-vue';
import axios from 'axios';

const emit = defineEmits(['switch-view']);

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  agreement: false
});

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const validateEmail = (rule, value, callback) => {
  if (value === '') {
    callback(); // 邮箱非必填
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'));
  } else {
    callback();
  }
};

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (value === '') {
    callback(new Error('请输入手机号码'));
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号格式'));
  } else {
    callback();
  }
};

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
};

const formRef = ref(null);
const loading = ref(false);

const handleRegister = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      try {
        const response = await axios.post('/api/auth/register', {
          username: registerForm.value.username,
          password: registerForm.value.password,
          realName: registerForm.value.realName,
          phone: registerForm.value.phone,
          email: registerForm.value.email || undefined // 如果为空则不发送该字段
        });
        
        if (response.data.success) {
          ElMessage.success('注册成功！');
          emit('switch-view', 'login');
        } else {
          ElMessage.error(response.data.message || '注册失败');
        }
      } catch (error) {
        console.error('注册失败:', error);
        if (error.response) {
          const status = error.response.status;
          let errorMsg = '注册失败';
          
          if (status === 400) {
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
            } else {
              errorMsg = '用户名已存在或者手机号不能为空';
            }
          } else if (status === 500) {
            errorMsg = '注册失败，服务器内部错误';
          }
          
          ElMessage.error(errorMsg);
        } else {
          ElMessage.error('注册失败，请检查网络连接');
        }
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};
</script>

<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="card-header">
        <h2 class="register-title">用户注册</h2>
        <p class="register-subtitle">创建您的账号，开始使用系统</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="realName">
          <el-input 
            v-model="registerForm.realName" 
            placeholder="请输入真实姓名" 
            :prefix-icon="Avatar"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input 
            v-model="registerForm.phone" 
            placeholder="请输入手机号码" 
            :prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱地址（选填）" 
            :prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意 <el-link type="primary" class="agreement-link">用户协议</el-link>
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            class="register-button"
            size="large"
            :loading="loading"
          >
            立即注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账号？
          <el-link type="primary" @click="emit('switch-view', 'login')">
            立即登录
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  padding: 0 20px;
}

.register-card {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  border: none;
}

.card-header {
  padding: 20px 20px 0;
}

.register-title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.register-subtitle {
  text-align: center;
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

.register-form {
  padding: 20px;
}

.register-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 4px;
}

.agreement-link {
  margin: 0 4px;
}

.login-link {
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