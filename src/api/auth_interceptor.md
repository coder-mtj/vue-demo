# Vue前端认证拦截实现方案

本文档提供了基于Vue.js框架实现请求拦截的简单方案，确保除登录和注册之外的所有API请求都带有JWT令牌。

## 1. 安装依赖

确保项目已安装axios用于HTTP请求：

```bash
npm install axios
```

## 2. 创建HTTP请求客户端

在项目中创建一个HTTP请求客户端，用于统一管理API请求和拦截：

```js
// src/utils/http.js

import axios from 'axios'
import router from '@/router'

// 创建axios实例
const http = axios.create({
  baseURL: '/', // API的基础URL（注意：不再包含/api前缀）
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 打印拦截信息
    console.log('请求拦截:', config.url, token ? '有Token' : '无Token')
    
    // 如果token存在，则添加到请求头中
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('响应错误:', error.response)
    
    // 如果响应状态码是401（未授权），则跳转到登录页
    if (error.response && error.response.status === 401) {
      console.log('未授权，跳转到登录页')
      localStorage.removeItem('token') // 清除token
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)

export default http
```

## 3. 实现登录和注册功能

创建认证服务，处理登录和注册请求（注意路径已更新）：

```js
// src/api/auth.js

import http from '@/utils/http'

export default {
  // 用户登录
  login(username, password) {
    return http.post('/auth/login', {
      username,
      password
    })
  },
  
  // 用户注册
  register(userData) {
    return http.post('/auth/register', userData)
  }
}
```

## 4. 在组件中使用

示例：登录组件

```vue
<template>
  <div>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script>
import auth from '@/auth'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await auth.login(this.username, this.password)
        
        // 保存token到localStorage
        localStorage.setItem('token', response.token)
        
        // 跳转到首页
        this.$router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请检查用户名和密码')
      }
    }
  }
}
</script>
```

## 5. 添加路由守卫

在路由中添加全局前置守卫，防止未登录用户访问需要认证的页面：

```js
// src/router/index.js

import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 打印路由拦截信息
  console.log('路由拦截:', to.path, token ? '有Token' : '无Token')
  
  // 如果访问的不是登录或注册页面，且没有token，则重定向到登录页
  if (to.path !== '/login' && to.path !== '/register' && !token) {
    console.log('未登录，重定向到登录页')
    next('/login')
  } else {
    next()
  }
})

export default router
```

## 6. 状态管理（可选）

如果项目使用Vuex进行状态管理，可以创建认证模块：

```js
// src/store/modules/auth.js

export default {
  namespaced: true,
  
  state: {
    token: localStorage.getItem('token') || '',
    user: null
  },
  
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    
    CLEAR_TOKEN(state) {
      state.token = ''
      localStorage.removeItem('token')
    },
    
    SET_USER(state, user) {
      state.user = user
    }
  },
  
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    
    logout({ commit }) {
      commit('CLEAR_TOKEN')
      commit('SET_USER', null)
    }
  },
  
  getters: {
    isAuthenticated: state => !!state.token
  }
}
```

## 总结

这个简单的方案通过以下步骤实现了认证拦截：

1. 使用axios拦截器为每个请求添加JWT令牌
2. 拦截未授权的响应并跳转到登录页
3. 使用路由守卫防止未登录用户访问受保护的页面
4. 结合Vuex进行状态管理（可选）

这种方案简单实用，可根据项目需求进行扩展和定制。每一步都有打印输出，便于调试和理解认证流程。

## 注意事项

* 当前配置中，后端API路径不包含`/api`前缀，请确保与后端路径配置一致
* 如果后端API部署在不同的域名或路径下，请调整`baseURL`设置
* 确保登录接口返回的数据格式包含token字段 