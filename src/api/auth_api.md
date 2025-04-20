# 用户认证 API 文档

## 基础信息
- 基础路径：`/api/auth`
- 所有接口返回格式：`Result<T>`
- 所有请求和响应均使用 JSON 格式

## 接口列表

### 1. 用户注册
- **接口说明**：新用户注册
- **请求方式**：POST
- **接口路径**：`/register`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | username | String | 是 | 用户名 |
  | password | String | 是 | 密码 |
  | realName | String | 是 | 真实姓名 |
  | phone | String | 是 | 手机号码 |
  | email | String | 否 | 电子邮箱 |
- **请求示例**：
```json
{
    "username": "test_user",
    "password": "123456",
    "realName": "测试用户",
    "phone": "13800138000"
}
```
- **响应示例**：
```json
{
    "success": true,
    "message": "注册成功"
}
```
- **错误码**：
  - 400：用户名已存在
  - 400：手机号不能为空
  - 500：注册失败

### 2. 用户登录
- **接口说明**：用户登录，获取Token
- **请求方式**：POST
- **接口路径**：`/login`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | username | String | 是 | 用户名 |
  | password | String | 是 | 密码 |
- **响应示例**：
```json
{
    "success": true,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": "admin",
            "realName": "管理员",
            "status": 1
        }
    }
}
```
- **错误码**：
  - 400：用户名或密码错误
  - 403：账号已被禁用

### 3. Token刷新
- **接口说明**：刷新过期的Token
- **请求方式**：POST
- **接口路径**：`/refresh`
- **请求头**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | Authorization | String | 是 | Bearer Token |
- **响应示例**：
```json
{
    "success": true,
    "message": "刷新成功",
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **错误码**：
  - 401：Token无效或已过期
  - 500：Token刷新失败

## Token说明
1. Token格式：Bearer Token
2. Token有效期：3天
3. Token载荷：
   - id：用户ID
   - realName：用户真实姓名

## 注意事项
1. 密码在传输和存储时都会进行加密
2. Token需要在请求头中携带：`Authorization: Bearer <token>`
3. 建议在Token即将过期时调用刷新接口
4. 登录失败不会提示具体是用户名错误还是密码错误 