<template>
  <div class="visualization-container">
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
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="content-wrapper">
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">葡萄园数据预测</h2>
        </div>
        <div class="right">
          <el-select v-model="currentYear" placeholder="选择年份" @change="handleYearChange">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="year + '年'"
              :value="year"
            />
          </el-select>
        </div>
      </div>

      <div class="data-summary">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="summary-card">
              <el-statistic title="农具总数" :value="toolCount" value-style="font-size: 24px; color: #E6A23C;">
                <template #prefix>
                  <el-icon class="summary-icon"><Tools /></el-icon>
                </template>
                <template #suffix>
                  <span class="summary-suffix">件</span>
                </template>
              </el-statistic>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="summary-card">
              <el-statistic title="待成熟葡萄品种" :value="maturingCropCount" value-style="font-size: 24px; color: #8B0000;">
                <template #prefix>
                  <el-icon class="summary-icon"><Grape /></el-icon>
                </template>
                <template #suffix>
                  <span class="summary-suffix">种</span>
                </template>
              </el-statistic>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="charts-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-card">
              <div class="chart-header">
                <h3>农具保养时刻表</h3>
                <div class="chart-actions">
                  <el-select v-model="toolQueryParams.status" size="small" @change="initToolsMaintenanceChart">
                    <el-option label="全部" :value="null" />
                    <el-option label="使用中" :value="1" />
                    <el-option label="维修中" :value="2" />
                    <el-option label="闲置" :value="0" />
                  </el-select>
                </div>
              </div>
              <div id="toolsMaintenanceChart" class="chart"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-card">
              <div class="chart-header">
                <h3>葡萄成熟时间预测</h3>
                <div class="chart-actions">
                  <el-switch 
                    v-model="showAllCrops" 
                    active-text="所有品种" 
                    inactive-text="仅生长中" 
                    @change="initCropMaturityChart"
                  />
                </div>
              </div>
              <div id="cropMaturityChart" class="chart"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Grape, Back, Tools } from '@element-plus/icons-vue';
import axios from 'axios';
import * as echarts from 'echarts';

const router = useRouter();
const userInfo = ref({ username: '' });
const currentYear = ref(new Date().getFullYear());
const yearOptions = ref([]);
const showAllCrops = ref(false);
const charts = {
  toolsMaintenance: null,
  cropMaturity: null
};

// 添加获取token的辅助函数
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 农具查询参数
const toolQueryParams = reactive({
  status: null
});

// 数据统计
const cropsData = ref([]);
const toolsData = ref([]);
const cropsList = ref([]);

const toolCount = computed(() => {
  return toolsData.value.length;
});

const maturingCropCount = computed(() => {
  // 获取当前时间
  const now = new Date();
  // 统一的种植日期：3月15日
  const plantingDate = new Date(currentYear.value, 2, 15);
  
  // 统计所有未成熟的葡萄品种
  return cropsList.value.filter(crop => {
    if (!crop.growthCycle) return false;
    
    // 计算预计成熟日期
    const maturityDate = new Date(plantingDate);
    maturityDate.setDate(plantingDate.getDate() + crop.growthCycle);
    
    // 如果还未成熟，则计入数量
    return maturityDate > now;
  }).length;
});

// 初始化年份选项
const initYearOptions = () => {
  const currentYearValue = new Date().getFullYear();
  yearOptions.value = Array.from({ length: 5 }, (_, i) => currentYearValue - i);
};

// 获取用户信息
const getUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
};

// 获取所有农具数据
const getToolsData = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/tools/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data && response.data.code === 200) {
      toolsData.value = response.data.data || [];
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('获取农具数据失败:', error);
    ElMessage.error('获取农具数据失败');
    return [];
  }
};

// 获取所有作物基础信息
const getCropsData = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/crop/page', {
      params: {
        pageNum: 1,
        pageSize: 100,
        cropType: '葡萄',
        status: 1
      },
      headers: {
        'Authorization': token
      }
    });
    
    if (response.data && response.data.success) {
      cropsList.value = response.data.data.list || [];
      return response.data.data.list || [];
    }
    return [];
  } catch (error) {
    console.error('获取作物数据失败:', error);
    return [];
  }
};

