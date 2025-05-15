# 葡萄园智能管理系统

一个基于Vue 3和Element Plus开发的现代化葡萄园管理系统，集成了数据可视化、视频监控、AI智能客服和田块管理等功能，为葡萄园管理提供一站式解决方案。

![葡萄园管理系统](./public/dashboard_preview.png)

## 功能特性

- **数据可视化**：直观展示工具维护计划和葡萄成熟预测
- **视频监控**：支持多摄像头实时监控、录制和本地保存
- **AI智能客服**：基于DeepSeek V3模型的智能问答系统，提供葡萄品种和种植知识咨询
- **田块管理**：可视化管理田块状态、种植记录和预计产量
- **作物管理**：葡萄品种信息录入、修改和查看
- **响应式设计**：适配各种设备尺寸，提供良好的移动端体验
- **多用户权限**：支持不同权限级别的用户管理

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **数据可视化**：ECharts
- **状态管理**：Vue 3 Reactive API
- **HTTP客户端**：Axios
- **视频处理**：MediaDevices API + MediaRecorder API
- **AI集成**：SiliconFlow API (DeepSeek V3)

## 项目结构

```
├── public/               # 静态资源
├── src/
│   ├── api/              # API接口定义
│   ├── assets/           # 项目资源文件
│   ├── components/       # 组件
│   │   ├── Dashboard.vue # 主控制台
│   │   ├── DeepSeekChat.vue # AI客服组件
│   │   ├── VideoMonitor.vue # 视频监控组件
│   │   └── VisualizationScreen.vue # 数据可视化组件
│   ├── router/           # 路由配置
│   ├── views/            # 页面视图
│   ├── App.vue           # 应用入口组件
│   └── main.js           # 应用入口文件
├── index.html            # HTML模板
├── package.json          # 项目依赖
└── vite.config.js        # Vite配置
```

## 安装与启动

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装步骤

1. 克隆项目

```sh
git clone https://github.com/yourusername/vue_demo.git
cd vue_demo
```

2. 安装依赖

```sh
npm install
```

3. 开发环境运行

```sh
npm run dev
```

4. 生产环境构建

```sh
npm run build
```

生成的文件将保存在`dist`目录中，可部署到任何静态文件服务器。

## 使用指南

### 登录系统

使用您的用户名和密码登录系统。不同级别的用户将看到不同的功能模块。

### 视频监控

1. 在仪表盘中选择"视频监控"模块
2. 可以选择单摄像头、双摄像头或四摄像头布局
3. 点击"连接"按钮启用摄像头
4. 使用录制按钮可以录制视频并保存到本地

### AI客服

1. 在仪表盘中选择"智能客服"模块
2. 可以直接输入问题咨询葡萄种植相关信息
3. 左侧提供了葡萄品种快速入口，点击"咨询"按钮可快速获取特定品种信息

### 数据可视化

1. 在仪表盘中选择"数据可视化"模块
   2. 查看工具维护计划图表，了解即将需要维护的工具
3. 查看葡萄成熟预测图表，规划采收时间

## 开发指南

### 推荐的IDE设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur)

### 自定义配置

参见 [Vite配置参考](https://vitejs.dev/config/)

### API服务器

本项目默认API端点为`http://localhost:8080/api`，可以在开发环境中修改`vite.config.js`中的代理设置。

## 许可

[HIT](LICENSE)
