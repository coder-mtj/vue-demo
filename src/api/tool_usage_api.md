# 农具使用记录 API 文档

## 1. 使用记录管理

### 1.1 添加使用记录

- **接口URL**: `/toolusage/add`
- **请求方式**: POST
- **接口描述**: 添加农具使用记录

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolId | Long | 是 | 工具ID |
| employeeId | Long | 是 | 使用人ID |
| usageDate | Date | 是 | 使用日期 (格式: yyyy-MM-dd) |
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
| data | Object | 操作结果 |

**响应示例**:

```json
{
    "code": 200,
    "message": "添加成功",
    "data": null
}
```

### 1.2 更新使用记录

- **接口URL**: `/toolusage/update`
- **请求方式**: PUT
- **接口描述**: 更新农具使用记录

**请求参数**: 与添加使用记录相同，但必须包含id字段

**请求示例**:

```json
{
    "id": 1,
    "endTime": "2024-02-01 17:00:00",
    "usageHours": 9.0,
    "fuelConsumption": 50.0,
    "remark": "更新后的备注信息"
}
```

**响应参数**: 与添加使用记录相同

**响应示例**:

```json
{
    "code": 200,
    "message": "更新成功",
    "data": null
}
```

### 1.3 删除使用记录

- **接口URL**: `/toolusage/delete/{id}`
- **请求方式**: DELETE
- **接口描述**: 删除指定ID的使用记录

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 记录ID |

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

### 1.4 根据ID查询使用记录

- **接口URL**: `/toolusage/get/{id}`
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
    "message": "操作成功",
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

### 1.5 根据工具ID查询使用记录

- **接口URL**: `/toolusage/listByTool/{toolId}`
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

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
    "data": [
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
    ]
}
```

### 1.6 根据员工ID查询使用记录

- **接口URL**: `/toolusage/listByEmployee/{employeeId}`
- **请求方式**: GET
- **接口描述**: 根据员工ID查询使用记录

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| employeeId | Long | 是 | 员工ID |

**响应参数**: 同查询工具的使用记录

**响应示例**: 同查询工具的使用记录

### 1.7 根据日期范围查询使用记录

- **接口URL**: `/toolusage/listByDateRange`
- **请求方式**: GET
- **接口描述**: 根据日期范围查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 是 | 开始日期 (格式: yyyy-MM-dd) |
| endDate | Date | 是 | 结束日期 (格式: yyyy-MM-dd) |

**响应参数**: 同查询工具的使用记录

**请求示例**:

```
/toolusage/listByDateRange?startDate=2024-01-01&endDate=2024-01-31
```

**响应示例**: 同查询工具的使用记录

### 1.8 条件查询使用记录

- **接口URL**: `/toolusage/search`
- **请求方式**: GET
- **接口描述**: 根据条件查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| toolId | Long | 否 | 工具ID |
| employeeId | Long | 否 | 员工ID |
| startDate | Date | 否 | 开始日期 (格式: yyyy-MM-dd) |
| endDate | Date | 否 | 结束日期 (格式: yyyy-MM-dd) |
| status | Integer | 否 | 状态：0-异常，1-正常 |

**响应参数**: 同查询工具的使用记录

**请求示例**:

```
/toolusage/search?toolId=1&employeeId=1&startDate=2024-01-01&endDate=2024-01-31&status=1
```

**响应示例**: 同查询工具的使用记录

### 1.9 分页查询使用记录

- **接口URL**: `/toolusage/page`
- **请求方式**: GET
- **接口描述**: 分页查询使用记录

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| toolId | Long | 否 | 工具ID |
| employeeId | Long | 否 | 员工ID |
| startDate | Date | 否 | 开始日期 (格式: yyyy-MM-dd) |
| endDate | Date | 否 | 结束日期 (格式: yyyy-MM-dd) |
| status | Integer | 否 | 状态 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 分页结果 |

**请求示例**:

```
/toolusage/page?pageNum=1&pageSize=10&toolId=1&startDate=2024-01-01&endDate=2024-01-31
```

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
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

### 1.10 统计各工具的使用时长

- **接口URL**: `/toolusage/statisticsByTool`
- **请求方式**: GET
- **接口描述**: 统计各工具的使用次数和时长

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 否 | 开始日期 (格式: yyyy-MM-dd) |
| endDate | Date | 否 | 结束日期 (格式: yyyy-MM-dd) |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 统计结果 |

**请求示例**:

```
/toolusage/statisticsByTool?startDate=2024-01-01&endDate=2024-01-31
```

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
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

### 1.11 统计各员工的工具使用情况

- **接口URL**: `/toolusage/statisticsByEmployee`
- **请求方式**: GET
- **接口描述**: 统计各员工的工具使用次数和时长

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | Date | 否 | 开始日期 (格式: yyyy-MM-dd) |
| endDate | Date | 否 | 结束日期 (格式: yyyy-MM-dd) |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Array | 统计结果 |

**请求示例**:

```
/toolusage/statisticsByEmployee?startDate=2024-01-01&endDate=2024-01-31
```

**响应示例**:

```json
{
    "code": 200,
    "message": "操作成功",
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

### 1.12 更新使用记录状态

- **接口URL**: `/toolusage/updateStatus`
- **请求方式**: PUT
- **接口描述**: 更新使用记录状态

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 记录ID |
| status | Integer | 是 | 状态：0-异常，1-正常 |

**响应参数**:

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| code | Integer | 状态码，200表示成功 |
| message | String | 提示信息 |
| data | Object | 操作结果 |

**请求示例**:

```
/toolusage/updateStatus?id=1&status=0
```

**响应示例**:

```json
{
    "code": 200,
    "message": "状态更新成功",
    "data": null
}
``` 