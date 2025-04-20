# 农具和使用记录 API 文档

## 1. 农具管理

### 1.1 添加农具

- **接口URL**: `/tools/add`
- **请求方式**: POST
- **接口描述**: 添加新的农业工具

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolCode | String | 是 | 工具编号，唯一标识 |
| toolName | String | 是 | 工具名称 |
| toolType | String | 是 | 工具类型（如：拖拉机、播种机、收割机等） |
| brand | String | 否 | 品牌 |
| model | String | 否 | 型号 |
| purchaseDate | Date | 是 | 购买日期 |
| price | BigDecimal | 是 | 购买价格 |
| status | Integer | 是 | 状态：0-报废，1-正常，2-维修中 |
| location | String | 否 | 存放位置 |
| maintenanceCycle | Integer | 否 | 维护周期（天） |
| lastMaintenanceDate | Date | 否 | 上次维护日期 |
| nextMaintenanceDate | Date | 否 | 下次维护日期 |
| remark | String | 否 | 备注信息 |

**请求示例**:

```json
{
    "toolCode": "TL2024011",
    "toolName": "小型拖拉机",
    "toolType": "拖拉机",
    "brand": "福田",
    "model": "FT254",
    "purchaseDate": "2023-11-20",
    "price": 120000.00,
    "status": 1,
    "location": "农机库房A区",
    "maintenanceCycle": 60,
    "lastMaintenanceDate": "2024-01-15",
    "nextMaintenanceDate": "2024-03-15",
    "remark": "用于小面积作业"
}
```

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 操作结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "添加成功",
    "data": null
}
```

### 1.2 更新农具信息

- **接口URL**: `/tools/update`
- **请求方式**: PUT
- **接口描述**: 更新农具信息

**请求参数**: 与添加农具相同，但必须包含id字段

**请求示例**:

```json
{
    "id": 1,
    "toolName": "小型拖拉机(已更新)",
    "price": 125000.00,
    "remark": "更新后的备注信息"
}
```

**响应参数**: 与添加农具相同

**响应示例**:

```json
{
    "code": 200,
    "message": "更新成功",
    "data": null
}
```

### 1.3 删除农具

- **接口URL**: `/tools/delete/{id}`
- **请求方式**: DELETE
- **接口描述**: 删除指定ID的农具

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 农具ID |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 操作结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "删除成功",
    "data": null
}
```

### 1.4 根据ID查询农具

- **接口URL**: `/tools/get/{id}`
- **请求方式**: GET
- **接口描述**: 根据ID查询农具详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 农具ID |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 农具信息 |

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": 1,
        "toolCode": "TL2024001",
        "toolName": "大型拖拉机",
        "toolType": "拖拉机",
        "brand": "东方红",
        "model": "LX2004",
        "purchaseDate": "2023-10-15",
        "price": 250000.00,
        "status": 1,
        "location": "农机库房A区",
        "maintenanceCycle": 90,
        "lastMaintenanceDate": "2024-01-10",
        "nextMaintenanceDate": "2024-04-10",
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00",
        "remark": "主要用于大田作业"
    }
}
```

### 1.5 根据工具编码查询农具

- **接口URL**: `/tools/getByCode`
- **请求方式**: GET
- **接口描述**: 根据工具编码查询农具详细信息

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolCode | String | 是 | 工具编码 |

**响应参数**: 与根据ID查询相同

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": 1,
        "toolCode": "TL2024001",
        "toolName": "大型拖拉机",
        "toolType": "拖拉机",
        "brand": "东方红",
        "model": "LX2004",
        "purchaseDate": "2023-10-15",
        "price": 250000.00,
        "status": 1,
        "location": "农机库房A区",
        "maintenanceCycle": 90,
        "lastMaintenanceDate": "2024-01-10",
        "nextMaintenanceDate": "2024-04-10",
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00",
        "remark": "主要用于大田作业"
    }
}
```

### 1.6 查询所有农具

- **接口URL**: `/tools/list`
- **请求方式**: GET
- **接口描述**: 查询所有农具

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 农具列表 |

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": [
        {
            "id": 1,
            "toolCode": "TL2024001",
            "toolName": "大型拖拉机",
            "toolType": "拖拉机",
            "status": 1,
            "location": "农机库房A区",
            "nextMaintenanceDate": "2024-04-10"
        },
        {
            "id": 2,
            "toolCode": "TL2024002",
            "toolName": "小型拖拉机",
            "toolType": "拖拉机",
            "status": 1,
            "location": "农机库房A区",
            "nextMaintenanceDate": "2024-03-15"
        }
    ]
}
```

### 1.7 条件查询农具

- **接口URL**: `/tools/search`
- **请求方式**: GET
- **接口描述**: 根据条件查询农具

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolName | String | 否 | 工具名称，模糊匹配 |
| toolType | String | 否 | 工具类型 |
| status | Integer | 否 | 状态 |

**响应参数**: 与查询所有农具相同

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": [
        {
            "id": 1,
            "toolCode": "TL2024001",
            "toolName": "大型拖拉机",
            "toolType": "拖拉机",
            "status": 1,
            "location": "农机库房A区",
            "nextMaintenanceDate": "2024-04-10"
        }
    ]
}
```

