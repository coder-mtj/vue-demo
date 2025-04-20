import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import App from '../App.vue'
import Dashboard from '../components/Dashboard.vue'
import DepartmentManagement from '../components/DepartmentManagement.vue'
import EmployeeManagement from '../components/EmployeeManagement.vue'
import ToolManagement from '../components/ToolManagement.vue'
import ToolUsageApply from '../components/ToolUsageApply.vue'
import CropManagement from '../components/CropManagement.vue'
import FieldManagement from '../components/FieldManagement.vue'
import VisualizationScreen from '../components/VisualizationScreen.vue'
import DeepSeekChat from '../components/DeepSeekChat.vue'
import VideoMonitor from '../components/VideoMonitor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/department',
      name: 'department',
      component: DepartmentManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/employee',
      name: 'employee',
      component: EmployeeManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/agri-tool',
      name: 'agri-tool',
      component: ToolManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/tool-usage',
      name: 'tool-usage',
      component: ToolUsageApply,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/crop-management',
      name: 'crop-management',
      component: CropManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/field-management',
      name: 'field-management',
      component: FieldManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/visualization',
      name: 'visualization',
      component: VisualizationScreen,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/deepseek-chat',
      name: 'deepseek-chat',
      component: DeepSeekChat,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/video-monitor',
      name: 'video-monitor',
      component: VideoMonitor,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// 添加全局前置守卫，验证登录状态
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');
  
  if (requiresAuth && !token) {
    next('/');
  } else {
    next();
  }
});

export default router
