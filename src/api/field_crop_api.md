# 田块作物关系API文档

## 接口概述

本文档描述了田块作物关系管理相关的API接口，用于管理田块与作物之间的种植关系。

## 基础信息

- 基础路径: `/api/fieldcrop`
- 数据格式: JSON
- 响应格式: 
  ```json
  {
    "code": 200,       // 状态码：200成功，其他表示失败
    "msg": "操作成功",  // 响应消息
    "data": {}         // 响应数据
  }
  ```

## 接口列表

### 1. 添加田块作物关系

- **接口**: `/api/fieldcrop/add`
- **方法**: POST
- **描述**: 添加新的田块作物关系记录
- **请求体**:
  ```json
  {
    "fieldId": 1,           // 田块ID
    "cropId": 1,            // 作物ID
    "plantingYear": 2023,   // 种植年份
    "plantMonth": 3,        // 种植月份
    "plantArea": 10.5,      // 种植面积（亩）
    "areaData": "[{...}]",  // 种植区域多边形坐标数据(JSON格式)
    "plantCount": 1000,     // 种植数量（株）
    "estimatedYield": 5000, // 预计产量（千克）
    "frameType": "篱架",     // 架式
    "irrigationType": "滴灌", // 灌溉方式
    "fertilizationType": "有机肥", // 施肥方式
    "estimatedIncome": 50000, // 预计收入（元）
    "status": 1,            // 状态：0-已结束，1-生长中
    "remark": "备注信息"     // 备注信息
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "添加成功",
    "data": null
  }
  ```

### 2. 批量添加田块作物关系

- **接口**: `/api/fieldcrop/batchAdd`
- **方法**: POST
- **描述**: 批量添加多条田块作物关系记录
- **请求体**:
  ```json
  [
    {
      "fieldId": 1,
      "cropId": 1,
      "plantingYear": 2023,
      // 其他字段...
    },
    {
      "fieldId": 1,
      "cropId": 2,
      "plantingYear": 2023,
      // 其他字段...
    }
  ]
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "成功添加2条记录",
    "data": null
  }
  ```

### 3. 更新田块作物关系

- **接口**: `/api/fieldcrop/update`
- **方法**: PUT
- **描述**: 更新现有的田块作物关系记录
- **请求体**:
  ```json
  {
    "id": 1,               // 记录ID
    "fieldId": 1,          // 田块ID
    "cropId": 1,           // 作物ID
    "plantingYear": 2023,  // 种植年份
    "plantMonth": 3,       // 种植月份
    "plantArea": 10.5,     // 种植面积（亩）
    "areaData": "[{...}]", // 种植区域多边形坐标数据(JSON格式)
    "plantCount": 1000,    // 种植数量（株）
    "estimatedYield": 5000, // 预计产量（千克）
    "frameType": "篱架",    // 架式
    "irrigationType": "滴灌", // 灌溉方式
    "fertilizationType": "有机肥", // 施肥方式
    "estimatedIncome": 50000, // 预计收入（元）
    "actualIncome": 48000,  // 实际收入（元）
    "status": 1,           // 状态：0-已结束，1-生长中
    "remark": "更新备注"    // 备注信息
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "更新成功",
    "data": null
  }
  ```

### 4. 删除田块作物关系

- **接口**: `/api/fieldcrop/delete/{id}`
- **方法**: DELETE
- **描述**: 根据ID删除田块作物关系记录
- **路径参数**:
  - `id`: 记录ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "删除成功",
    "data": null
  }
  ```

### 5. 批量删除田块作物关系

- **接口**: `/api/fieldcrop/batchDelete`
- **方法**: DELETE
- **描述**: 批量删除多条田块作物关系记录
- **请求体**:
  ```json
  [1, 2, 3]  // 要删除的记录ID列表
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "成功删除3条记录",
    "data": null
  }
  ```

### 6. 根据ID查询田块作物关系

- **接口**: `/api/fieldcrop/get/{id}`
- **方法**: GET
- **描述**: 根据ID查询田块作物关系记录
- **路径参数**:
  - `id`: 记录ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": 1,
      "fieldId": 1,
      "cropId": 1,
      "plantingYear": 2023,
      "plantMonth": 3,
      "plantArea": 10.5,
      "areaData": "[{...}]",
      "plantCount": 1000,
      "estimatedYield": 5000,
      "frameType": "篱架",
      "irrigationType": "滴灌",
      "fertilizationType": "有机肥",
      "estimatedIncome": 50000,
      "actualIncome": 48000,
      "status": 1,
      "remark": "备注信息",
      "createTime": "2023-04-01 10:00:00",
      "updateTime": "2023-04-01 10:00:00",
      "field": {
        // 关联的田块信息
      },
      "crop": {
        // 关联的作物信息
      }
    }
  }
  ```

### 7. 根据田块ID查询关联的作物关系

- **接口**: `/api/fieldcrop/getByFieldId/{fieldId}`
- **方法**: GET
- **描述**: 根据田块ID查询所有关联的作物关系记录
- **路径参数**:
  - `fieldId`: 田块ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "cropId": 1,
        // 其他字段...
      },
      {
        "id": 2,
        "fieldId": 1,
        "cropId": 2,
        // 其他字段...
      }
    ]
  }
  ```

### 8. 根据作物ID查询关联的田块关系

- **接口**: `/api/fieldcrop/getByCropId/{cropId}`
- **方法**: GET
- **描述**: 根据作物ID查询所有关联的田块关系记录
- **路径参数**:
  - `cropId`: 作物ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "cropId": 1,
        // 其他字段...
      },
      {
        "id": 3,
        "fieldId": 2,
        "cropId": 1,
        // 其他字段...
      }
    ]
  }
  ```