### 1.8 分页查询农具

- **接口URL**: `/tools/page`
- **请求方式**: GET
- **接口描述**: 分页查询农具

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| toolName | String | 否 | 工具名称，模糊匹配 |
| toolType | String | 否 | 工具类型 |
| status | Integer | 否 | 状态 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 分页结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "total": 10,
        "list": [
            {
                "id": 1,
                "toolCode": "TL2024001",
                "toolName": "大型拖拉机",
                "toolType": "拖拉机",
                "status": 1,
                "location": "农机库房A区",
                "nextMaintenanceDate": "2024-04-10"
            },
            {
                "id": 2,
                "toolCode": "TL2024002",
                "toolName": "小型拖拉机",
                "toolType": "拖拉机",
                "status": 1,
                "location": "农机库房A区",
                "nextMaintenanceDate": "2024-03-15"
            }
        ],
        "pageNum": 1,
        "pageSize": 10,
        "pages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

### 1.9 查询需要维护的农具

- **接口URL**: `/tools/needMaintenance`
- **请求方式**: GET
- **接口描述**: 查询需要维护的农具（维护日期小于等于当前日期）

**响应参数**: 与查询所有农具相同

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": [
        {
            "id": 1,
            "toolCode": "TL2024001",
            "toolName": "大型拖拉机",
            "toolType": "拖拉机",
            "status": 1,
            "location": "农机库房A区",
            "nextMaintenanceDate": "2024-02-15"
        }
    ]
}
```

### 1.10 更新工具状态

- **接口URL**: `/tools/updateStatus`
- **请求方式**: PUT
- **接口描述**: 更新农具状态

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 农具ID |
| status | Integer | 是 | 状态：0-报废，1-正常，2-维修中 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 操作结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "状态更新成功",
    "data": null
}
```

## 2. 农具使用记录

### 2.1 添加使用记录

- **接口URL**: `/api/tool-usages`
- **请求方式**: POST
- **接口描述**: 添加农具使用记录

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolId | Long | 是 | 工具ID |
| employeeId | Long | 是 | 使用人ID |
| usageDate | Date | 是 | 使用日期 |
| startTime | DateTime | 是 | 开始时间 |
| endTime | DateTime | 否 | 结束时间 |
| usagePurpose | String | 是 | 使用目的 |
| usageArea | String | 否 | 使用区域 |
| usageHours | BigDecimal | 否 | 使用时长（小时） |
| fuelConsumption | BigDecimal | 否 | 燃油消耗（升） |
| status | Integer | 是 | 状态：0-异常，1-正常 |
| remark | String | 否 | 备注信息 |

**请求示例**:

```json
{
    "toolId": 1,
    "employeeId": 1,
    "usageDate": "2024-02-01",
    "startTime": "2024-02-01 08:00:00",
    "endTime": "2024-02-01 16:00:00",
    "usagePurpose": "大田翻耕",
    "usageArea": "A区1号田",
    "usageHours": 8.0,
    "fuelConsumption": 45.5,
    "status": 1,
    "remark": "完成A区1号田翻耕作业"
}
```

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Boolean | 操作结果，true表示成功，false表示失败 |

**响应示例**:

```json
{
    "code": 200,
    "message": "添加成功",
    "data": true
}
```

### 2.2 更新使用记录

- **接口URL**: `/api/tool-usages/{id}`
- **请求方式**: PUT
- **接口描述**: 更新农具使用记录

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 记录ID |

**请求参数**: 与添加使用记录相同，但所有字段均为可选，只更新提供的字段

**请求示例**:

```json
{
    "endTime": "2024-02-01 17:00:00",
    "usageHours": 9.0,
    "fuelConsumption": 50.0,
    "remark": "更新后的备注信息"
}
```

**响应参数**: 与添加使用记录相同

### 2.3 更新使用记录状态

- **接口URL**: `/api/tool-usages/{id}/status`
- **请求方式**: PATCH
- **接口描述**: 仅更新使用记录状态

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 记录ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| status | Integer | 是 | 状态：0-异常，1-正常 |

**请求示例**:

```json
{
    "status": 0
}
```

**响应参数**: 与添加使用记录相同

### 2.4 根据ID查询使用记录

- **接口URL**: `/api/tool-usages/{id}`
- **请求方式**: GET
- **接口描述**: 根据ID查询使用记录详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 记录ID |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 使用记录信息，包含工具和员工信息 |

**响应示例**:

