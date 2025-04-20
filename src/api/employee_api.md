# 职工管理 API 文档

## 基础信息
- 基础路径：`/api/employee`
- 所有接口返回格式：`Result<T>`
- 所有请求和响应均使用 JSON 格式

## 接口列表

### 1. 添加职工信息
- **接口说明**：添加新职工信息
- **请求方式**：POST
- **接口路径**：`/add`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | userId | Long | 是 | 关联的用户ID |
  | employeeNo | String | 是 | 工号，唯一标识 |
  | name | String | 是 | 职工姓名 |
  | gender | Integer | 是 | 性别：0-女，1-男 |
  | birthDate | Date | 否 | 出生日期 |
  | idCard | String | 是 | 身份证号 |
  | departmentId | Long | 是 | 所属部门ID |
  | position | String | 是 | 职位 |
  | entryDate | Date | 是 | 入职日期 |
  | salary | BigDecimal | 是 | 基本工资 |
  | address | String | 否 | 家庭住址 |
  | emergencyContact | String | 否 | 紧急联系人 |
  | emergencyPhone | String | 否 | 紧急联系电话 |
- **请求示例**：
```json
{
    "userId": 1,
    "employeeNo": "EMP2024001",
    "name": "张三",
    "gender": 1,
    "birthDate": "1990-01-01",
    "idCard": "110101199001011234",
    "departmentId": 1,
    "position": "Java开发工程师",
    "entryDate": "2024-01-01",
    "salary": 15000.00,
    "address": "北京市朝阳区xxx街道",
    "emergencyContact": "李四",
    "emergencyPhone": "13900139000"
}
```
- **响应示例**：
```json
{
    "success": true,
    "message": "添加成功"
}
```
- **错误码**：
  - 400：工号已存在
  - 400：身份证号已存在
  - 400：该用户已关联职工信息
  - 500：添加失败

### 2. 更新职工信息
- **接口说明**：更新职工信息
- **请求方式**：PUT
- **接口路径**：`/update`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 职工ID |
  | userId | Long | 是 | 关联的用户ID |
  | employeeNo | String | 是 | 工号，唯一标识 |
  | name | String | 是 | 职工姓名 |
  | gender | Integer | 是 | 性别：0-女，1-男 |
  | birthDate | Date | 否 | 出生日期 |
  | idCard | String | 是 | 身份证号 |
  | departmentId | Long | 是 | 所属部门ID |
  | position | String | 是 | 职位 |
  | entryDate | Date | 是 | 入职日期 |
  | salary | BigDecimal | 是 | 基本工资 |
  | status | Integer | 是 | 状态：0-离职，1-在职 |
  | address | String | 否 | 家庭住址 |
  | emergencyContact | String | 否 | 紧急联系人 |
  | emergencyPhone | String | 否 | 紧急联系电话 |
- **请求示例**：
```json
{
    "id": 1,
    "userId": 1,
    "employeeNo": "EMP2024001",
    "name": "张三",
    "gender": 1,
    "birthDate": "1990-01-01",
    "idCard": "110101199001011234",
    "departmentId": 1,
    "position": "高级Java开发工程师",
    "entryDate": "2024-01-01",
    "salary": 18000.00,
    "status": 1,
    "address": "北京市朝阳区xxx街道",
    "emergencyContact": "李四",
    "emergencyPhone": "13900139000"
}
```
- **响应示例**：
```json
{
    "success": true,
    "message": "更新成功"
}
```
- **错误码**：
  - 400：职工不存在
  - 400：工号已存在
  - 400：身份证号已存在
  - 500：更新失败

### 3. 删除职工信息
- **接口说明**：删除职工信息
- **请求方式**：DELETE
- **接口路径**：`/delete/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 职工ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "删除成功"
}
```
- **错误码**：
  - 400：职工不存在
  - 500：删除失败

