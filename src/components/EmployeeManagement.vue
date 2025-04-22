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

// 职工列表数据
const employeeList = ref([]);
const loading = ref(false);
const total = ref(0);

// 部门列表（用于下拉选择）
const departmentList = ref([]);
// 用户列表（用于下拉选择）
const userList = ref([]);

// 分页参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  departmentId: null,
  status: null
});

// 表单数据
const formData = reactive({
  id: null,
  userId: null,
  employeeNo: '',
  name: '',
  gender: 1,
  birthDate: '',
  idCard: '',
  departmentId: null,
  position: '',
  entryDate: '',
  salary: '',
  status: 1,
  address: '',
  emergencyContact: '',
  emergencyPhone: ''
});

// 表单规则
const rules = {
  userId: [
    { required: true, message: '请选择关联用户', trigger: 'change' }
  ],
  employeeNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{3,20}$/, message: '工号应为3-20位字母或数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入职工姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { min: 2, max: 50, message: '职位长度在2-50个字符', trigger: 'blur' }
  ],
  entryDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入基本工资', trigger: 'blur' },
    { pattern: /^[1-9]\d*(\.\d{1,2})?$/, message: '请输入有效的工资金额', trigger: 'blur' }
  ],
  emergencyPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
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
  getEmployeeList();
  loadDepartmentList();
  loadUserList();
});

// 获取职工列表
const getEmployeeList = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/employee/page', { 
      params: queryParams,
      headers: {
        'Authorization': token
      }
    });
    if (response.data.success) {
      // 适配新的API响应格式
      if (response.data.data && response.data.data.list) {
        employeeList.value = response.data.data.list;
        total.value = response.data.data.total || 0;
      } else if (response.data.data && response.data.data.records) {
        employeeList.value = response.data.data.records;
        total.value = response.data.data.total || 0;
      } else if (Array.isArray(response.data.data)) {
        employeeList.value = response.data.data;
        total.value = response.data.data.length;
      } else {
        employeeList.value = [];
        total.value = 0;
      }
    } else {
      ElMessage.error(response.data.message || '获取职工列表失败');
      employeeList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取职工列表失败:', error);
    ElMessage.error('获取职工列表失败，请检查网络或服务器状态');
    employeeList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 加载部门列表（用于下拉选择）
const loadDepartmentList = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/department/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data.success && Array.isArray(response.data.data)) {
      departmentList.value = response.data.data;
    } else {
      ElMessage.warning('无法加载部门列表');
      departmentList.value = [];
    }
  } catch (error) {
    console.error('加载部门列表失败:', error);
    ElMessage.warning('加载部门列表失败');
    departmentList.value = [];
  }
};

// 加载用户列表（用于下拉选择）
const loadUserList = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/user/list', {
      headers: {
        'Authorization': token
      }
    });
    if (response.data.success && Array.isArray(response.data.data)) {
      userList.value = response.data.data;
    } else {
      ElMessage.warning('无法加载用户列表');
      userList.value = [];
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    ElMessage.warning('加载用户列表失败');
    userList.value = [];
  }
};

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  // 打印查询参数，帮助调试
  console.log('查询参数:', queryParams);
  getEmployeeList();
};

// 重置搜索
const resetSearch = () => {
  queryParams.name = '';
  queryParams.departmentId = null;
  queryParams.status = null;
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page) => {
  queryParams.pageNum = page;
  getEmployeeList();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getEmployeeList();
};

