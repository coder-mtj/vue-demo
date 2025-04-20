<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, Back, Plus, Delete, Edit, Warning, Search, Refresh } from '@element-plus/icons-vue';
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
const cropsList = ref([]);
const total = ref(0);

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  cropType: '葡萄',
  variety: '',
  status: null
});

// 表单数据
const formData = reactive({
  id: null,
  cropCode: '',
  cropName: '',
  cropType: '葡萄',
  variety: '',
  growthCycle: null,
  suitableSoil: '',
  suitableTemp: '',
  plantDistance: null,
  rowDistance: null,
  waterDemand: '中',
  fertilizerDemand: '中',
  pruningMethod: '',
  diseaseResistance: '中',
  pestResistance: '中',
  color: '#8B0000',
  icon: '',
  status: 1,
  remark: ''
});

// 表单规则
const rules = {
  cropCode: [
    { required: true, message: '请输入作物编号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]{3,20}$/, message: '编号应为3-20位字母、数字或连字符', trigger: 'blur' }
  ],
  cropName: [
    { required: true, message: '请输入作物名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  variety: [
    { required: true, message: '请选择葡萄品种', trigger: 'change' }
  ],
  cropType: [
    { required: true, message: '请输入作物类型', trigger: 'blur' }
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

// 葡萄品种列表
const varietyOptions = [
  '赤霞珠（Cabernet Sauvignon）',
  '霞多丽（Chardonnay）',
  '梅洛（Merlot）',
  '黑皮诺（Pinot Noir）',
  '长相思（Sauvignon Blanc）',
  '西拉（Syrah）',
  '蛇龙珠（Cabernet Gernischt）',
  '玫瑰香（Rose Honey）'
];

// 肥料/水分需求选项
const demandOptions = ['高', '中', '低'];

// 抗性选项
const resistanceOptions = ['强', '中', '弱'];

// 状态样式映射
const statusTagType = {
  0: 'danger',
  1: 'success'
};

// 状态显示文字映射
const statusTextMap = {
  0: '停用',
  1: '启用'
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
  
  // 获取葡萄作物列表
  getCropsList();
});

// 获取葡萄作物列表
const getCropsList = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/crop/page', { params: queryParams });
    if (response.data && response.data.success) {
      const data = response.data.data;
      cropsList.value = data.list || [];
      total.value = data.total || 0;
    } else {
      ElMessage.error(response.data?.message || '获取葡萄作物列表失败');
      cropsList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取葡萄作物列表失败:', error);
    ElMessage.error('获取葡萄作物列表失败，请检查网络或服务器状态');
    cropsList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  getCropsList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.variety = '';
  queryParams.status = null;
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  queryParams.pageNum = page;
  getCropsList();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getCropsList();
};

// 打开添加对话框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = '添加葡萄作物';
  dialogType.value = 'add';
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = async (row) => {
  resetForm();
  dialogTitle.value = '编辑葡萄作物';
  dialogType.value = 'edit';
  
  try {
    // 获取完整作物信息
    const response = await axios.get(`/api/crop/get/${row.id}`);
    if (response.data && response.data.success && response.data.data) {
      // 填充表单数据
      Object.keys(formData).forEach(key => {
        if (response.data.data[key] !== undefined) {
          formData[key] = response.data.data[key];
        }
      });
      
      dialogVisible.value = true;
    } else {
      ElMessage.error(response.data?.message || '获取葡萄作物详情失败');
    }
  } catch (error) {
    console.error('获取葡萄作物详情失败:', error);
    ElMessage.error('获取葡萄作物详情失败，请检查网络或服务器状态');
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  Object.keys(formData).forEach(key => {
    if (key === 'cropType') {
      formData[key] = '葡萄';
    } else if (key === 'waterDemand' || key === 'fertilizerDemand') {
      formData[key] = '中';
    } else if (key === 'diseaseResistance' || key === 'pestResistance') {
      formData[key] = '中';
    } else if (key === 'status') {
      formData[key] = 1;
    } else if (key === 'color') {
      formData[key] = '#8B0000';
    } else if (key === 'id') {
      formData[key] = null;
    } else {
      formData[key] = '';
    }
  });
  
  // 数值类型字段需要特殊处理
  formData.growthCycle = null;
  formData.plantDistance = null;
  formData.rowDistance = null;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (dialogType.value === 'add') {
          response = await axios.post('/api/crop/add', formData);
        } else {
          response = await axios.put('/api/crop/update', formData);
        }
        
        if (response.data && response.data.success) {
          ElMessage.success(response.data.message || (dialogType.value === 'add' ? '添加成功' : '更新成功'));
          dialogVisible.value = false;
          getCropsList();
        } else {
          ElMessage.error(response.data?.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加葡萄作物失败:' : '更新葡萄作物失败:', error);
        
        let errorMsg = dialogType.value === 'add' ? '添加葡萄作物失败' : '更新葡萄作物失败';
        if (error.response) {
          if (error.response.status === 400) {
            errorMsg = error.response.data?.message || '请求参数错误';
          } else if (error.response.status === 500) {
            errorMsg = dialogType.value === 'add' ? '添加失败，服务器内部错误' : '更新失败，服务器内部错误';
          }
        }
        
        ElMessage.error(errorMsg);
      }
    }
  });
};

// 删除葡萄作物
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除葡萄作物【${row.cropName}】吗？此操作不可逆！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`/api/crop/delete/${row.id}`);
      if (response.data && response.data.success) {
        ElMessage.success(response.data.message || '删除成功');
        getCropsList();
      } else {
        ElMessage.error(response.data?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除葡萄作物失败:', error);
      
      let errorMsg = '删除葡萄作物失败';
      if (error.response) {
        if (error.response.status === 400) {
          errorMsg = error.response.data?.message || '作物不存在或正在使用中';
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

// 更新葡萄作物状态
const updateCropStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/crop/updateStatus?id=${id}&status=${status}`);
    if (response.data && response.data.success) {
      ElMessage.success('状态更新成功');
      getCropsList();
    } else {
      ElMessage.error(response.data?.message || '状态更新失败');
    }
  } catch (error) {
    console.error('更新葡萄作物状态失败:', error);
    ElMessage.error('更新葡萄作物状态失败，请检查网络或服务器状态');
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
</script>

<template>
  <div class="crop-container">
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
          <h2 class="page-title">葡萄作物管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">添加作物</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="葡萄品种">
            <el-input v-model="queryParams.variety" placeholder="请输入葡萄品种" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="全部状态" :value="null" />
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 作物列表 -->
      <el-card class="list-card">
        <el-table 
          :data="cropsList" 
          style="width: 100%" 
          border 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="cropCode" label="作物编号" min-width="120" />
          <el-table-column prop="cropName" label="作物名称" min-width="150" />
          <el-table-column prop="variety" label="葡萄品种" min-width="180" />
          <el-table-column prop="growthCycle" label="生长周期(天)" min-width="120" />
          <el-table-column label="颜色" min-width="100">
            <template #default="scope">
              <div class="color-block" :style="{ backgroundColor: scope.row.color }"></div>
              {{ scope.row.color }}
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="statusTagType[scope.row.status]">
                {{ formatStatus(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="220">
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
                type="success" 
                link 
                @click="updateCropStatus(scope.row.id, 1)" 
                :disabled="scope.row.status === 1"
              >
                启用
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="updateCropStatus(scope.row.id, 0)" 
                :disabled="scope.row.status === 0"
              >
                停用
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDelete(scope.row)" 
                :icon="Delete"
              >
                删除
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
    
    <!-- 添加/编辑作物对话框 -->
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
            <el-form-item label="作物编号" prop="cropCode">
              <el-input v-model="formData.cropCode" placeholder="请输入作物编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作物名称" prop="cropName">
              <el-input v-model="formData.cropName" placeholder="请输入作物名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作物类型" prop="cropType">
              <el-input v-model="formData.cropType" placeholder="请输入作物类型" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="葡萄品种" prop="variety">
              <el-select v-model="formData.variety" placeholder="请选择葡萄品种" style="width: 100%;">
                <el-option 
                  v-for="variety in varietyOptions" 
                  :key="variety" 
                  :label="variety" 
                  :value="variety" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生长周期(天)" prop="growthCycle">
              <el-input-number 
                v-model="formData.growthCycle" 
                :min="1" 
                :max="365"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-color-picker v-model="formData.color" @change="val => formData.color = val" />
              <el-input v-model="formData.color" placeholder="颜色代码" class="color-input" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="适宜土壤" prop="suitableSoil">
              <el-input v-model="formData.suitableSoil" placeholder="请输入适宜土壤" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适宜温度" prop="suitableTemp">
              <el-input v-model="formData.suitableTemp" placeholder="请输入适宜温度" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="建议株距(米)" prop="plantDistance">
              <el-input-number 
                v-model="formData.plantDistance" 
                :min="0.1" 
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="建议行距(米)" prop="rowDistance">
              <el-input-number 
                v-model="formData.rowDistance" 
                :min="0.1" 
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="水分需求" prop="waterDemand">
              <el-select v-model="formData.waterDemand" placeholder="请选择水分需求" style="width: 100%;">
                <el-option 
                  v-for="option in demandOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="肥料需求" prop="fertilizerDemand">
              <el-select v-model="formData.fertilizerDemand" placeholder="请选择肥料需求" style="width: 100%;">
                <el-option 
                  v-for="option in demandOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="抗病性" prop="diseaseResistance">
              <el-select v-model="formData.diseaseResistance" placeholder="请选择抗病性" style="width: 100%;">
                <el-option 
                  v-for="option in resistanceOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抗虫性" prop="pestResistance">
              <el-select v-model="formData.pestResistance" placeholder="请选择抗虫性" style="width: 100%;">
                <el-option 
                  v-for="option in resistanceOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="修剪方式" prop="pruningMethod">
          <el-input v-model="formData.pruningMethod" placeholder="请输入推荐修剪方式" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
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
  </div>
</template>

<style scoped>
.crop-container {
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

.color-block {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 5px;
  vertical-align: middle;
  border: 1px solid #dcdfe6;
}

.color-input {
  width: calc(100% - 60px);
  margin-left: 10px;
}
</style> 