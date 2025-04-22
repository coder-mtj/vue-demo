<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Back, InfoFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 用户信息
const userInfo = ref({});
const employees = ref([]);
const tools = ref([]);
const fields = ref([]);

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 表单数据
const formData = reactive({
  toolId: null,
  employeeId: null,
  usageDate: new Date().toISOString().split('T')[0],
  startTime: new Date().toISOString().replace('Z', ''),
  endTime: null,
  usagePurpose: '',
  usageArea: [],
  usageHours: null,
  fuelConsumption: null,
  status: 1,
  remark: ''
});

// 添加正在使用中的农具列表
const usingTools = ref([]);

// 表单规则
const rules = {
  toolId: [{ required: true, message: '请选择农具', trigger: 'change' }],
  employeeId: [{ required: true, message: '请选择使用人', trigger: 'change' }],
  usageDate: [{ required: true, message: '请选择使用日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  usagePurpose: [{ required: true, message: '请输入使用目的', trigger: 'blur' }],
  usageArea: [{ required: true, message: '请选择使用区域', trigger: 'change' }]
};

// 表单引用
const formRef = ref(null);

// 已申请的使用记录
const usageRecords = ref([]);
const recordsLoading = ref(false);
const recordsTotal = ref(0);

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

// 添加获取token的辅助函数
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 初始化
onMounted(async () => {
  // 从localStorage获取用户信息
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
    }
  } catch (error) {
    console.error('解析用户信息失败:', error);
  }
  
  // 加载农具和职工数据
  await Promise.all([
    getToolsList(),
    getEmployeesList(),
    getUsingToolsList(),
    getFieldsList()
  ]);
});

// 获取正在使用中的农具列表
const getUsingToolsList = async () => {
  try {
    const token = getAuthToken();
    // 获取当前正在使用中的农具（可根据实际接口调整）
    const response = await axios.get('/api/toolusage/using', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data && response.data.code === 200 && response.data.data) {
      usingTools.value = response.data.data;
    } else {
      console.warn('获取使用中农具列表失败');
      usingTools.value = [];
    }
  } catch (error) {
    console.error('获取使用中农具列表错误:', error);
    usingTools.value = [];
  }
};

// 获取农具列表
const getToolsList = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/tools/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data && response.data.code === 200 && response.data.data) {
      // 只获取状态为正常的农具
      tools.value = response.data.data.filter(tool => tool.status === 1);
    } else {
      ElMessage.warning('获取农具列表失败');
    }
  } catch (error) {
    console.error('获取农具列表错误:', error);
    ElMessage.error('获取农具列表失败，请检查网络或服务器状态');
  } finally {
    loading.value = false;
  }
};

// 获取职工列表
const getEmployeesList = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/employee/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data && response.data.code === 200 && response.data.data) {
      employees.value = response.data.data;
    } else {
      ElMessage.warning('获取职工列表失败');
    }
  } catch (error) {
    console.error('获取职工列表错误:', error);
    ElMessage.error('获取职工列表失败，请检查网络或服务器状态');
  }
};

// 获取田块列表
const getFieldsList = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/field/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data && response.data.code === 200 && response.data.data) {
      fields.value = response.data.data;
    } else {
      ElMessage.warning('获取田块列表失败');
      fields.value = [];
    }
  } catch (error) {
    console.error('获取田块列表错误:', error);
    ElMessage.error('获取田块列表失败，请检查网络或服务器状态');
    fields.value = [];
  }
};

// 检查农具是否正在被使用
const checkToolAvailability = (toolId) => {
  if (!toolId) return true;
  
  // 判断该农具是否在使用中列表
  const isInUse = usingTools.value.some(item => item.toolId === toolId);
  
  if (isInUse) {
    // 找到正在使用的农具信息
    const usingInfo = usingTools.value.find(item => item.toolId === toolId);
    const toolName = tools.value.find(t => t.id === toolId)?.toolName || '该农具';
    let userName = '某用户';
    
    if (usingInfo && usingInfo.employee && usingInfo.employee.name) {
      userName = usingInfo.employee.name;
    }
    
    // 显示警告
    ElMessage.warning(`${toolName}正在被${userName}使用中，请选择其他农具或稍后再试`);
    return false;
  }
  
  return true;
};

