# 部门管理 API 文档

## 基础信息
- 基础路径：`/api/department`
- 所有接口返回格式：`Result<T>`
- 所有请求和响应均使用 JSON 格式

## 接口列表

### 1. 添加部门信息
- **接口说明**：添加新部门信息
- **请求方式**：POST
- **接口路径**：`/add`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | deptCode | String | 是 | 部门编码，唯一标识 |
  | deptName | String | 是 | 部门名称 |
  | leaderId | Long | 否 | 部门负责人ID |
  | orderNum | Integer | 否 | 显示顺序，默认0 |
  | phone | String | 否 | 联系电话 |
  | email | String | 否 | 部门邮箱 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "deptCode": "DEPT001",
    "deptName": "研发部",
    "leaderId": 1,
    "orderNum": 1,
    "phone": "010-12345678",
    "email": "rd@example.com",
    "remark": "负责公司产品研发工作"
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
  - 400：部门编码已存在
  - 400：部门名称已存在
  - 400：部门负责人不存在
  - 500：添加失败

### 2. 更新部门信息
- **接口说明**：更新部门信息
- **请求方式**：PUT
- **接口路径**：`/update`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 部门ID |
  | deptCode | String | 是 | 部门编码，唯一标识 |
  | deptName | String | 是 | 部门名称 |
  | leaderId | Long | 否 | 部门负责人ID |
  | orderNum | Integer | 否 | 显示顺序 |
  | phone | String | 否 | 联系电话 |
  | email | String | 否 | 部门邮箱 |
  | status | Integer | 是 | 状态：0-停用，1-启用 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "id": 1,
    "deptCode": "DEPT001",
    "deptName": "研发中心",
    "leaderId": 2,
    "orderNum": 1,
    "phone": "010-87654321",
    "email": "dev@example.com",
    "status": 1,
    "remark": "负责公司所有产品的研发工作"
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
  - 400：部门不存在
  - 400：部门编码已存在
  - 400：部门名称已存在
  - 400：部门负责人不存在
  - 500：更新失败

### 3. 删除部门信息
- **接口说明**：删除部门信息
- **请求方式**：DELETE
- **接口路径**：`/delete/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 部门ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "删除成功"
}
```
- **错误码**：
  - 400：部门不存在
  - 400：该部门下有员工，无法删除
  - 500：删除失败

### 4. 根据ID查询部门信息
- **接口说明**：根据ID查询部门信息
- **请求方式**：GET
- **接口路径**：`/get/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 部门ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "id": 1,
        "deptCode": "DEPT001",
        "deptName": "研发部",
        "leaderId": 1,
        "orderNum": 1,
        "phone": "010-12345678",
        "email": "rd@example.com",
        "status": 1,
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00",
        "remark": "负责公司产品研发工作",
        "leader": {
            "id": 1,
            "name": "张三",
            "position": "技术总监"
        }
    }
}
```
- **错误码**：
  - 400：部门不存在

### 5. 查询所有部门信息
- **接口说明**：查询所有部门信息
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
            "deptCode": "DEPT001",
            "deptName": "研发部",
            "leaderId": 1,
            "orderNum": 1,
            "status": 1,
            "leader": {
                "id": 1,
                "name": "张三",
                "position": "技术总监"
            }
        },
        {
            "id": 2,
            "deptCode": "DEPT002",
            "deptName": "市场部",
            "leaderId": 2,
            "orderNum": 2,
            "status": 1,
            "leader": {
                "id": 2,
                "name": "李四",
                "position": "市场总监"
            }
        }
    ]
}
```

### 6. 分页查询部门信息
- **接口说明**：分页查询部门信息
- **请求方式**：GET
- **接口路径**：`/page`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | pageNum | Integer | 否 | 页码，默认1 |
  | pageSize | Integer | 否 | 每页数量，默认10 |
  | deptName | String | 否 | 部门名称（模糊查询） |
  | status | Integer | 否 | 状态：0-停用，1-启用 |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "total": 12,
        "list": [
            {
                "id": 1,
                "deptCode": "DEPT001",
                "deptName": "研发部",
                "leaderId": 1,
                "orderNum": 1,
                "status": 1,
                "leader": {
                    "id": 1,
                    "name": "张三",
                    "position": "技术总监"
                }
            },
            {
                "id": 2,
                "deptCode": "DEPT002",
                "deptName": "市场部",
                "leaderId": 2,
                "orderNum": 2,
                "status": 1,
                "leader": {
                    "id": 2,
                    "name": "李四",
                    "position": "市场总监"
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
### 部门状态
- 0：停用
- 1：启用 