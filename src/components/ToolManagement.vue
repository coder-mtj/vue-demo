<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, Back } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 用户信息
const username = computed(() => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo).username || '用户' : '用户';
  } catch (e) {
    console.error('解析用户信息失败:', e);
    return '用户';
  }
});

// 退出登录
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/');
};

// 农具列表数据
const toolsList = ref([]);
const loading = ref(false);
const total = ref(0);

// 工具类型选项
const toolTypeOptions = ref([
  '拖拉机', '播种机', '收割机', '喷雾器', '旋耕机', '犁', '耙', '其他'
]);

// 状态标签类型映射
const statusTagType = {
  0: 'danger',   // 报废
  1: 'success',  // 正常
  2: 'warning'   // 维修中
};

// 状态显示文字映射
const statusTextMap = {
  0: '报废',
  1: '正常',
  2: '维修中'
};

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  toolName: '',
  toolType: '',
  status: null
});

// 表单数据
const formData = reactive({
  id: null,
  toolCode: '',
  toolName: '',
  toolType: '',
  brand: '',
  model: '',
  purchaseDate: '',
  price: '',
  status: 1,
  location: '',
  maintenanceCycle: null,
  lastMaintenanceDate: '',
  nextMaintenanceDate: '',
  remark: ''
});

// 表单规则
const rules = {
  toolCode: [
    { required: true, message: '请输入工具编号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]{3,20}$/, message: '编号应为3-20位字母、数字或连字符', trigger: 'blur' }
  ],
  toolName: [
    { required: true, message: '请输入工具名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  toolType: [
    { required: true, message: '请选择工具类型', trigger: 'change' }
  ],
  purchaseDate: [
    { required: true, message: '请选择购买日期', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入购买价格', trigger: 'blur' },
    { pattern: /^[1-9]\d*(\.\d{1,2})?$/, message: '请输入有效的价格', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 对话框显示控制
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref('add'); // add, edit
const formRef = ref(null);

// 使用记录对话框
const usageDialogVisible = ref(false);
const currentToolId = ref(null);
const usageRecords = ref([]);
const usageLoading = ref(false);

// 初始化获取数据
onMounted(() => {
  getToolsList();
});

// 添加获取token的辅助函数
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 获取农具列表
const getToolsList = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/tools/page', { 
      params: queryParams,
      headers: {
        'Authorization': token
      }
    });
    if (response.data.code === 200) {
      // 处理返回数据
      if (response.data.data && response.data.data.list) {
        toolsList.value = response.data.data.list;
        total.value = response.data.data.total || 0;
      } else if (Array.isArray(response.data.data)) {
        toolsList.value = response.data.data;
        total.value = response.data.data.length;
      } else {
        toolsList.value = [];
        total.value = 0;
      }
    } else {
      ElMessage.error(response.data.message || '获取农具列表失败');
      toolsList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取农具列表失败:', error);
    ElMessage.error('获取农具列表失败，请检查网络或服务器状态');
    toolsList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 获取农具使用记录
const getToolUsageRecords = async (toolId) => {
  usageLoading.value = true;
  try {
    const token = getAuthToken();
    const response = await axios.get(`/api/toolusage/listByTool/${toolId}`, {
      headers: {
        'Authorization': token
      }
    });
    if (response.data.code === 200) {
      usageRecords.value = response.data.data || [];
    } else {
      ElMessage.error(response.data.message || '获取使用记录失败');
      usageRecords.value = [];
    }
  } catch (error) {
    console.error('获取使用记录失败:', error);
    ElMessage.error('获取使用记录失败，请检查网络或服务器状态');
    usageRecords.value = [];
  } finally {
    usageLoading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  // 打印查询参数，帮助调试
  console.log('查询参数:', queryParams);
  getToolsList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.toolName = '';
  queryParams.toolType = '';
  queryParams.status = null;
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  queryParams.pageNum = page;
  getToolsList();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getToolsList();
};

// 打开添加对话框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = '添加农具';
  dialogType.value = 'add';
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row) => {
  resetForm();
  dialogTitle.value = '编辑农具';
  dialogType.value = 'edit';
  
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    if (row[key] !== undefined) {
      formData[key] = row[key];
    }
  });
  
  dialogVisible.value = true;
};

// 打开使用记录对话框
const openUsageDialog = (toolId) => {
  currentToolId.value = toolId;
  getToolUsageRecords(toolId);
  usageDialogVisible.value = true;
};

// 重置表单数据
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  Object.keys(formData).forEach(key => {
    if (key === 'status') {
      formData[key] = 1;
    } else if (key === 'maintenanceCycle') {
      formData[key] = null;
    } else {
      formData[key] = '';
    }
  });
  
  formData.id = null;
};

// 将日期格式化为YYYY-MM-DD格式
const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  
  // 如果已经是字符串格式且不包含T，则可能已经是正确格式
  if (typeof date === 'string' && !date.includes('T')) {
    return date;
  }
  
  // 转换日期对象或ISO字符串为YYYY-MM-DD格式
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      // 无效日期，返回空字符串
      console.error('无效的日期格式', date);
      return '';
    }
    
    // 尝试使用标准格式，也是最可能被后端接受的格式
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 创建表单数据的副本，以便我们可以格式化日期而不影响原始表单
        const formDataToSubmit = { ...formData };
        
        // 格式化日期字段，确保符合后端期望的格式 (YYYY-MM-DD)
        // 对于添加操作，先尝试将日期转换为服务器接受的格式
        // 如果日期字段存在，则转换，否则设置为null（这样后端可能会使用默认值）
        formDataToSubmit.purchaseDate = formDataToSubmit.purchaseDate ? formatDateToYYYYMMDD(formDataToSubmit.purchaseDate) : null;
        formDataToSubmit.lastMaintenanceDate = formDataToSubmit.lastMaintenanceDate ? formatDateToYYYYMMDD(formDataToSubmit.lastMaintenanceDate) : null;
        formDataToSubmit.nextMaintenanceDate = formDataToSubmit.nextMaintenanceDate ? formatDateToYYYYMMDD(formDataToSubmit.nextMaintenanceDate) : null;
        
        // 打印将要提交的数据，用于调试
        console.log('提交的数据:', formDataToSubmit);
        
        const token = getAuthToken();
        const headers = {
          'Authorization': token
        };
        
        let response;
        if (dialogType.value === 'add') {
          response = await axios.post('/api/tools/add', formDataToSubmit, { headers });
        } else {
          response = await axios.put('/api/tools/update', formDataToSubmit, { headers });
        }
        
        if (response.data.code === 200) {
          ElMessage.success(response.data.message || (dialogType.value === 'add' ? '添加成功' : '更新成功'));
          dialogVisible.value = false;
          getToolsList();
        } else {
          ElMessage.error(response.data.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加农具失败:' : '更新农具失败:', error);
        
        let errorMsg = dialogType.value === 'add' ? '添加农具失败' : '更新农具失败';
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
            } else if (dialogType.value === 'add') {
              errorMsg = '工具编号已存在';
            } else {
              errorMsg = '农具不存在，或工具编号已被使用';
            }
          } else if (status === 500) {
            errorMsg = dialogType.value === 'add' ? '添加失败，服务器内部错误' : '更新失败，服务器内部错误';
          }
        }
        
        ElMessage.error(errorMsg);
      }
    }
  });
};