### 4. 根据ID查询职工信息
- **接口说明**：根据ID查询职工信息
- **请求方式**：GET
- **接口路径**：`/get/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 职工ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "id": 1,
        "userId": 1,
        "employeeNo": "EMP2024001",
        "name": "张三",
        "gender": 1,
        "birthDate": "1990-01-01",
        "idCard": "110101199001011234",
        "departmentId": 1,
        "position": "Java开发工程师",
        "entryDate": "2024-01-01",
        "salary": 15000.00,
        "status": 1,
        "address": "北京市朝阳区xxx街道",
        "emergencyContact": "李四",
        "emergencyPhone": "13900139000",
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00",
        "user": {
            "id": 1,
            "username": "zhangsan",
            "realName": "张三",
            "status": 1
        },
        "department": {
            "id": 1,
            "deptCode": "DEPT001",
            "deptName": "研发部"
        }
    }
}
```
- **错误码**：
  - 400：职工不存在

### 5. 查询所有职工信息
- **接口说明**：查询所有职工信息
- **请求方式**：GET
- **接口路径**：`/list`
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": [
        {
            "id": 1,
            "userId": 1,
            "employeeNo": "EMP2024001",
            "name": "张三",
            "gender": 1,
            "departmentId": 1,
            "position": "Java开发工程师",
            "entryDate": "2024-01-01",
            "salary": 15000.00,
            "status": 1,
            "user": {
                "id": 1,
                "username": "zhangsan",
                "realName": "张三"
            },
            "department": {
                "id": 1,
                "deptName": "研发部"
            }
        },
        {
            "id": 2,
            "userId": 2,
            "employeeNo": "EMP2024002",
            "name": "李四",
            "gender": 1,
            "departmentId": 2,
            "position": "产品经理",
            "entryDate": "2024-02-01",
            "salary": 16000.00,
            "status": 1,
            "user": {
                "id": 2,
                "username": "lisi",
                "realName": "李四"
            },
            "department": {
                "id": 2,
                "deptName": "产品部"
            }
        }
    ]
}
```

### 6. 根据部门ID查询职工信息
- **接口说明**：根据部门ID查询职工信息
- **请求方式**：GET
- **接口路径**：`/list/department/{departmentId}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | departmentId | Long | 是 | 部门ID |
- **响应示例**：与查询所有职工信息相同

### 7. 分页查询职工信息
- **接口说明**：分页查询职工信息
- **请求方式**：GET
- **接口路径**：`/page`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | pageNum | Integer | 否 | 页码，默认1 |
  | pageSize | Integer | 否 | 每页数量，默认10 |
  | name | String | 否 | 职工姓名（模糊查询） |
  | departmentId | Long | 否 | 部门ID |
  | status | Integer | 否 | 状态：0-离职，1-在职 |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "total": 15,
        "list": [
            {
                "id": 1,
                "userId": 1,
                "employeeNo": "EMP2024001",
                "name": "张三",
                "gender": 1,
                "departmentId": 1,
                "position": "Java开发工程师",
                "entryDate": "2024-01-01",
                "salary": 15000.00,
                "status": 1,
                "user": {
                    "id": 1,
                    "username": "zhangsan",
                    "realName": "张三"
                },
                "department": {
                    "id": 1,
                    "deptName": "研发部"
                }
            },
            {
                "id": 2,
                "userId": 2,
                "employeeNo": "EMP2024002",
                "name": "李四",
                "gender": 1,
                "departmentId": 2,
                "position": "产品经理",
                "entryDate": "2024-02-01",
                "salary": 16000.00,
                "status": 1,
                "user": {
                    "id": 2,
                    "username": "lisi",
                    "realName": "李四"
                },
                "department": {
                    "id": 2,
                    "deptName": "产品部"
                }
            }
            // ...更多数据
        ],
        "pageNum": 1,
        "pageSize": 10,
        "pages": 2,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

## 数据字典
### 性别
- 0：女
- 1：男

### 职工状态
- 0：离职
- 1：在职 