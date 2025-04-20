<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, Back, Plus, Delete, Edit, Warning, Search, Refresh, MapLocation } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// 路由
const router = useRouter();

// 用户信息
const userInfo = ref({
  username: ''
});

// 数据加载与分页
const loading = ref(false);
const fieldsList = ref([]);
const total = ref(0);

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  fieldName: '',
  soilType: '',
  status: null
});

// 表单数据
const formData = reactive({
  id: null,
  fieldCode: '',
  fieldName: '',
  area: null,
  soilType: '',
  irrigationType: '',
  locationX: null,
  locationY: null,
  positionData: '',
  status: 0, // 默认闲置
  remark: ''
});

// 表单规则
const rules = {
  fieldCode: [
    { required: true, message: '请输入田块编号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]{3,20}$/, message: '编号应为3-20位字母、数字或连字符', trigger: 'blur' }
  ],
  fieldName: [
    { required: true, message: '请输入田块名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 对话框控制
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref('add'); // add, edit
const formRef = ref(null);

// 作物关系对话框控制
const cropDialogVisible = ref(false);
const cropDialogTitle = ref('');
const currentFieldName = ref('');
const fieldCropsList = ref([]);
const fieldCropsLoading = ref(false);
const cropFormDialogVisible = ref(false);
const cropFormRef = ref(null);

// 作物关系查询参数
const cropQueryParams = reactive({
  plantingYear: new Date().getFullYear(), // 默认当前年份
  status: null
});

// 作物列表
const cropsList = ref([]);

// 土壤类型选项
const soilTypeOptions = ['沙质土壤', '粘土', '壤土', '砂质壤土', '粘质壤土'];

// 架式选项
const frameTypeOptions = ['篱架', '棚架', '立柱', '水平架', '其他'];

// 灌溉方式选项
const irrigationTypeOptions = ['滴灌', '喷灌', '渠道灌溉', '漫灌', '无灌溉'];

// 施肥方式选项
const fertilizationTypeOptions = ['有机肥', '化肥', '复合肥', '生物肥', '其他'];

// 状态选项
const statusOptions = [
  { value: 0, label: '闲置' },
  { value: 1, label: '使用中' },
  { value: 2, label: '休耕' }
];

// 状态样式映射
const statusTagType = {
  0: 'info',
  1: 'success',
  2: 'warning'
};

// 状态显示文字映射
const statusTextMap = {
  0: '闲置',
  1: '使用中',
  2: '休耕'
};

// 作物关系表单数据
const cropFormData = reactive({
  id: null,
  fieldId: null,
  cropId: null,
  plantingYear: new Date().getFullYear(),
  plantMonth: new Date().getMonth() + 1,
  plantArea: null,
  areaData: '',
  plantCount: null,
  estimatedYield: null,
  frameType: '',
  irrigationType: '',
  fertilizationType: '',
  estimatedIncome: null,
  actualIncome: null,
  status: 1,
  remark: ''
});

// 作物关系表单规则
const cropFormRules = {
  cropId: [
    { required: true, message: '请选择作物', trigger: 'change' }
  ],
  plantArea: [
    { required: true, message: '请输入种植面积', trigger: 'blur' }
  ],
  plantCount: [
    { required: true, message: '请输入种植数量', trigger: 'blur' }
  ]
};

// 初始化
onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  // 获取田块列表
  getFieldsList();
  getCropsList();
});

// 获取田块列表
const getFieldsList = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/field/page', { params: queryParams });
    if (response.data && response.data.success) {
      const data = response.data.data;
      fieldsList.value = data.list || [];
      total.value = data.total || 0;
    } else {
      ElMessage.error(response.data?.message || '获取田块列表失败');
      fieldsList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取田块列表失败:', error);
    ElMessage.error('获取田块列表失败，请检查网络或服务器状态');
    fieldsList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  getFieldsList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.fieldName = '';
  queryParams.soilType = '';
  queryParams.status = null;
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  queryParams.pageNum = page;
  getFieldsList();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getFieldsList();
};

// 打开添加对话框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = '添加田块信息';
  dialogType.value = 'add';
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = async (row) => {
  resetForm();
  dialogTitle.value = '编辑田块信息';
  dialogType.value = 'edit';
  
  try {
    // 获取完整田块信息
    const response = await axios.get(`/api/field/get/${row.id}`);
    if (response.data && response.data.success && response.data.data) {
      // 填充表单数据
      Object.keys(formData).forEach(key => {
        if (response.data.data[key] !== undefined) {
          formData[key] = response.data.data[key];
        }
      });
      
      dialogVisible.value = true;
    } else {
      ElMessage.error(response.data?.message || '获取田块详情失败');
    }
  } catch (error) {
    console.error('获取田块详情失败:', error);
    ElMessage.error('获取田块详情失败，请检查网络或服务器状态');
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  Object.keys(formData).forEach(key => {
    if (key === 'id') {
      formData[key] = null;
    } else if (key === 'status') {
      formData[key] = 0; // 默认闲置
    } else if (['area', 'locationX', 'locationY'].includes(key)) {
      formData[key] = null;
    } else {
      formData[key] = '';
    }
  });
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (dialogType.value === 'add') {
          response = await axios.post('/api/field/add', formData);
        } else {
          response = await axios.put('/api/field/update', formData);
        }
        
        if (response.data && response.data.success) {
          ElMessage.success(response.data.message || (dialogType.value === 'add' ? '添加成功' : '更新成功'));
          dialogVisible.value = false;
          getFieldsList();
        } else {
          ElMessage.error(response.data?.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加田块失败:' : '更新田块失败:', error);
        
        let errorMsg = dialogType.value === 'add' ? '添加田块失败' : '更新田块失败';
        if (error.response) {
          if (error.response.status === 400) {
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
            } else if (dialogType.value === 'add') {
              errorMsg = '田块编号已存在';
            } else {
              errorMsg = '田块不存在，或田块编号已被使用';
            }
          } else if (error.response.status === 500) {
            errorMsg = dialogType.value === 'add' ? '添加失败，服务器内部错误' : '更新失败，服务器内部错误';
          }
        }
        
        ElMessage.error(errorMsg);
      }
    }
  });
};

