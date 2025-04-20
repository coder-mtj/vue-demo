<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const emit = defineEmits(['switch-view']);

const handleBack = () => {
  emit('switch-view', 'login');
};
</script>

<template>
  <div class="forgot-container">
    <el-card class="forgot-card">
      <div class="card-header">
        <h2 class="forgot-title">忘记密码</h2>
        <p class="forgot-subtitle">密码重置服务</p>
      </div>
      
      <div class="content">
        <div class="info-box">
          <el-alert
            title="请联系系统管理员"
            type="info"
            description="如果您忘记了密码，请发送邮件到系统管理员邮箱进行重置。"
            :closable="false"
            show-icon
          />
          
          <div class="email-info">
            <p class="label">系统管理员邮箱：</p>
            <p class="email">mtj295152@gmail.com</p>
          </div>
          
          <div class="note">
            <p>在邮件中请提供以下信息：</p>
            <ol>
              <li>您的用户名</li>
              <li>注册时使用的手机号码</li>
              <li>重置密码申请原因</li>
            </ol>
          </div>
        </div>
        
        <el-button 
          @click="handleBack" 
          class="back-button"
          :icon="ArrowLeft"
          size="large"
        >
          返回登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.forgot-container {
  width: 100%;
  padding: 0 20px;
}

.forgot-card {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  border: none;
}

.card-header {
  padding: 20px 20px 0;
}

.forgot-title {
  text-align: center;
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.forgot-subtitle {
  text-align: center;
  color: #909399;
  margin-top: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.content {
  padding: 0 20px 30px;
}

.info-box {
  margin-bottom: 30px;
}

.email-info {
  margin: 25px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #606266;
}

.email {
  font-size: 18px;
  color: #409eff;
  font-weight: 600;
}

.note {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.note p {
  margin-bottom: 8px;
}

.note ol {
  padding-left: 20px;
}

.note li {
  margin-bottom: 5px;
}

.back-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 4px;
}
</style> 