// 打开添加对话框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = '添加职工';
  dialogType.value = 'add';
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row) => {
  resetForm();
  dialogTitle.value = '编辑职工';
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
    if (key === 'gender') {
      formData[key] = 1;
    } else if (key === 'status') {
      formData[key] = 1;
    } else {
      formData[key] = null;
    }
  });
  
  formData.id = null;
  formData.userId = null;
  formData.employeeNo = '';
  formData.name = '';
  formData.birthDate = '';
  formData.idCard = '';
  formData.departmentId = null;
  formData.position = '';
  formData.entryDate = '';
  formData.salary = '';
  formData.address = '';
  formData.emergencyContact = '';
  formData.emergencyPhone = '';
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
          response = await axios.post('/api/employee/add', formData, { headers });
        } else {
          response = await axios.put('/api/employee/update', formData, { headers });
        }
        
        if (response.data.success) {
          ElMessage.success(response.data.message || (dialogType.value === 'add' ? '添加成功' : '更新成功'));
          dialogVisible.value = false;
          getEmployeeList();
        } else {
          ElMessage.error(response.data.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加职工失败:' : '更新职工失败:', error);
        
        let errorMsg = dialogType.value === 'add' ? '添加职工失败' : '更新职工失败';
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
            } else if (dialogType.value === 'add') {
              errorMsg = '工号或身份证号已存在，或该用户已关联职工信息';
            } else {
              errorMsg = '职工不存在，或工号/身份证号已被使用';
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

// 处理删除职工
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该职工吗？删除后不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`/api/employee/delete/${id}`, {
        headers: {
          'Authorization': token
        }
      });
      if (response.data.success) {
        ElMessage.success(response.data.message || '删除成功');
        getEmployeeList();
      } else {
        ElMessage.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除职工失败:', error);
      
      let errorMsg = '删除职工失败';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          } else {
            errorMsg = '职工不存在';
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

// 格式化性别显示
const formatGender = (row) => {
  return row.gender === 1 ? '男' : '女';
};

// 格式化状态显示
const formatStatus = (row) => {
  return row.status === 1 ? '在职' : '离职';
};

// 获取部门名称
const getDepartmentName = (departmentId) => {
  const department = departmentList.value.find(dept => dept.id === departmentId);
  return department ? department.deptName : '';
};

// 返回Dashboard
const goBackToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="employee-container">
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
    
    <div class="content-wrapper">
      <!-- 头部 -->
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">职工管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" @click="openAddDialog" icon="Plus">添加职工</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-card class="search-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="职工姓名">
            <el-input v-model="queryParams.name" placeholder="请输入职工姓名" clearable />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select v-model="queryParams.departmentId" placeholder="请选择部门" clearable>
              <el-option label="全部部门" :value="null" />
              <el-option 
                v-for="dept in departmentList" 
                :key="dept.id" 
                :label="dept.deptName" 
                :value="dept.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="全部状态" :value="null" />
              <el-option label="在职" :value="1" />
              <el-option label="离职" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
            <el-button @click="resetSearch" icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 职工列表 -->
      <el-card class="list-card">
        <el-table 
          :data="employeeList" 
          style="width: 100%" 
          border 
          v-loading="loading"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="employeeNo" label="工号" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column label="性别" min-width="80">
            <template #default="scope">
              {{ formatGender(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="所属部门" min-width="120">
            <template #default="scope">
              <span>{{ scope.row.department ? scope.row.department.deptName : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职位" min-width="140" />
          <el-table-column prop="entryDate" label="入职日期" min-width="120" />
          <el-table-column prop="salary" label="基本工资" min-width="100" />
          <el-table-column label="状态" min-width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ formatStatus(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="idCard" label="身份证号" min-width="180" />
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
    
    <!-- 添加/编辑职工对话框 -->
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
        label-width="100px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联用户" prop="userId">
              <el-select v-model="formData.userId" placeholder="请选择用户" filterable>
                <el-option 
                  v-for="user in userList" 
                  :key="user.id" 
                  :label="`${user.username}${user.realName ? ' (' + user.realName + ')' : ''}`" 
                  :value="user.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="employeeNo">
              <el-input v-model="formData.employeeNo" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="0">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker 
                v-model="formData.birthDate" 
                type="date" 
                placeholder="请选择出生日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门" prop="departmentId">
              <el-select v-model="formData.departmentId" placeholder="请选择部门" filterable>
                <el-option 
                  v-for="dept in departmentList" 
                  :key="dept.id" 
                  :label="dept.deptName" 
                  :value="dept.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="entryDate">
              <el-date-picker 
                v-model="formData.entryDate" 
                type="date" 
                placeholder="请选择入职日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基本工资" prop="salary">
              <el-input-number 
                v-model="formData.salary" 
                :precision="2" 
                :step="100" 
                :min="0"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status" v-if="dialogType === 'edit'">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入家庭住址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="formData.emergencyContact" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急电话" prop="emergencyPhone">
              <el-input v-model="formData.emergencyPhone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
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
.employee-container {
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
</style> 