// 计算农具下次保养时间
const calculateNextMaintenance = (tool) => {
  if (!tool.lastMaintenanceTime) {
    // 如果没有上次保养时间，假设是购买日期后一个月
    return tool.purchaseDate ? new Date(new Date(tool.purchaseDate).getTime() + 30 * 24 * 60 * 60 * 1000) : new Date();
  }
  
  const maintenanceCycle = tool.maintenanceCycle || 90; // 默认90天保养一次
  const lastMaintenance = new Date(tool.lastMaintenanceTime);
  return new Date(lastMaintenance.getTime() + maintenanceCycle * 24 * 60 * 60 * 1000);
};

// 格式化日期为 MM-DD 格式
const formatDateToMMDD = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
};

// 初始化农具保养时刻表
const initToolsMaintenanceChart = async () => {
  const tools = toolsData.value.filter(tool => 
    toolQueryParams.status === null || tool.status === toolQueryParams.status
  );
  
  // 计算接下来90天内需要保养的农具
  const today = new Date();
  const ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(today.getDate() + 90);
  
  const maintenanceData = tools.map(tool => {
    // 如果有nextMaintenanceDate字段，直接使用
    let nextMaintenance;
    if (tool.nextMaintenanceDate) {
      nextMaintenance = new Date(tool.nextMaintenanceDate);
    } else if (tool.lastMaintenanceDate && tool.maintenanceCycle) {
      // 否则根据最后保养日期和保养周期计算
      const lastMaintenance = new Date(tool.lastMaintenanceDate);
      nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setDate(lastMaintenance.getDate() + tool.maintenanceCycle);
    } else {
      // 如果没有保养记录，默认从购买日期起90天
      nextMaintenance = tool.purchaseDate 
        ? new Date(new Date(tool.purchaseDate).getTime() + 90 * 24 * 60 * 60 * 1000) 
        : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      id: tool.id,
      name: tool.toolName,
      type: tool.toolType,
      brand: tool.brand,
      model: tool.model,
      location: tool.location,
      lastMaintenance: tool.lastMaintenanceDate ? new Date(tool.lastMaintenanceDate) : null,
      nextMaintenance,
      maintenanceCycle: tool.maintenanceCycle || 90,
      daysLeft: Math.ceil((nextMaintenance - today) / (24 * 60 * 60 * 1000)),
      status: tool.status
    };
  }).filter(item => item.nextMaintenance <= ninetyDaysLater)
    .sort((a, b) => a.daysLeft - b.daysLeft); // 按剩余天数升序排序
  
  const chart = echarts.init(document.getElementById('toolsMaintenanceChart'));
  charts.toolsMaintenance = chart;
  
  const statusColors = {
    0: '#909399', // 闲置 - 灰色
    1: '#67C23A', // 使用中 - 绿色
    2: '#E6A23C'  // 维修中 - 黄色
  };
  
  const option = {
    title: {
      text: '农具保养计划表',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params[0];
        const toolData = maintenanceData[data.dataIndex];
        return `
          <div style="font-weight:bold;margin-bottom:5px;">${toolData.name} (${toolData.model})</div>
          <div>类型: ${toolData.type} / 品牌: ${toolData.brand}</div>
          <div>存放位置: ${toolData.location}</div>
          <div>上次保养: ${toolData.lastMaintenance ? toolData.lastMaintenance.toLocaleDateString() : '无记录'}</div>
          <div>下次保养: ${toolData.nextMaintenance.toLocaleDateString()}</div>
          <div>保养周期: ${toolData.maintenanceCycle}天</div>
          <div>剩余天数: ${toolData.daysLeft}天</div>
          <div>状态: ${toolData.status === 0 ? '闲置' : toolData.status === 1 ? '使用中' : '维修中'}</div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '剩余天数',
      axisLabel: {
        formatter: '{value} 天'
      },
      max: function(value) {
        // 让坐标轴最大值略大于数据最大值，视觉效果更好
        return Math.max(30, Math.ceil(value.max * 1.1));
      }
    },
    yAxis: {
      type: 'category',
      data: maintenanceData.map(item => item.name),
      axisLabel: {
        interval: 0,
        width: 100,
        overflow: 'truncate',
        formatter: function(value) {
          const tool = maintenanceData.find(item => item.name === value);
          return `{tool|${value}} {cycle|(${tool.maintenanceCycle}天)}`;
        },
        rich: {
          tool: {
            color: '#303133',
            lineHeight: 20
          },
          cycle: {
            color: '#909399',
            fontSize: 12,
            lineHeight: 20,
            padding: [0, 0, 0, 5]
          }
        }
      }
    },
    series: [
      {
        name: '剩余保养天数',
        type: 'bar',
        data: maintenanceData.map((item, index) => ({
          value: item.daysLeft,
          itemStyle: {
            color: item.daysLeft <= 7 ? '#F56C6C' : // 红色 - 紧急（7天内）
                   item.daysLeft <= 15 ? '#E6A23C' : // 黄色 - 注意（15天内）
                   item.daysLeft <= 30 ? '#409EFF' : // 蓝色 - 计划（30天内）
                   statusColors[item.status] || '#909399' // 默认使用状态颜色
          }
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 天'
        }
      }
    ]
  };
  
  chart.setOption(option);
};

// 初始化葡萄成熟时间预测图表
const initCropMaturityChart = async () => {
  // 固定3月15日为种植起始日期
  const plantingStartDate = new Date(currentYear.value, 2, 15); // 3月15日
  
  // 为每个作物计算成熟日期（固定从3月15日开始计算）
  const maturityData = cropsList.value.map(crop => {
    // 统一使用当年3月15日作为种植日期
    const plantDate = new Date(plantingStartDate);
    const maturityDate = new Date(plantDate);
    maturityDate.setDate(plantDate.getDate() + (crop.growthCycle || 0));
    
    // 计算与今天的天数差
    const today = new Date();
    const daysToMaturity = Math.ceil((maturityDate - today) / (24 * 60 * 60 * 1000));
    
    return {
      id: crop.id,
      cropName: crop.cropName,
      variety: crop.variety,
      plantDate,
      maturityDate,
      growthCycle: crop.growthCycle,
      daysToMaturity,
      color: crop.color || '#8B0000'
    };
  }).sort((a, b) => a.growthCycle - b.growthCycle); // 按生长周期从短到长排序
  
  const chart = echarts.init(document.getElementById('cropMaturityChart'));
  charts.cropMaturity = chart;
  
  // 生成时间轴数据
  const timelineData = [];
  const startDate = new Date(currentYear.value, 2, 15); // 3月15日
  const endDate = new Date(currentYear.value, 11, 31); // 12月31日
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (currentDate.getDate() === 1 || currentDate.getDate() === 15) {
      timelineData.push({
        value: new Date(currentDate),
        text: formatDateToMMDD(currentDate)
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const option = {
    title: {
      text: '葡萄品种成熟时间表 (基于3月15日种植)',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const data = params.data;
        return `
          <div style="font-weight:bold;margin-bottom:5px;">${data.cropName} (${data.variety})</div>
          <div>生长周期: ${data.growthCycle}天</div>
          <div>种植日期: ${data.plantDate.toLocaleDateString()} (3月15日)</div>
          <div>预计成熟日期: ${data.maturityDate.toLocaleDateString()}</div>
          <div>距离成熟: ${data.daysToMaturity > 0 ? data.daysToMaturity + '天' : '已成熟'}</div>
        `;
      }
    },
    color: ['#91cc75'],
    legend: {
      data: ['成熟日期'],
      show: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      name: '日期',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{MM}-{dd}',
        rotate: 45
      },
      min: startDate.getTime(),
      max: endDate.getTime(),
      axisPointer: {
        snap: true,
        lineStyle: {
          color: '#7581BD',
          width: 1
        },
        label: {
          show: true,
          formatter: function (params) {
            return echarts.format.formatTime('MM-dd', params.value);
          },
          backgroundColor: '#7581BD'
        },
        handle: {
          show: true,
          color: '#7581BD'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: maturityData.map(item => item.cropName),
      axisLabel: {
        interval: 0,
        width: 120,
        overflow: 'truncate',
        formatter: function(value) {
          const crop = maturityData.find(item => item.cropName === value);
          return `{crop|${value}} {days|${crop.growthCycle}天}`;
        },
        rich: {
          crop: {
            color: '#303133',
            lineHeight: 20
          },
          days: {
            color: '#909399',
            fontSize: 12,
            lineHeight: 20,
            padding: [0, 0, 0, 5]
          }
        }
      }
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        filterMode: 'empty'
      }
    ],
    series: [
      {
        name: '成熟日期',
        type: 'scatter',
        symbolSize: function(value, params) {
          // 为不同的葡萄品种设置不同的大小
          const crop = maturityData[params.dataIndex];
          return crop && crop.daysToMaturity < 0 ? 12 : 18; // 已成熟的葡萄点更小
        },
        data: maturityData.map((item, index) => ({
          name: item.cropName,
          value: [item.maturityDate, item.cropName],
          cropName: item.cropName,
          variety: item.variety,
          plantDate: item.plantDate,
          maturityDate: item.maturityDate,
          growthCycle: item.growthCycle,
          daysToMaturity: item.daysToMaturity,
          itemStyle: {
            color: item.color,
            opacity: item.daysToMaturity < 0 ? 0.6 : 1 // 已成熟的葡萄透明度降低
          }
        }))
      },
      {
        name: '今日',
        type: 'line',
        markLine: {
          symbol: ['none', 'none'],
          label: {
            formatter: '今日',
            position: 'insideStartTop'
          },
          lineStyle: {
            color: '#F56C6C',
            type: 'solid',
            width: 2
          },
          data: [
            {
              xAxis: new Date().getTime()
            }
          ]
        }
      },
      {
        name: '种植日期(3月15日)',
        type: 'line',
        markLine: {
          symbol: ['none', 'none'],
          label: {
            formatter: '种植日',
            position: 'insideStartTop'
          },
          lineStyle: {
            color: '#67C23A',
            type: 'solid',
            width: 2
          },
          data: [
            {
              xAxis: plantingStartDate.getTime()
            }
          ]
        }
      }
    ]
  };
  
  chart.setOption(option);
};

// 初始化所有图表
const initCharts = async () => {
  await Promise.all([
    getToolsData(),
    getCropsData()
  ]);
  
  await initToolsMaintenanceChart();
  await initCropMaturityChart();
};

// 处理年份变化
const handleYearChange = async () => {
  await initCharts();
};

// 返回仪表盘
const goBackToDashboard = () => {
  router.push('/dashboard');
};

// 退出登录
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/');
};

// 生命周期钩子
onMounted(() => {
  getUserInfo();
  initYearOptions();
  initCharts();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
      chart && chart.resize();
    });
  });
});

onUnmounted(() => {
  // 清理图表实例
  Object.values(charts).forEach(chart => {
    chart && chart.dispose();
  });
  
  // 移除事件监听
  window.removeEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
      chart && chart.resize();
    });
  });
});
</script>

<style scoped>
.visualization-container {
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

.content-wrapper {
  padding: 20px;
  flex: 1;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.data-summary {
  margin-bottom: 20px;
}

.summary-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-card:hover {
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 20px;
  margin-right: 4px;
}

.summary-suffix {
  font-size: 16px;
  color: #606266;
  margin-left: 4px;
}

.charts-container {
  margin-top: 20px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 500px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.chart-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart {
  height: 420px;
  width: 100%;
}
</style> 