// 监听工具选择变化
const handleToolChange = (toolId) => {
  if (toolId) {
    checkToolAvailability(toolId);
  }
};

// 根据多个ID获取田块名称和编号，返回逗号分隔的字符串
const getFieldNamesWithCode = (fieldIds) => {
  if (!fieldIds || !Array.isArray(fieldIds) || fieldIds.length === 0) {
    return '';
  }
  
  return fieldIds.map(id => {
    const field = fields.value.find(f => f.id === id);
    return field ? `${field.fieldName} (${field.fieldCode})` : '';
  }).filter(name => name !== '').join('，'); // 使用中文逗号分隔
};

// 提交申请
const submitApply = async () => {
  if (!formRef.value) return;
  
  // 先检查选择的农具是否可用
  if (!checkToolAvailability(formData.toolId)) {
    return;
  }
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      
      try {
        // 格式化日期时间
        const dataToSubmit = { ...formData };
        
        // 格式化使用日期
        if (dataToSubmit.usageDate) {
          dataToSubmit.usageDate = formatDate(dataToSubmit.usageDate);
        }
        
        // 格式化开始时间和结束时间
        if (dataToSubmit.startTime) {
          dataToSubmit.startTime = formatDateTime(dataToSubmit.startTime);
        }
        
        if (dataToSubmit.endTime) {
          dataToSubmit.endTime = formatDateTime(dataToSubmit.endTime);
        }
        
        // 获取田块ID数组和名称字符串
        const fieldIds = dataToSubmit.usageArea;
        const fieldNames = getFieldNamesWithCode(fieldIds);
        
        // 提交数据中包含田块ID数组和田块名称字符串
        dataToSubmit.usageAreaIds = fieldIds.join(','); // ID以逗号分隔
        dataToSubmit.usageArea = fieldNames; // 名称以中文逗号分隔的字符串
        
        // 打印提交数据
        console.log('提交数据:', dataToSubmit);
        
        const token = getAuthToken();
        const response = await axios.post('/api/toolusage/add', dataToSubmit, {
          headers: {
            'Authorization': token
          }
        });
        
        if (response.data && response.data.code === 200) {
          ElMessage.success('申请提交成功');
          // 重置表单
          resetForm();
          // 刷新使用中工具列表
          getUsingToolsList();
        } else {
          ElMessage.error(response.data.message || '申请提交失败');
        }
      } catch (error) {
        console.error('提交申请错误:', error);
        let errorMsg = '申请提交失败';
        
        if (error.response) {
          if (error.response.status === 400) {
            errorMsg = error.response.data?.message || '提交的数据有误';
          } else if (error.response.status === 500) {
            errorMsg = '服务器内部错误';
          }
        }
        
        ElMessage.error(errorMsg);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 重置为默认值
  formData.toolId = null;
  formData.employeeId = null;
  formData.usageDate = new Date().toISOString().split('T')[0];
  formData.startTime = new Date().toISOString().replace('Z', '');
  formData.endTime = null;
  formData.usagePurpose = '';
  formData.usageArea = []; // 重置为空数组
  formData.usageHours = null;
  formData.fuelConsumption = null;
  formData.status = 1;
  formData.remark = '';
};

// 返回Dashboard
const goBackToDashboard = () => {
  router.push('/dashboard');
};

// 格式化日期 (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
};

// 格式化日期时间 (YYYY-MM-DD HH:MM:SS)
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  try {
    const dateObj = new Date(dateTime);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期时间格式化错误:', error);
    return '';
  }
};

// 计算开始和结束时间的差异(小时)
const calculateHours = () => {
  if (formData.startTime && formData.endTime) {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      // 计算差异（毫秒转小时，并保留一位小数）
      const diff = (end - start) / (1000 * 60 * 60);
      formData.usageHours = parseFloat(diff.toFixed(1));
    }
  }
};

