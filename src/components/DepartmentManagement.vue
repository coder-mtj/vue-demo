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

// 部门列表数据
const departmentList = ref([]);
const loading = ref(false);
const total = ref(0);

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  deptName: '',
  status: null
});

// 表单数据
const formData = reactive({
  id: null,
  deptCode: '',
  deptName: '',
  leaderId: null,
  orderNum: 0,
  phone: '',
  email: '',
  status: 1,
  remark: ''
});

// 表单规则
const rules = {
  deptCode: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的联系电话', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  orderNum: [
    { type: 'number', message: '显示顺序必须为数字', trigger: 'blur' }
  ]
};

// 对话框显示控制
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref('add'); // add, edit
const formRef = ref(null);

// 添加获取token的辅助函数
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 初始化获取数据
onMounted(() => {
  getDepartmentList();
});

// 获取部门列表
const getDepartmentList = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/department/page', { 
      params: queryParams,
      headers: {
        'Authorization': token
      }
    });
    if (response.data.success) {
      // 适配新的API响应格式
      if (response.data.data && response.data.data.list) {
        departmentList.value = response.data.data.list;
        total.value = response.data.data.total || 0;
      } else if (response.data.data && response.data.data.records) {
        departmentList.value = response.data.data.records;
        total.value = response.data.data.total || 0;
      } else if (Array.isArray(response.data.data)) {
        departmentList.value = response.data.data;
        total.value = response.data.data.length;
      } else {
        departmentList.value = [];
        total.value = 0;
      }
    } else {
      ElMessage.error(response.data.message || '获取部门列表失败');
      departmentList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表失败，请检查网络或服务器状态');
    departmentList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  // 打印查询参数，帮助调试
  console.log('查询参数:', queryParams);
  getDepartmentList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.deptName = '';
  queryParams.status = null;
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  queryParams.pageNum = page;
  getDepartmentList();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getDepartmentList();
};

// 打开添加对话框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = '添加部门';
  dialogType.value = 'add';
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row) => {
  resetForm();
  dialogTitle.value = '编辑部门';
  dialogType.value = 'edit';
  
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    if (row[key] !== undefined) {
      formData[key] = row[key];
    }
  });
  
  dialogVisible.value = true;
};

// 重置表单数据
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  Object.keys(formData).forEach(key => {
    if (key === 'status') {
      formData[key] = 1;
    } else if (key === 'orderNum') {
      formData[key] = 0;
    } else {
      formData[key] = null;
    }
  });
  
  formData.id = null;
  formData.deptCode = '';
  formData.deptName = '';
  formData.phone = '';
  formData.email = '';
  formData.remark = '';
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = getAuthToken();
        const headers = {
          'Authorization': token
        };
        
        let response;
        if (dialogType.value === 'add') {
          response = await axios.post('/api/department/add', formData, { headers });
        } else {
          response = await axios.put('/api/department/update', formData, { headers });
        }
        
        if (response.data.success) {
          ElMessage.success(response.data.message || (dialogType.value === 'add' ? '添加成功' : '更新成功'));
          dialogVisible.value = false;
          getDepartmentList();
        } else {
          ElMessage.error(response.data.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加部门失败:' : '更新部门失败:', error);
        
        let errorMsg = dialogType.value === 'add' ? '添加部门失败' : '更新部门失败';
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
            } else if (dialogType.value === 'add') {
              errorMsg = '部门编码或名称已存在，或部门负责人不存在';
            } else {
              errorMsg = '部门不存在，或部门编码/名称已被使用，或部门负责人不存在';
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

// 处理删除部门
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该部门吗？删除后不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`/api/department/delete/${id}`, {
        headers: {
          'Authorization': token
        }
      });
      if (response.data.success) {
        ElMessage.success(response.data.message || '删除成功');
        getDepartmentList();
      } else {
        ElMessage.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除部门失败:', error);
      
      let errorMsg = '删除部门失败';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          } else {
            errorMsg = '部门不存在或该部门下有员工，无法删除';
          }
        } else if (status === 500) {
          errorMsg = '删除失败，服务器内部错误';
        }
      }
      
      ElMessage.error(errorMsg);
    }
  }).catch(() => {
    // 取消删除操作
  });
};

// 格式化状态显示
const formatStatus = (row) => {
  return row.status === 1 ? '启用' : '停用';
};

// 返回Dashboard
const goBackToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="department-container">
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
          <h2 class="page-title">部门管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" @click="openAddDialog" icon="Plus">添加部门</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="部门名称">
            <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="全部状态" :value="null" />
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
            <el-button @click="resetSearch" icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 部门列表 -->
      <el-card class="list-card">
        <el-table 
          :data="departmentList" 
          style="width: 100%" 
          border 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="deptCode" label="部门编码" min-width="120" />
          <el-table-column prop="deptName" label="部门名称" min-width="160" />
          <el-table-column label="负责人" min-width="120">
            <template #default="scope">
              <span>{{ scope.row.leader ? scope.row.leader.name : '暂无' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="联系电话" min-width="140" />
          <el-table-column prop="email" label="部门邮箱" min-width="180" />
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ formatStatus(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="180">
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
                type="danger" 
                link 
                @click="handleDelete(scope.row.id)" 
                icon="Delete"
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
    
    <!-- 添加/编辑部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="formData.deptCode" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人ID" prop="leaderId">
          <el-input v-model.number="formData.leaderId" placeholder="请输入负责人ID" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="部门邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入部门邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogType === 'edit'">
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
.department-container {
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
</style> 