### 9. 根据年份、田块ID和作物ID查询田块作物关系

- **接口**: `/api/fieldcrop/getByYearAndIds`
- **方法**: GET
- **描述**: 根据种植年份、田块ID和作物ID查询田块作物关系记录
- **请求参数**:
  - `plantingYear`: 种植年份（必填）
  - `fieldId`: 田块ID（可选）
  - `cropId`: 作物ID（可选）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "cropId": 1,
        "plantingYear": 2023,
        "plantMonth": 3,
        "plantArea": 10.5,
        "areaData": "[{...}]",
        "plantCount": 1000,
        "estimatedYield": 5000,
        "frameType": "篱架",
        "irrigationType": "滴灌",
        "fertilizationType": "有机肥",
        "estimatedIncome": 50000,
        "actualIncome": 48000,
        "status": 1,
        "remark": "备注信息",
        "createTime": "2023-04-01 10:00:00",
        "updateTime": "2023-04-01 10:00:00",
        "field": {
          // 关联的田块信息
        },
        "crop": {
          // 关联的作物信息
        }
      }
    ]
  }
  ```

### 10. 查询所有田块作物关系

- **接口**: `/api/fieldcrop/list`
- **方法**: GET
- **描述**: 查询所有田块作物关系记录
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "cropId": 1,
        // 其他字段...
      },
      {
        "id": 2,
        "fieldId": 1,
        "cropId": 2,
        // 其他字段...
      }
      // 更多记录...
    ]
  }
  ```

### 11. 条件查询田块作物关系

- **接口**: `/api/fieldcrop/search`
- **方法**: GET
- **描述**: 根据条件查询田块作物关系记录
- **请求参数**:
  - `fieldId`: 田块ID（可选）
  - `cropId`: 作物ID（可选）
  - `plantingYear`: 种植年份（可选）
  - `status`: 状态（可选，0-已结束，1-生长中）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "cropId": 1,
        "plantingYear": 2023,
        "status": 1,
        // 其他字段...
      }
      // 更多记录...
    ]
  }
  ```

### 12. 分页查询

- **接口**: `/api/fieldcrop/page`
- **方法**: GET
- **描述**: 分页查询田块作物关系记录
- **请求参数**:
  - `pageNum`: 页码，默认1
  - `pageSize`: 每页记录数，默认10
  - `fieldId`: 田块ID（可选）
  - `cropId`: 作物ID（可选）
  - `plantingYear`: 种植年份（可选）
  - `status`: 状态（可选，0-已结束，1-生长中）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "records": [
        {
          "id": 1,
          "fieldId": 1,
          "cropId": 1,
          // 其他字段...
        }
        // 更多记录...
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

### 13. 更新状态

- **接口**: `/api/fieldcrop/updateStatus`
- **方法**: PUT
- **描述**: 更新田块作物关系的状态
- **请求参数**:
  - `id`: 记录ID
  - `status`: 新状态（0-已结束，1-生长中）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "状态更新成功",
    "data": null
  }
  ```

### 14. 导出Excel

- **接口**: `/api/fieldcrop/export`
- **方法**: GET
- **描述**: 导出田块作物关系数据为Excel文件
- **请求参数**:
  - `fieldId`: 田块ID（可选）
  - `cropId`: 作物ID（可选）
  - `plantingYear`: 种植年份（可选）
  - `status`: 状态（可选，0-已结束，1-生长中）
- **响应**: 直接下载Excel文件

### 15. 导入Excel

- **接口**: `/api/fieldcrop/import`
- **方法**: POST
- **描述**: 从Excel文件导入田块作物关系数据
- **请求**: `multipart/form-data`类型，包含名为`file`的Excel文件
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "成功导入15条记录",
    "data": null
  }
  ```

### 16. 按年度统计产量

- **接口**: `/api/fieldcrop/statsByYear`
- **方法**: GET
- **描述**: 按年份统计田块作物产量数据
- **请求参数**:
  - `fieldId`: 田块ID（可选）
  - `cropId`: 作物ID（可选）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "2021": 4500.5,
      "2022": 5200.0,
      "2023": 4800.0
    }
  }
  ```

### 17. 按作物类型统计种植面积

- **接口**: `/api/fieldcrop/statsByCrop`
- **方法**: GET
- **描述**: 按作物类型统计种植面积
- **请求参数**:
  - `plantingYear`: 种植年份（可选）
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "赤霞珠": 25.5,
      "梅鹿辄": 18.0,
      "霞多丽": 10.5,
      "品丽珠": 8.0
    }
  }
  ```

### 18. 获取田块使用情况

- **接口**: `/api/fieldcrop/fieldUsage/{fieldId}`
- **方法**: GET
- **描述**: 获取特定田块的使用情况统计
- **路径参数**:
  - `fieldId`: 田块ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "totalArea": 50.0,          // 田块总面积
      "usedArea": 42.5,           // 已使用面积
      "unusedArea": 7.5,          // 未使用面积
      "utilizationRate": 0.85,     // 利用率
      "crops": [                   // 种植的作物列表
        {
          "cropId": 1,
          "cropName": "赤霞珠",
          "plantArea": 25.5,
          "proportion": 0.60       // 占比
        },
        {
          "cropId": 2,
          "cropName": "梅鹿辄",
          "plantArea": 17.0,
          "proportion": 0.40       // 占比
        }
      ],
      "yearlyUsage": {            // 年度使用情况
        "2021": 35.0,
        "2022": 40.0,
        "2023": 42.5
      }
    }
  }
  ```

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有日期时间字段格式为：`yyyy-MM-dd HH:mm:ss`
2. 面积单位为亩，重量单位为千克，金额单位为元
3. 种植区域多边形坐标数据为JSON格式的字符串 