// 格式化状态文本
const formatStatusText = (status) => {
  return status === 1 ? '正常' : '异常';
};

// 根据ID获取农具名称
const getToolName = (toolId) => {
  const tool = tools.value.find(t => t.id === toolId);
  return tool ? tool.toolName : '';
};

// 根据ID获取职工名称
const getEmployeeName = (employeeId) => {
  const employee = employees.value.find(e => e.id === employeeId);
  return employee ? employee.name : '';
};

// 根据ID获取田块名称
const getFieldName = (fieldId) => {
  const field = fields.value.find(f => f.id === fieldId);
  return field ? field.fieldName : '';
};

// 获取田块状态文本
const getFieldStatusText = (status) => {
  switch (status) {
    case 0: return '闲置';
    case 1: return '使用中';
    case 2: return '休耕';
    default: return '未知';
  }
};

// 获取田块状态标签类型
const getFieldStatusType = (status) => {
  switch (status) {
    case 0: return 'success';  // 闲置-绿色
    case 1: return 'warning';  // 使用中-黄色
    case 2: return 'info';     // 休耕-灰色
    default: return 'default';
  }
};
</script>

<template>
  <div class="tool-usage-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo-container">
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
              <el-dropdown-item @click="goBackToDashboard">返回主页</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">农具申请使用</h2>
        </div>
      </div>

      <!-- 申请表单区域 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>填写申请信息</span>
          </div>
        </template>
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          label-position="right"
          v-loading="loading"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="选择农具" prop="toolId">
                <el-select v-model="formData.toolId" placeholder="请选择农具" style="width: 100%;" @change="handleToolChange">
                  <el-option
                    v-for="tool in tools"
                    :key="tool.id"
                    :label="`${tool.toolName} (${tool.toolCode})`"
                    :value="tool.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用人" prop="employeeId">
                <el-select v-model="formData.employeeId" placeholder="请选择使用人" style="width: 100%;">
                  <el-option
                    v-for="employee in employees"
                    :key="employee.id"
                    :label="employee.name"
                    :value="employee.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="使用日期" prop="usageDate">
                <el-date-picker
                  v-model="formData.usageDate"
                  type="date"
                  placeholder="请选择使用日期"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  style="width: 100%;"
                  @change="calculateHours"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  style="width: 100%;"
                  @change="calculateHours"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用时长(小时)" prop="usageHours">
                <el-input-number
                  v-model="formData.usageHours"
                  :min="0"
                  :precision="1"
                  :step="0.5"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="使用目的" prop="usagePurpose">
                <el-input v-model="formData.usagePurpose" placeholder="请输入使用目的" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用区域" prop="usageArea">
                <el-select 
                  v-model="formData.usageArea" 
                  placeholder="请选择使用区域(可多选)" 
                  style="width: 100%;" 
                  multiple 
                  collapse-tags 
                  collapse-tags-tooltip
                >
                  <template #prefix>
                    <el-tooltip content="可以选择多个田块作为使用区域" placement="top">
                      <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                  </template>
                  <el-option
                    v-for="field in fields"
                    :key="field.id"
                    :label="`${field.fieldName} (${field.fieldCode})`"
                    :value="field.id"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span>{{ field.fieldName }} ({{ field.fieldCode }})</span>
                      <el-tag size="small" :type="getFieldStatusType(field.status)">
                        {{ getFieldStatusText(field.status) }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="燃油消耗(升)" prop="fuelConsumption">
                <el-input-number
                  v-model="formData.fuelConsumption"
                  :min="0"
                  :precision="1"
                  :step="0.5"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formData.status">
                  <el-radio :label="1">正常</el-radio>
                  <el-radio :label="0">异常</el-radio>
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

          <el-form-item>
            <el-button type="primary" @click="submitApply" :loading="submitting">提交申请</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.tool-usage-container {
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

.form-card {
  max-width: 1000px;
  margin: 0 auto 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.records-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style> 