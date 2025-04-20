# 田块管理 API 文档

## 基础信息
- 基础路径：`/field`
- 所有接口返回格式：`Result<T>`
- 所有请求和响应均使用 JSON 格式

## 接口列表

### 1. 添加田块信息
- **接口说明**：添加新田块信息
- **请求方式**：POST
- **接口路径**：`/add`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | fieldCode | String | 是 | 田块编号，唯一标识 |
  | fieldName | String | 是 | 田块名称 |
  | area | BigDecimal | 是 | 面积（亩） |
  | soilType | String | 否 | 土壤类型 |
  | irrigationType | String | 否 | 灌溉方式 |
  | locationX | Double | 否 | 地理坐标X（经度） |
  | locationY | Double | 否 | 地理坐标Y（纬度） |
  | positionData | String | 否 | 田块多边形坐标数据(JSON格式) |
  | status | Integer | 否 | 状态：0-闲置，1-使用中，2-休耕 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "fieldCode": "FIELD001",
    "fieldName": "东区1号田",
    "area": 10.5,
    "soilType": "沙质土壤",
    "irrigationType": "滴灌",
    "locationX": 116.3250,
    "locationY": 39.9875,
    "positionData": "[{\"x\":116.3250,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9878},{\"x\":116.3250,\"y\":39.9878}]",
    "status": 1,
    "remark": "东区主要葡萄种植田块"
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
  - 400：田块编号已存在
  - 500：添加失败

### 2. 更新田块信息
- **接口说明**：更新田块信息
- **请求方式**：PUT
- **接口路径**：`/update`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 田块ID |
  | fieldCode | String | 是 | 田块编号，唯一标识 |
  | fieldName | String | 是 | 田块名称 |
  | area | BigDecimal | 是 | 面积（亩） |
  | soilType | String | 否 | 土壤类型 |
  | irrigationType | String | 否 | 灌溉方式 |
  | locationX | Double | 否 | 地理坐标X（经度） |
  | locationY | Double | 否 | 地理坐标Y（纬度） |
  | positionData | String | 否 | 田块多边形坐标数据(JSON格式) |
  | status | Integer | 是 | 状态：0-闲置，1-使用中，2-休耕 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "id": 1,
    "fieldCode": "FIELD001",
    "fieldName": "东区1号田（更新）",
    "area": 12.5,
    "soilType": "砂质壤土",
    "irrigationType": "喷灌",
    "locationX": 116.3250,
    "locationY": 39.9875,
    "positionData": "[{\"x\":116.3250,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9878},{\"x\":116.3250,\"y\":39.9878}]",
    "status": 1,
    "remark": "东区主要葡萄种植田块，已扩大面积"
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
  - 400：田块不存在
  - 400：田块编号已被其他田块使用
  - 500：更新失败

### 3. 删除田块
- **接口说明**：根据ID删除田块
- **请求方式**：DELETE
- **接口路径**：`/delete/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 田块ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "删除成功"
}
```
- **错误码**：
  - 400：田块不存在
  - 400：田块正在使用中，无法删除
  - 500：删除失败

### 4. 根据ID查询田块
- **接口说明**：根据ID查询田块详细信息
- **请求方式**：GET
- **接口路径**：`/get/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 田块ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "id": 1,
        "fieldCode": "FIELD001",
        "fieldName": "东区1号田",
        "area": 10.5,
        "soilType": "沙质土壤",
        "irrigationType": "滴灌",
        "locationX": 116.3250,
        "locationY": 39.9875,
        "positionData": "[{\"x\":116.3250,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9875},{\"x\":116.3253,\"y\":39.9878},{\"x\":116.3250,\"y\":39.9878}]",
        "status": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00",
        "remark": "东区主要葡萄种植田块"
    }
}
```

### 5. 根据田块编号查询田块
- **接口说明**：根据田块编号查询田块详细信息
- **请求方式**：GET
- **接口路径**：`/getByCode`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | fieldCode | String | 是 | 田块编号 |
- **响应示例**：与根据ID查询的响应格式相同

### 6. 查询所有田块
- **接口说明**：获取所有田块列表
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
            "fieldCode": "FIELD001",
            "fieldName": "东区1号田",
            "area": 10.5,
            "soilType": "沙质土壤",
            "status": 1
        },
        {
            "id": 2,
            "fieldCode": "FIELD002",
            "fieldName": "东区2号田",
            "area": 8.3,
            "soilType": "粘土",
            "status": 1
        }
    ]
}
```

### 7. 条件查询田块
- **接口说明**：根据条件查询田块列表
- **请求方式**：GET
- **接口路径**：`/search`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | fieldName | String | 否 | 田块名称（模糊查询） |
  | soilType | String | 否 | 土壤类型 |
  | status | Integer | 否 | 状态：0-闲置，1-使用中，2-休耕 |
- **响应示例**：与查询所有田块的响应格式相同

### 8. 分页查询田块
- **接口说明**：分页查询田块列表
- **请求方式**：GET
- **接口路径**：`/page`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | pageNum | Integer | 否 | 页码，默认1 |
  | pageSize | Integer | 否 | 每页数量，默认10 |
  | fieldName | String | 否 | 田块名称（模糊查询） |
  | soilType | String | 否 | 土壤类型 |
  | status | Integer | 否 | 状态：0-闲置，1-使用中，2-休耕 |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "total": 5,
        "list": [
            {
                "id": 1,
                "fieldCode": "FIELD001",
                "fieldName": "东区1号田",
                "area": 10.5,
                "soilType": "沙质土壤",
                "status": 1
            },
            {
                "id": 2,
                "fieldCode": "FIELD002",
                "fieldName": "东区2号田",
                "area": 8.3,
                "soilType": "粘土",
                "status": 1
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

### 9. 更新田块状态
- **接口说明**：更新田块状态
- **请求方式**：PUT
- **接口路径**：`/updateStatus`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 田块ID |
  | status | Integer | 是 | 状态：0-闲置，1-使用中，2-休耕 |
- **响应示例**：
```json
{
    "success": true,
    "message": "状态更新成功"
}
```
- **错误码**：
  - 400：田块不存在
  - 500：状态更新失败

## 数据字典
### 田块状态
- 0：闲置
- 1：使用中
- 2：休耕

### 土壤类型参考
- 沙质土壤
- 粘土
- 壤土
- 砂质壤土
- 粘质壤土 