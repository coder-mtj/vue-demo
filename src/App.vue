<!-- <script>
  export default {
    name: 'App',
    data() {
      return {
        message: 'Hello World!'
      }
    }
  }
</script> -->

<script setup>
import { ref, computed } from 'vue';
import { ElConfigProvider } from 'element-plus';
import { useRoute } from 'vue-router';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import ForgotPassword from './components/ForgotPassword.vue';

const route = useRoute();
const currentView = ref('login');

const switchView = (view) => {
  currentView.value = view;
};

// 计算属性，判断是否应该显示登录/注册页面
const showAuthPages = computed(() => {
  return route.path === '/';
});
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div>
      <!-- 登录/注册/忘记密码页面 -->
      <div v-if="showAuthPages" class="app-container">
        <div class="form-container">
          <component 
            :is="currentView === 'login' 
                ? Login 
                : currentView === 'register' 
                  ? Register 
                  : ForgotPassword" 
            @switch-view="switchView" 
          />
        </div>
      </div>
      
      <!-- 其他路由页面 -->
      <router-view v-else />
    </div>
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.form-container {
  width: 100%;
  max-width: 650px;
  padding: 30px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>  