// 删除田块
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除田块【${row.fieldName}】吗？此操作不可逆！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`/api/field/delete/${row.id}`);
      if (response.data && response.data.success) {
        ElMessage.success(response.data.message || '删除成功');
        getFieldsList();
      } else {
        ElMessage.error(response.data?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除田块失败:', error);
      
      let errorMsg = '删除田块失败';
      if (error.response) {
        if (error.response.status === 400) {
          errorMsg = error.response.data?.message || '田块不存在或正在使用中';
        } else if (error.response.status === 500) {
          errorMsg = '删除失败，服务器内部错误';
        }
      }
      
      ElMessage.error(errorMsg);
    }
  }).catch(() => {
    // 取消删除
  });
};

// 更新田块状态
const updateFieldStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/field/updateStatus?id=${id}&status=${status}`);
    if (response.data && response.data.success) {
      ElMessage.success('状态更新成功');
      getFieldsList();
    } else {
      ElMessage.error(response.data?.message || '状态更新失败');
    }
  } catch (error) {
    console.error('更新田块状态失败:', error);
    ElMessage.error('更新田块状态失败，请检查网络或服务器状态');
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

// 退出登录
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/');
};

// 打开作物关系对话框
const openCropDialog = async (row) => {
  currentFieldName.value = row.fieldName;
  cropDialogTitle.value = `${row.fieldName} - 作物种植情况`;
  fieldCropsLoading.value = true;
  
  try {
    // 使用新的API查询当年作物关系
    const response = await axios.get('/api/fieldcrop/getByYearAndIds', { 
      params: {
        plantingYear: cropQueryParams.plantingYear,
        fieldId: row.id,
        status: cropQueryParams.status
      }
    });
    
    if (response.data && response.data.code === 200) {
      fieldCropsList.value = response.data.data || [];
    } else {
      ElMessage.error(response.data?.msg || '获取田块作物关系失败');
      fieldCropsList.value = [];
    }
  } catch (error) {
    console.error('获取田块作物关系失败:', error);
    ElMessage.error('获取田块作物关系失败，请检查网络或服务器状态');
    fieldCropsList.value = [];
  } finally {
    fieldCropsLoading.value = false;
  }
  
  cropDialogVisible.value = true;
};

// 作物关系年份变化
const handleCropYearChange = () => {
  // 重新加载作物关系列表
  const currentField = fieldsList.value.find(field => field.fieldName === currentFieldName.value);
  if (currentField) {
    openCropDialog(currentField);
  }
};

// 作物关系状态变化
const handleCropStatusChange = () => {
  // 重新加载作物关系列表
  const currentField = fieldsList.value.find(field => field.fieldName === currentFieldName.value);
  if (currentField) {
    openCropDialog(currentField);
  }
};

// 添加作物关系
const addFieldCrop = async (fieldId) => {
  cropFormData.fieldId = fieldId;
  // 重置其他字段...
  cropFormData.id = null;
  cropFormData.cropId = null;
  cropFormData.plantingYear = new Date().getFullYear();
  cropFormData.plantMonth = new Date().getMonth() + 1;
  cropFormData.plantArea = null;
  cropFormData.areaData = '';
  cropFormData.plantCount = null;
  cropFormData.estimatedYield = null;
  cropFormData.frameType = '';
  cropFormData.irrigationType = '';
  cropFormData.fertilizationType = '';
  cropFormData.estimatedIncome = null;
  cropFormData.actualIncome = null;
  cropFormData.status = 1;
  cropFormData.remark = '';
  
  cropFormDialogVisible.value = true;
};

// 提交作物关系表单
const submitCropForm = async () => {
  if (!cropFormRef.value) return;
  
  await cropFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (!cropFormData.id) {
          response = await axios.post('/api/fieldcrop/add', cropFormData);
        } else {
          response = await axios.put('/api/fieldcrop/update', cropFormData);
        }
        
        if (response.data && response.data.code === 200) {
          ElMessage.success(response.data.msg || (cropFormData.id ? '更新成功' : '添加成功'));
          cropFormDialogVisible.value = false;
          // 刷新作物列表
          openCropDialog({ id: cropFormData.fieldId, fieldName: currentFieldName.value });
        } else {
          ElMessage.error(response.data?.msg || (cropFormData.id ? '更新失败' : '添加失败'));
        }
      } catch (error) {
        console.error(cropFormData.id ? '更新作物关系失败:' : '添加作物关系失败:', error);
        ElMessage.error(cropFormData.id ? '更新作物关系失败' : '添加作物关系失败');
      }
    }
  });
};

// 获取作物列表
const getCropsList = async () => {
  try {
    const response = await axios.get('/api/crop/list');
    if (response.data && response.data.success) {
      cropsList.value = response.data.data || [];
    } else {
      ElMessage.error(response.data?.message || '获取作物列表失败');
      cropsList.value = [];
    }
  } catch (error) {
    console.error('获取作物列表失败:', error);
    ElMessage.error('获取作物列表失败，请检查网络或服务器状态');
    cropsList.value = [];
  }
};

// 删除作物关系
const handleDeleteCrop = (row) => {
  ElMessageBox.confirm(
    `确定要删除该作物关系记录吗？此操作不可逆！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`/api/fieldcrop/delete/${row.id}`);
      if (response.data && response.data.code === 200) {
        ElMessage.success(response.data.msg || '删除成功');
        // 刷新作物列表
        openCropDialog({ id: row.fieldId, fieldName: currentFieldName.value });
      } else {
        ElMessage.error(response.data?.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除作物关系失败:', error);
      ElMessage.error('删除作物关系失败，请检查网络或服务器状态');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 更新作物关系状态
const updateCropStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/fieldcrop/updateStatus?id=${id}&status=${status}`);
    if (response.data && response.data.code === 200) {
      ElMessage.success('状态更新成功');
      // 刷新作物列表
      const currentRow = fieldCropsList.value.find(item => item.id === id);
      if (currentRow) {
        openCropDialog({ id: currentRow.fieldId, fieldName: currentFieldName.value });
      }
    } else {
      ElMessage.error(response.data?.msg || '状态更新失败');
    }
  } catch (error) {
    console.error('更新作物关系状态失败:', error);
    ElMessage.error('更新作物关系状态失败，请检查网络或服务器状态');
  }
};
</script>

<template>
  <div class="field-container">
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
    
    <!-- 头部 -->
    <div class="content-wrapper">
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">田块管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">添加田块</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="田块名称">
            <el-input v-model="queryParams.fieldName" placeholder="请输入田块名称" clearable />
          </el-form-item>
          <el-form-item label="土壤类型">
            <el-select v-model="queryParams.soilType" placeholder="请选择土壤类型" clearable>
              <el-option v-for="type in soilTypeOptions" :key="type" :label="type" :value="type" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="全部状态" :value="null" />
              <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 田块列表 -->
      <el-card class="list-card">
        <el-table 
          :data="fieldsList" 
          style="width: 100%" 
          border 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="fieldCode" label="田块编号" min-width="120" />
          <el-table-column prop="fieldName" label="田块名称" min-width="150" />
          <el-table-column prop="area" label="面积(亩)" min-width="100" />
          <el-table-column prop="soilType" label="土壤类型" min-width="120" />
          <el-table-column prop="irrigationType" label="灌溉方式" min-width="120" />
          <el-table-column label="地理位置" min-width="140">
            <template #default="scope">
              <span v-if="scope.row.locationX && scope.row.locationY">
                {{ scope.row.locationX.toFixed(4) }}, {{ scope.row.locationY.toFixed(4) }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="statusTagType[scope.row.status]">
                {{ formatStatus(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="280">
            <template #default="scope">
              <el-button 
                type="primary" 
                link 
                @click="openEditDialog(scope.row)" 
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button 
                type="info" 
                link 
                @click="updateFieldStatus(scope.row.id, 0)" 
                :disabled="scope.row.status === 0"
              >
                闲置
              </el-button>
              <el-button 
                type="success" 
                link 
                @click="updateFieldStatus(scope.row.id, 1)" 
                :disabled="scope.row.status === 1"
              >
                使用中
              </el-button>
              <el-button 
                type="warning" 
                link 
                @click="updateFieldStatus(scope.row.id, 2)" 
                :disabled="scope.row.status === 2"
              >
                休耕
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDelete(scope.row)" 
                :icon="Delete"
              >
                删除
              </el-button>
              <el-button 
                type="primary" 
                link 
                @click="openCropDialog(scope.row)" 
                :icon="MapLocation"
              >
                作物关系
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
    
    <!-- 添加/编辑田块对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
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
            <el-form-item label="田块编号" prop="fieldCode">
              <el-input v-model="formData.fieldCode" placeholder="请输入田块编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="田块名称" prop="fieldName">
              <el-input v-model="formData.fieldName" placeholder="请输入田块名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="面积(亩)" prop="area">
              <el-input-number 
                v-model="formData.area" 
                :min="0.1" 
                :precision="1"
                :step="0.1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="土壤类型" prop="soilType">
              <el-select v-model="formData.soilType" placeholder="请选择土壤类型" style="width: 100%;">
                <el-option 
                  v-for="type in soilTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灌溉方式" prop="irrigationType">
              <el-select v-model="formData.irrigationType" placeholder="请选择灌溉方式" style="width: 100%;">
                <el-option 
                  v-for="type in irrigationTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
                <el-option 
                  v-for="option in statusOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="locationX">
              <el-input-number 
                v-model="formData.locationX" 
                :precision="6"
                :step="0.000001"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="locationY">
              <el-input-number 
                v-model="formData.locationY" 
                :precision="6"
                :step="0.000001"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="多边形坐标" prop="positionData">
          <el-input 
            v-model="formData.positionData"
            type="textarea"
            :rows="3"
            placeholder="请输入JSON格式的多边形坐标数据，如：[{&quot;x&quot;:116.3250,&quot;y&quot;:39.9875},{&quot;x&quot;:116.3253,&quot;y&quot;:39.9875}]"
          />
        </el-form-item>
        
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

    <!-- 作物关系对话框 -->
    <el-dialog
      v-model="cropDialogVisible"
      :title="cropDialogTitle"
      width="1200px"
      destroy-on-close
    >
      <el-card class="crop-card">
        <!-- 添加筛选条件 -->
        <div class="filter-container">
          <el-form :inline="true" :model="cropQueryParams">
            <el-form-item label="种植年份">
              <el-date-picker
                v-model="cropQueryParams.plantingYear"
                type="year"
                placeholder="选择年份"
                format="YYYY"
                value-format="YYYY"
                @change="handleCropYearChange"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select 
                v-model="cropQueryParams.status" 
                placeholder="选择状态" 
                clearable
                @change="handleCropStatusChange"
              >
                <el-option label="全部" :value="null" />
                <el-option label="生长中" :value="1" />
                <el-option label="已结束" :value="0" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        
        <el-table
          :data="fieldCropsList"
          style="width: 100%"
          v-loading="fieldCropsLoading"
        >
          <el-table-column prop="crop.cropName" label="作物名称" min-width="150" />
          <el-table-column prop="plantingYear" label="种植年份" min-width="120" />
          <el-table-column prop="plantMonth" label="种植月份" min-width="120" />
          <el-table-column prop="plantArea" label="种植面积(亩)" min-width="150">
            <template #default="scope">
              {{ scope.row.plantArea?.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="plantCount" label="种植数量(株)" min-width="150" />
          <el-table-column prop="estimatedYield" label="预计产量(kg)" min-width="150">
            <template #default="scope">
              {{ scope.row.estimatedYield?.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="frameType" label="架式" min-width="120" />
          <el-table-column prop="irrigationType" label="灌溉方式" min-width="150" />
          <el-table-column prop="fertilizationType" label="施肥方式" min-width="150" />
          <el-table-column prop="estimatedIncome" label="预计收入(元)" min-width="150">
            <template #default="scope">
              {{ scope.row.estimatedIncome?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="actualIncome" label="实际收入(元)" min-width="150">
            <template #default="scope">
              {{ scope.row.actualIncome?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '生长中' : '已结束' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="200">
            <template #default="scope">
              <el-button 
                type="primary" 
                link 
                @click="editFieldCrop(scope.row)" 
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDeleteCrop(scope.row)" 
                :icon="Delete"
              >
                删除
              </el-button>
              <el-button 
                v-if="scope.row.status === 1"
                type="warning" 
                link 
                @click="updateCropStatus(scope.row.id, 0)"
              >
                结束生长
              </el-button>
              <el-button 
                v-if="scope.row.status === 0"
                type="success" 
                link 
                @click="updateCropStatus(scope.row.id, 1)"
              >
                恢复生长
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cropDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 作物关系表单对话框 -->
    <el-dialog
      v-model="cropFormDialogVisible"
      :title="cropFormData.id ? '编辑作物关系' : '添加作物关系'"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="cropFormRef"
        :model="cropFormData"
        :rules="cropFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作物" prop="cropId">
              <el-select v-model="cropFormData.cropId" placeholder="请选择作物" style="width: 100%;">
                <el-option 
                  v-for="crop in cropsList" 
                  :key="crop.id" 
                  :label="crop.cropName" 
                  :value="crop.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="种植年份" prop="plantingYear">
              <el-input-number 
                v-model="cropFormData.plantingYear" 
                :min="2000" 
                :max="2100"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="种植月份" prop="plantMonth">
              <el-input-number 
                v-model="cropFormData.plantMonth" 
                :min="1" 
                :max="12"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="种植面积(亩)" prop="plantArea">
              <el-input-number 
                v-model="cropFormData.plantArea" 
                :min="0.1" 
                :precision="1"
                :step="0.1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="种植数量(株)" prop="plantCount">
              <el-input-number 
                v-model="cropFormData.plantCount" 
                :min="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计产量(kg)" prop="estimatedYield">
              <el-input-number 
                v-model="cropFormData.estimatedYield" 
                :min="0"
                :precision="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="架式" prop="frameType">
              <el-select v-model="cropFormData.frameType" placeholder="请选择架式" style="width: 100%;">
                <el-option 
                  v-for="type in frameTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="灌溉方式" prop="irrigationType">
              <el-select v-model="cropFormData.irrigationType" placeholder="请选择灌溉方式" style="width: 100%;">
                <el-option 
                  v-for="type in irrigationTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="施肥方式" prop="fertilizationType">
              <el-select v-model="cropFormData.fertilizationType" placeholder="请选择施肥方式" style="width: 100%;">
                <el-option 
                  v-for="type in fertilizationTypeOptions" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计收入(元)" prop="estimatedIncome">
              <el-input-number 
                v-model="cropFormData.estimatedIncome" 
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际收入(元)" prop="actualIncome">
              <el-input-number 
                v-model="cropFormData.actualIncome" 
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="cropFormData.status">
                <el-radio :label="1">生长中</el-radio>
                <el-radio :label="0">已结束</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="种植区域" prop="areaData">
          <el-input 
            v-model="cropFormData.areaData"
            type="textarea"
            :rows="3"
            placeholder="请输入JSON格式的多边形坐标数据，如：[{&quot;x&quot;:116.3250,&quot;y&quot;:39.9875},{&quot;x&quot;:116.3253,&quot;y&quot;:39.9875}]"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="cropFormData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cropFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCropForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.field-container {
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

.crop-card {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 