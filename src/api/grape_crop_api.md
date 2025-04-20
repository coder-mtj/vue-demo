# 葡萄作物管理 API 文档

## 基础信息
- 基础路径：`/crop`
- 所有接口返回格式：`Result<T>`
- 所有请求和响应均使用 JSON 格式

## 接口列表

### 1. 添加葡萄作物
- **接口说明**：添加新葡萄作物信息
- **请求方式**：POST
- **接口路径**：`/add`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | cropCode | String | 是 | 作物编号，唯一标识 |
  | cropName | String | 是 | 作物名称 |
  | cropType | String | 否 | 作物类型（默认：葡萄） |
  | variety | String | 是 | 葡萄品种（如：赤霞珠、霞多丽等） |
  | growthCycle | Integer | 否 | 生长周期（天） |
  | suitableSoil | String | 否 | 适宜土壤 |
  | suitableTemp | String | 否 | 适宜温度 |
  | plantDistance | BigDecimal | 否 | 建议株距（米） |
  | rowDistance | BigDecimal | 否 | 建议行距（米） |
  | waterDemand | String | 否 | 水分需求（高/中/低） |
  | fertilizerDemand | String | 否 | 肥料需求（高/中/低） |
  | pruningMethod | String | 否 | 推荐修剪方式 |
  | diseaseResistance | String | 否 | 抗病性（强/中/弱） |
  | pestResistance | String | 否 | 抗虫性（强/中/弱） |
  | color | String | 否 | 显示颜色（可视化用，如：#FF5733） |
  | icon | String | 否 | 图标URL |
  | status | Integer | 否 | 状态：0-停用，1-启用 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "cropCode": "GRAPE001",
    "cropName": "赤霞珠葡萄",
    "cropType": "葡萄",
    "variety": "赤霞珠",
    "growthCycle": 210,
    "suitableSoil": "石灰质土壤",
    "suitableTemp": "15-25℃",
    "plantDistance": 1.5,
    "rowDistance": 2.5,
    "waterDemand": "中",
    "fertilizerDemand": "中",
    "pruningMethod": "短梢修剪法",
    "diseaseResistance": "中",
    "pestResistance": "中",
    "color": "#8B0000",
    "icon": "red_wine_grape.png",
    "status": 1,
    "remark": "法国波尔多地区著名酿酒葡萄品种"
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
  - 400：作物编号已存在
  - 400：作物名称已存在
  - 500：添加失败

### 2. 更新葡萄作物
- **接口说明**：更新葡萄作物信息
- **请求方式**：PUT
- **接口路径**：`/update`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 作物ID |
  | cropCode | String | 是 | 作物编号，唯一标识 |
  | cropName | String | 是 | 作物名称 |
  | cropType | String | 否 | 作物类型 |
  | variety | String | 是 | 葡萄品种 |
  | growthCycle | Integer | 否 | 生长周期（天） |
  | suitableSoil | String | 否 | 适宜土壤 |
  | suitableTemp | String | 否 | 适宜温度 |
  | plantDistance | BigDecimal | 否 | 建议株距（米） |
  | rowDistance | BigDecimal | 否 | 建议行距（米） |
  | waterDemand | String | 否 | 水分需求 |
  | fertilizerDemand | String | 否 | 肥料需求 |
  | pruningMethod | String | 否 | 推荐修剪方式 |
  | diseaseResistance | String | 否 | 抗病性 |
  | pestResistance | String | 否 | 抗虫性 |
  | color | String | 否 | 显示颜色 |
  | icon | String | 否 | 图标URL |
  | status | Integer | 是 | 状态：0-停用，1-启用 |
  | remark | String | 否 | 备注信息 |