// 更新农具状态
const updateToolStatus = async (id, status) => {
  try {
    const token = getAuthToken();
    // 使用查询参数而不是请求体
    const response = await axios.put(`/api/tools/updateStatus?id=${id}&status=${status}`, {}, {
      headers: {
        'Authorization': token
      }
    });
    if (response.data.code === 200) {
      ElMessage.success('状态更新成功');
      getToolsList();
    } else {
      ElMessage.error(response.data.message || '状态更新失败');
    }
  } catch (error) {
    console.error('更新农具状态失败:', error);
    ElMessage.error('更新农具状态失败，请检查网络或服务器状态');
  }
};

// 格式化状态显示
const formatStatus = (row) => {
  return statusTextMap[row.status] || '未知';
};

// 返回Dashboard
const goBackToDashboard = () => {
  router.push('/dashboard');
};

// 更新维护日期
const updateMaintenanceDate = (value) => {
  if (value && formData.maintenanceCycle) {
    // 计算下次维护日期
    const lastDate = new Date(value);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + formData.maintenanceCycle);
    // 使用格式化函数处理日期，确保日期格式正确
    formData.nextMaintenanceDate = formatDateToYYYYMMDD(nextDate);
  }
};

// 根据状态获取标签类型
const getStatusTagType = (status) => {
  return statusTagType[status] || 'info';
};

// 格式化使用状态
const formatUsageStatus = (status) => {
  return status === 1 ? '正常' : '异常';
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const dateTime = new Date(dateTimeStr);
  return dateTime.toLocaleString();
};
</script>