```json
{
    "code": 200,
    "message": "查询成功",
    "data": {
        "id": 1,
        "toolId": 1,
        "employeeId": 1,
        "usageDate": "2024-01-15",
        "startTime": "2024-01-15 08:00:00",
        "endTime": "2024-01-15 16:00:00",
        "usagePurpose": "大田翻耕",
        "usageArea": "A区1号田",
        "usageHours": 8.0,
        "fuelConsumption": 45.5,
        "status": 1,
        "createTime": "2024-01-15 08:00:00",
        "updateTime": "2024-01-15 16:00:00",
        "remark": "完成A区1号田翻耕作业",
        "tool": {
            "id": 1,
            "toolCode": "TL2024001",
            "toolName": "大型拖拉机",
            "toolType": "拖拉机"
        },
        "employee": {
            "id": 1,
            "employeeNo": "EMP001",
            "name": "张三",
            "department": {
                "id": 1,
                "deptName": "农机部"
            }
        }
    }
}
```

### 2.5 根据工具ID查询使用记录

- **接口URL**: `/api/tool-usages/tool/{toolId}`
- **请求方式**: GET
- **接口描述**: 根据工具ID查询使用记录

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolId | Long | 是 | 工具ID |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 使用记录列表 |

**响应示例**: 同查询所有使用记录，但仅包含指定工具的记录

### 2.6 根据员工ID查询使用记录

- **接口URL**: `/api/tool-usages/employee/{employeeId}`
- **请求方式**: GET
- **接口描述**: 根据员工ID查询使用记录

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| employeeId | Long | 是 | 员工ID |

**响应参数**: 同查询所有使用记录，但仅包含指定员工的记录

### 2.7 根据日期范围查询使用记录

- **接口URL**: `/api/tool-usages/date-range`
- **请求方式**: GET
- **接口描述**: 根据日期范围查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 否 | 开始日期 |
| endDate | Date | 否 | 结束日期 |

**响应参数**: 同查询所有使用记录，但仅包含指定日期范围内的记录

### 2.8 条件查询使用记录

- **接口URL**: `/api/tool-usages/condition`
- **请求方式**: GET
- **接口描述**: 根据条件查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolId | Long | 否 | 工具ID |
| employeeId | Long | 否 | 员工ID |
| startDate | Date | 否 | 开始日期 |
| endDate | Date | 否 | 结束日期 |
| status | Integer | 否 | 状态 |

**响应参数**: 同查询所有使用记录，但根据条件过滤

### 2.9 分页查询使用记录

- **接口URL**: `/api/tool-usages/page`
- **请求方式**: GET
- **接口描述**: 分页查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| toolId | Long | 否 | 工具ID |
| employeeId | Long | 否 | 员工ID |
| startDate | Date | 否 | 开始日期 |
| endDate | Date | 否 | 结束日期 |
| status | Integer | 否 | 状态 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 分页结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "查询成功",
    "data": {
        "total": 18,
        "list": [
            {
                "id": 1,
                "toolId": 1,
                "employeeId": 1,
                "usageDate": "2024-01-15",
                "usagePurpose": "大田翻耕",
                "usageHours": 8.0,
                "status": 1,
                "tool": {
                    "toolCode": "TL2024001",
                    "toolName": "大型拖拉机"
                },
                "employee": {
                    "name": "张三"
                }
            },
            {
                "id": 2,
                "toolId": 1,
                "employeeId": 2,
                "usageDate": "2024-01-16",
                "usagePurpose": "大田整地",
                "usageHours": 8.0,
                "status": 1,
                "tool": {
                    "toolCode": "TL2024001",
                    "toolName": "大型拖拉机"
                },
                "employee": {
                    "name": "李四"
                }
            }
        ],
        "pageNum": 1,
        "pageSize": 10,
        "pages": 2,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

### 2.10 统计各工具的使用时长

- **接口URL**: `/api/tool-usages/statistics/tool`
- **请求方式**: GET
- **接口描述**: 统计各工具的使用次数和时长

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 否 | 开始日期 |
| endDate | Date | 否 | 结束日期 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 统计结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "查询成功",
    "data": [
        {
            "tool_id": 1,
            "tool_name": "大型拖拉机",
            "tool_code": "TL2024001",
            "usage_count": 5,
            "total_hours": 43.0
        },
        {
            "tool_id": 2,
            "tool_name": "小型拖拉机",
            "tool_code": "TL2024002",
            "usage_count": 3,
            "total_hours": 17.0
        }
    ]
}
```

### 2.11 统计各员工的工具使用情况

- **接口URL**: `/api/tool-usages/statistics/employee`
- **请求方式**: GET
- **接口描述**: 统计各员工的工具使用次数和时长

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 否 | 开始日期 |
| endDate | Date | 否 | 结束日期 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 统计结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "查询成功",
    "data": [
        {
            "employee_id": 1,
            "employee_name": "张三",
            "employee_no": "EMP001",
            "usage_count": 3,
            "total_hours": 25.0
        },
        {
            "employee_id": 2,
            "employee_name": "李四",
            "employee_no": "EMP002",
            "usage_count": 3,
            "total_hours": 26.0
        }
    ]
}
``` 