- **请求示例**：
```json
{
    "id": 1,
    "cropCode": "GRAPE001",
    "cropName": "赤霞珠葡萄",
    "cropType": "葡萄",
    "variety": "赤霞珠",
    "growthCycle": 200,
    "suitableSoil": "石灰质土壤、砂质土壤",
    "suitableTemp": "15-28℃",
    "plantDistance": 1.8,
    "rowDistance": 2.8,
    "waterDemand": "低",
    "fertilizerDemand": "中",
    "pruningMethod": "短梢修剪法",
    "diseaseResistance": "强",
    "pestResistance": "中",
    "color": "#8B0000",
    "icon": "red_wine_grape.png",
    "status": 1,
    "remark": "法国波尔多地区著名酿酒葡萄品种，更新后的信息"
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
  - 400：作物不存在
  - 400：作物编号已被其他作物使用
  - 400：作物名称已被其他作物使用
  - 500：更新失败

### 3. 删除葡萄作物
- **接口说明**：根据ID删除葡萄作物
- **请求方式**：DELETE
- **接口路径**：`/delete/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 作物ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "删除成功"
}
```
- **错误码**：
  - 400：作物不存在
  - 400：作物正在使用中，无法删除
  - 500：删除失败

### 4. 根据ID查询葡萄作物
- **接口说明**：根据ID查询葡萄作物详细信息
- **请求方式**：GET
- **接口路径**：`/get/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 作物ID |
- **响应示例**：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {
        "id": 1,
        "cropCode": "GRAPE001",
        "cropName": "赤霞珠葡萄",
        "cropType": "葡萄",
        "variety": "赤霞珠",
        "growthCycle": 210,
        "suitableSoil": "石灰质土壤",
        "suitableTemp": "15-25℃",
        "plantDistance": 1.5,
        "rowDistance": 2.5,
        "waterDemand": "中",
        "fertilizerDemand": "中",
        "pruningMethod": "短梢修剪法",
        "diseaseResistance": "中",
        "pestResistance": "中",
        "color": "#8B0000",
        "icon": "red_wine_grape.png",
        "status": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00",
        "remark": "法国波尔多地区著名酿酒葡萄品种"
    }
}
```

### 5. 根据作物编号查询葡萄作物
- **接口说明**：根据作物编号查询葡萄作物详细信息
- **请求方式**：GET
- **接口路径**：`/getByCode`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | cropCode | String | 是 | 作物编号 |
- **响应示例**：与根据ID查询的响应格式相同

### 6. 根据作物名称查询葡萄作物
- **接口说明**：根据作物名称查询葡萄作物详细信息
- **请求方式**：GET
- **接口路径**：`/getByName`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | cropName | String | 是 | 作物名称 |
- **响应示例**：与根据ID查询的响应格式相同

### 7. 查询所有葡萄作物
- **接口说明**：获取所有葡萄作物列表
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
            "cropCode": "GRAPE001",
            "cropName": "赤霞珠葡萄",
            "cropType": "葡萄",
            "variety": "赤霞珠",
            "color": "#8B0000",
            "status": 1
        },
        {
            "id": 2,
            "cropCode": "GRAPE002",
            "cropName": "霞多丽葡萄",
            "cropType": "葡萄",
            "variety": "霞多丽",
            "color": "#F0E68C",
            "status": 1
        }
    ]
}
```

### 8. 条件查询葡萄作物
- **接口说明**：根据条件查询葡萄作物列表
- **请求方式**：GET
- **接口路径**：`/search`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | cropType | String | 否 | 作物类型 |
  | variety | String | 否 | 葡萄品种（模糊查询） |
  | status | Integer | 否 | 状态：0-停用，1-启用 |
- **响应示例**：与查询所有葡萄作物的响应格式相同

### 9. 分页查询葡萄作物
- **接口说明**：分页查询葡萄作物列表
- **请求方式**：GET
- **接口路径**：`/page`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | pageNum | Integer | 否 | 页码，默认1 |
  | pageSize | Integer | 否 | 每页数量，默认10 |
  | cropType | String | 否 | 作物类型 |
  | variety | String | 否 | 葡萄品种（模糊查询） |
  | status | Integer | 否 | 状态：0-停用，1-启用 |
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
                "cropCode": "GRAPE001",
                "cropName": "赤霞珠葡萄",
                "cropType": "葡萄",
                "variety": "赤霞珠",
                "color": "#8B0000",
                "status": 1
            },
            {
                "id": 2,
                "cropCode": "GRAPE002",
                "cropName": "霞多丽葡萄",
                "cropType": "葡萄",
                "variety": "霞多丽",
                "color": "#F0E68C",
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

### 10. 更新葡萄作物状态
- **接口说明**：更新葡萄作物状态
- **请求方式**：PUT
- **接口路径**：`/updateStatus`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 作物ID |
  | status | Integer | 是 | 状态：0-停用，1-启用 |
- **响应示例**：
```json
{
    "success": true,
    "message": "状态更新成功"
}
```
- **错误码**：
  - 400：作物不存在
  - 500：状态更新失败

## 数据字典
### 作物状态
- 0：停用
- 1：启用

### 水分/肥料需求
- 高
- 中
- 低

### 抗病性/抗虫性
- 强
- 中
- 弱

### 常见葡萄品种
- 赤霞珠（Cabernet Sauvignon）
- 霞多丽（Chardonnay）
- 梅洛（Merlot）
- 黑皮诺（Pinot Noir）
- 长相思（Sauvignon Blanc）
- 西拉（Syrah）
- 蛇龙珠（Cabernet Gernischt）
- 玫瑰香（Rose Honey） 