<template>
  <div class="tool-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo-container">
        <el-icon class="logo-icon"><Grape /></el-icon>
        <h1 class="logo-text">天道葡萄园中控</h1>
      </div>
      <div class="user-info">
        <el-dropdown trigger="click">
          <span class="user-dropdown-link">
            {{ username }}
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
    
    <!-- 头部 -->
    <div class="content-wrapper">
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">农具管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" @click="openAddDialog" icon="Plus">添加农具</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="农具名称">
            <el-input v-model="queryParams.toolName" placeholder="请输入农具名称" clearable />
          </el-form-item>
          <el-form-item label="工具类型">
            <el-select v-model="queryParams.toolType" placeholder="请选择类型" clearable>
              <el-option label="全部类型" :value="null" />
              <el-option 
                v-for="type in toolTypeOptions" 
                :key="type" 
                :label="type" 
                :value="type" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="全部状态" :value="null" />
              <el-option label="正常" :value="1" />
              <el-option label="维修中" :value="2" />
              <el-option label="报废" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
            <el-button @click="resetSearch" icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 农具列表 -->
      <el-card class="list-card">
        <el-table 
          :data="toolsList" 
          style="width: 100%" 
          border 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="toolCode" label="工具编号" min-width="120" />
          <el-table-column prop="toolName" label="工具名称" min-width="160" />
          <el-table-column prop="toolType" label="工具类型" min-width="120" />
          <el-table-column prop="brand" label="品牌" min-width="120" />
          <el-table-column prop="location" label="存放位置" min-width="140" />
          <el-table-column prop="nextMaintenanceDate" label="下次维护日期" min-width="120" />
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ formatStatus(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="250">
            <template #default="scope">
              <el-button 
                type="primary" 
                link 
                @click="openEditDialog(scope.row)" 
                icon="Edit"
              >
                编辑
              </el-button>
              <el-button 
                type="success" 
                link 
                @click="updateToolStatus(scope.row.id, 1)" 
                :disabled="scope.row.status === 1"
                icon="Check"
              >
                标记正常
              </el-button>
              <el-button 
                type="warning" 
                link 
                @click="updateToolStatus(scope.row.id, 2)" 
                :disabled="scope.row.status === 2"
                icon="Warning"
              >
                标记维修
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="updateToolStatus(scope.row.id, 0)" 
                :disabled="scope.row.status === 0"
                icon="Delete"
              >
                标记报废
              </el-button>
              <el-button 
                type="info" 
                link 
                @click="openUsageDialog(scope.row.id)"
                icon="List"
              >
                使用记录
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :pager-count="Math.min(7, Math.ceil(total / queryParams.pageSize))"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            :hide-on-single-page="total <= queryParams.pageSize"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 添加/编辑农具对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工具编号" prop="toolCode">
              <el-input v-model="formData.toolCode" placeholder="请输入工具编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工具名称" prop="toolName">
              <el-input v-model="formData.toolName" placeholder="请输入工具名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工具类型" prop="toolType">
              <el-select v-model="formData.toolType" placeholder="请选择工具类型" style="width: 100%;">
                <el-option 
                  v-for="type in toolTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="formData.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="formData.model" placeholder="请输入型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买日期" prop="purchaseDate">
              <el-date-picker 
                v-model="formData.purchaseDate" 
                type="date" 
                placeholder="请选择购买日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买价格" prop="price">
              <el-input-number 
                v-model="formData.price" 
                :precision="2" 
                :step="100" 
                :min="0"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="formData.location" placeholder="请输入存放位置" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护周期(天)" prop="maintenanceCycle">
              <el-input-number 
                v-model="formData.maintenanceCycle" 
                :min="0" 
                :max="999"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上次维护日期" prop="lastMaintenanceDate">
              <el-date-picker 
                v-model="formData.lastMaintenanceDate" 
                type="date" 
                placeholder="请选择上次维护日期"
                style="width: 100%;"
                @change="updateMaintenanceDate"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下次维护日期" prop="nextMaintenanceDate">
              <el-date-picker 
                v-model="formData.nextMaintenanceDate" 
                type="date" 
                placeholder="下次维护日期"
                style="width: 100%;"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="2">维修中</el-radio>
                <el-radio :label="0">报废</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 使用记录对话框 -->
    <el-dialog
      v-model="usageDialogVisible"
      title="农具使用记录"
      width="800px"
    >
      <el-table
        :data="usageRecords"
        style="width: 100%"
        border
        v-loading="usageLoading"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="使用人" min-width="100">
          <template #default="scope">
            {{ scope.row.employee ? scope.row.employee.name : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="usageDate" label="使用日期" min-width="120" />
        <el-table-column label="开始时间" min-width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="usagePurpose" label="使用目的" min-width="150" />
        <el-table-column prop="usageArea" label="使用区域" min-width="120" />
        <el-table-column prop="usageHours" label="使用时长(小时)" min-width="120" />
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ formatUsageStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="usageRecords.length === 0 && !usageLoading" class="no-data">
        暂无使用记录
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="usageDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tool-container {
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

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px 0;
  font-size: 14px;
}
</style> 