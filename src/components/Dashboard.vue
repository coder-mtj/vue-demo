<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Grape, Setting, User, Tools, MapLocation, DataLine, ChatDotRound, VideoCamera } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 获取路由
const router = useRouter();

// 获取存储的用户信息
const userInfo = ref({
  username: ''
});

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      userInfo.value = parsedUserInfo;
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
});

// 功能模块列表
const modules = ref([
  {
    id: 1,
    title: '部门管理',
    icon: Setting,
    link: '/department',
    color: '#409EFF'
  },
  {
    id: 2,
    title: '职工管理',
    icon: User,
    link: '/employee',
    color: '#67C23A'
  },
  {
    id: 3,
    title: '农具管理',
    icon: Tools,
    link: '/agri-tool',
    color: '#E6A23C'
  },
  {
    id: 4,
    title: '农具申请使用',
    icon: Tools,
    link: '/tool-usage',
    color: '#F56C6C'
  },
  {
    id: 5,
    title: '葡萄作物管理',
    icon: Grape,
    link: '/crop-management',
    color: '#8B0000'
  },
  {
    id: 6,
    title: '田块管理',
    icon: MapLocation,
    link: '/field-management',
    color: '#006400'
  },
  {
    id: 7,
    title: '可视化展示',
    icon: DataLine,
    link: '/visualization',
    color: '#9B59B6'
  },
  {
    id: 8,
    title: '葡萄园智能客服',
    icon: ChatDotRound,
    link: '/deepseek-chat',
    color: '#2C3E50'
  },
  {
    id: 9,
    title: '视频监控',
    icon: VideoCamera,
    link: '/video-monitor',
    color: '#FF9500'
  }
]);

// 处理模块点击
const handleModuleClick = (moduleLink) => {
  if (moduleLink === '#') {
    ElMessage.info('该功能暂未开放，敬请期待');
  } else if (moduleLink.startsWith('/')) {
    // 内部路由导航
    router.push(moduleLink);
  } else {
    // 外部链接
    window.location.href = moduleLink;
  }
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.href = '/';
};
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo-container">
        <el-icon class="logo-icon"><Grape /></el-icon>
        <h1 class="logo-text">天道葡萄园中控</h1>
      </div>
      <div class="user-info">
        <el-dropdown trigger="click">
          <span class="user-dropdown-link">
            {{ userInfo.username || '用户' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <h2 class="page-title">功能中控</h2>
      
      <div class="modules-grid">
        <div 
          v-for="module in modules" 
          :key="module.id" 
          class="module-card"
          @click="handleModuleClick(module.link)"
        >
          <div class="module-icon" :style="{ backgroundColor: module.color }">
            <el-icon><component :is="module.icon" /></el-icon>
          </div>
          <div class="module-title">{{ module.title }}</div>
        </div>
      </div>
    </el-main>
    
    <!-- 页脚 -->
    <el-footer class="footer">
      <p>© 2025 天道葡萄园管理系统 版权所有</p>
    </el-footer>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 24px;
  color: #8e44ad;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  width: 100%;
  text-align: center;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 280px));
  gap: 30px;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
}

.module-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 180px;
  justify-content: center;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.module-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.module-icon .el-icon {
  font-size: 32px;
  color: white;
}

.module-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-top: 15px;
}

.footer {
  background-color: #fff;
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
  margin-top: auto;
  width: 100%;
}
</style> 